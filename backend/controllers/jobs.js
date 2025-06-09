const Job = require('../models/Job');
const Employer = require('../models/Employer');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };
  
  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  
  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);
  
  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  // Finding resource
  let query = Job.find(JSON.parse(queryStr)).populate('employerId');
  
  // Search
  if (req.query.search) {
    query = query.find({ $text: { $search: req.query.search } });
  }
  
  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  
  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-postedDate');
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Job.countDocuments(JSON.parse(queryStr));
  
  if (req.query.search) {
    total = await Job.countDocuments({ $text: { $search: req.query.search } });
  }
  
  query = query.skip(startIndex).limit(limit);
  
  // Executing query
  const jobs = await query;
  
  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  res.status(200).json({
    success: true,
    count: jobs.length,
    pagination,
    data: jobs
  });
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate('employerId');
  
  if (!job) {
    return next(
      new ErrorResponse(`Job not found with id of ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: job
  });
});

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (Employer)
exports.createJob = asyncHandler(async (req, res, next) => {
  // Add employer to req.body
  req.body.employerId = req.user.id;
  
  // Check if employer profile exists
  const employer = await Employer.findOne({ userId: req.user.id });
  
  if (!employer) {
    return next(
      new ErrorResponse(`Employer profile not found for user ${req.user.id}`, 404)
    );
  }
  
  const job = await Job.create(req.body);
  
  res.status(201).json({
    success: true,
    data: job
  });
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer)
exports.updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  
  if (!job) {
    return next(
      new ErrorResponse(`Job not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure user is job owner
  if (job.employerId.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this job`, 401)
    );
  }
  
  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: job
  });
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer)
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  
  if (!job) {
    return next(
      new ErrorResponse(`Job not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure user is job owner
  if (job.employerId.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete this job`, 401)
    );
  }
  
  await job.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});