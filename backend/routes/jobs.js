const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { authorizeRoles } = require('../middleware/auth');

// Create a new job - only employer can post
router.post('/', authorizeRoles('employer'), async (req, res, next) => {
  try {
    const {
      jobTitle,
      company,
      location,
      description,
      requirements,
      salary,
      industry,
      skills,
    } = req.body;

    // Optional: Validate required fields here or rely on Mongoose schema validation

    const job = new Job({
      jobTitle,
      company,
      location,
      description,
      requirements,
      salary,
      industry,
      skills,
    });

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    next(err); // Pass error to express error handler
  }
});

// Get list of jobs with optional search and location filters - accessible to any authenticated user
router.get('/', async (req, res, next) => {
  try {
    const { search, location } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i'); // case-insensitive regex
      query.jobTitle = searchRegex;
    }
    if (location) {
      const locationRegex = new RegExp(location, 'i');
      query.location = locationRegex;
    }

    const jobs = await Job.find(query);
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
});

// Get job details by ID
router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
});

module.exports = router;