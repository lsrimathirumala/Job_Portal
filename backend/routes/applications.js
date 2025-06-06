const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Candidate applies to a job
router.post('/', authenticateJWT, authorizeRoles('candidate'), async (req, res, next) => {
  try {
    console.log('Full user object from JWT:', req.user);
    const userId = req.user.userId;
    console.log('Extracted userId:', userId);

    if (!userId) {
      console.error('No user ID found in token');
      return res.status(401).json({ error: 'User ID missing from token' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID format:', userId);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const candidate = await Candidate.findOne({ userId: userId });
    console.log('Candidate search query:', { userId: userId });
    console.log('Found candidate:', candidate);

    if (!candidate) {
      console.error('No candidate found for user:', userId);
      return res.status(400).json({ error: 'Candidate profile not found for the user' });
    }

    const { jobId, coverLetter } = req.body;
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid or missing jobId' });
    }

    const job = await Job.findById(jobId);
    console.log('Job found:', job);
    if (!job || !job.isActive) {
      return res.status(400).json({ error: 'Invalid or inactive job' });
    }

    const existingApplication = await Application.findOne({
      jobId,
      candidateId: candidate._id,
    });
    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied to this job' });
    }

    const application = new Application({
      jobId,
      candidateId: candidate._id,
      coverLetter,
      status: 'Applied',
      appliedAt: new Date(),
    });

    await application.save();
    res.status(201).json(application);
  } catch (err) {
    console.error('Error in application POST route:', err);
    next(err);
  }
});

// Get Applications - support filtering by job or candidate, pagination, status
router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const {
      jobId,
      candidateId,
      status,
      page = 1,
      limit = 10,
      sortBy = 'appliedAt',
      sortOrder = 'desc',
    } = req.query;

    const filters = {};
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) filters.jobId = jobId;
    if (candidateId && mongoose.Types.ObjectId.isValid(candidateId)) filters.candidateId = candidateId;
    if (status) filters.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const applications = await Application.find(filters)
      .populate('jobId', 'jobTitle company location')
      .populate('candidateId', 'fullName email skills')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCount = await Application.countDocuments(filters);

    res.json({
      page: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      applications,
    });
  } catch (err) {
    next(err);
  }
});

// Update application status (for employers)
router.patch('/:id', authenticateJWT, authorizeRoles('employer'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Interview', 'Rejected', 'Hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json(application);
  } catch (err) {
    next(err);
  }
});

// Delete application (optional)
router.delete('/:id', authenticateJWT, authorizeRoles('candidate','employer'), async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    // Optional: Check if candidate owns the application or employer permission before deleting
    // For example:
    // if (req.user.role === 'candidate' && application.candidateId.toString() !== req.user.userId) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    await application.remove();
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;