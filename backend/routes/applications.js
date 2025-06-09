const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Helper function to validate IDs
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper function to handle population errors
const safePopulate = async (query, populateOptions) => {
  try {
    return await query.populate(populateOptions).exec();
  } catch (err) {
    console.error('Population error:', err);
    return query.exec();
  }
};

// Candidate applies to a job
router.post('/', authenticateJWT, authorizeRoles('candidate'), async (req, res, next) => {
  try {
    const userId = req.user.userId;

    if (!isValidId(userId)) {
      return res.status(400).json({ 
        error: 'Invalid user ID format',
        code: 'INVALID_USER_ID'
      });
    }

    const candidate = await Candidate.findOne({ userId });
    if (!candidate) {
      return res.status(404).json({ 
        error: 'Candidate profile not found',
        code: 'CANDIDATE_NOT_FOUND'
      });
    }

    const { jobId, coverLetter } = req.body;
    if (!isValidId(jobId)) {
      return res.status(400).json({ 
        error: 'Invalid job ID',
        code: 'INVALID_JOB_ID'
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ 
        error: 'Job not found',
        code: 'JOB_NOT_FOUND'
      });
    }
    if (!job.isActive) {
      return res.status(400).json({ 
        error: 'Job is no longer active',
        code: 'JOB_INACTIVE'
      });
    }

    const existingApplication = await Application.findOne({
      jobId,
      candidateId: candidate._id,
    });
    if (existingApplication) {
      return res.status(409).json({ 
        error: 'Already applied to this job',
        code: 'DUPLICATE_APPLICATION'
      });
    }

    const application = await Application.create({
      jobId,
      candidateId: candidate._id,
      coverLetter: coverLetter || '',
      status: 'Applied',
      appliedAt: new Date(),
    });

    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
});

// Get candidate's applications
router.get('/my-applications', authenticateJWT, authorizeRoles('candidate'), async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.user.userId });
    if (!candidate) {
      return res.status(404).json({ 
        error: 'Candidate profile not found',
        code: 'CANDIDATE_NOT_FOUND'
      });
    }

    let applications = await Application.find({ candidateId: candidate._id })
      .populate({
        path: 'jobId',
        select: 'title company location salary employmentType isActive',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .sort({ appliedAt: -1 })
      .lean();

    // Filter out applications with deleted jobs
    applications = applications.filter(app => app.jobId);

    res.json(applications);
  } catch (err) {
    next(err);
  }
});

// Get applications for employer's jobs
router.get('/employer', authenticateJWT, authorizeRoles('employer'), async (req, res, next) => {
  try {
    if (!isValidId(req.user.userId)) {
      return res.status(400).json({ 
        error: 'Invalid employer ID',
        code: 'INVALID_EMPLOYER_ID'
      });
    }

    // Find all jobs for this employer
    const jobs = await Job.find({ employerId: req.user.userId }).select('_id');
    
    if (!jobs.length) {
      return res.status(404).json({
        error: "No jobs posted yet",
        code: "NO_JOBS_POSTED",
        applications: []
      });
    }

    // Find applications for these jobs
    let applications = await Application.find({ 
      jobId: { $in: jobs.map(j => j._id) }
    })
    .populate({
      path: 'jobId',
      select: 'title company location employmentType isActive',
      populate: {
        path: 'company',
        select: 'name'
      }
    })
    .populate({
      path: 'candidateId',
      select: 'fullName email skills isActive'
    })
    .sort({ appliedAt: -1 })
    .lean();

    // Filter out invalid applications
    applications = applications.filter(app => 
      app.jobId && app.candidateId && app.jobId.isActive
    );

    res.json(applications);
  } catch (err) {
    next(err);
  }
});

// Get single application by ID
router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ 
        error: 'Invalid application ID',
        code: 'INVALID_APPLICATION_ID'
      });
    }

    let application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId')
      .lean();

    if (!application) {
      return res.status(404).json({ 
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND'
      });
    }

    // Check if referenced job exists
    if (!application.jobId) {
      return res.status(404).json({
        error: 'Associated job not found',
        code: 'JOB_NOT_FOUND'
      });
    }

    // Authorization checks
    if (req.user.role === 'candidate') {
      if (!application.candidateId || application.candidateId.userId.toString() !== req.user.userId) {
        return res.status(403).json({ 
          error: 'Unauthorized to view this application',
          code: 'UNAUTHORIZED_ACCESS'
        });
      }
    }

    if (req.user.role === 'employer') {
      if (application.jobId.employerId.toString() !== req.user.userId) {
        return res.status(403).json({ 
          error: 'Unauthorized to view this application',
          code: 'UNAUTHORIZED_ACCESS'
        });
      }
    }

    res.json(application);
  } catch (err) {
    next(err);
  }
});

// Update application status
router.patch('/:id', authenticateJWT, authorizeRoles('employer'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Interview', 'Rejected', 'Hired'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status value',
        code: 'INVALID_STATUS'
      });
    }

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ 
        error: 'Invalid application ID',
        code: 'INVALID_APPLICATION_ID'
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ 
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND'
      });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ 
        error: 'Associated job not found',
        code: 'JOB_NOT_FOUND'
      });
    }

    if (job.employerId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        error: 'Unauthorized to update this application',
        code: 'UNAUTHORIZED_ACCESS'
      });
    }

    application.status = status;
    const updatedApplication = await application.save();

    // Safe populate to avoid errors if references are broken
    const populatedApplication = await safePopulate(
      Application.findById(updatedApplication._id),
      [
        { path: 'jobId', select: 'title company' },
        { path: 'candidateId', select: 'fullName email' }
      ]
    );

    res.json(populatedApplication || updatedApplication);
  } catch (err) {
    next(err);
  }
});

// Delete application
router.delete('/:id', authenticateJWT, authorizeRoles('candidate', 'employer'), async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ 
        error: 'Invalid application ID',
        code: 'INVALID_APPLICATION_ID'
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ 
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND'
      });
    }

    if (req.user.role === 'candidate') {
      const candidate = await Candidate.findOne({ userId: req.user.userId });
      if (!candidate || !application.candidateId.equals(candidate._id)) {
        return res.status(403).json({ 
          error: 'Unauthorized to delete this application',
          code: 'UNAUTHORIZED_ACCESS'
        });
      }
    } else if (req.user.role === 'employer') {
      const job = await Job.findById(application.jobId);
      if (!job || job.employerId.toString() !== req.user.userId) {
        return res.status(403).json({ 
          error: 'Unauthorized to delete this application',
          code: 'UNAUTHORIZED_ACCESS'
        });
      }
    }

    await application.deleteOne();
    res.json({ 
      message: 'Application deleted successfully',
      deletedId: req.params.id
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;