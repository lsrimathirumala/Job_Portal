const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');

// Number of jobs posted per industry
router.get('/jobs-per-industry', async (req, res, next) => {
  try {
    const data = await Job.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$industry",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Most in-demand skills (from jobs)
router.get('/top-skills', async (req, res, next) => {
  try {
    const data = await Job.aggregate([
      { $unwind: "$skills" },
      {
        $group: {
          _id: "$skills",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Average salary range by job title
router.get('/average-salary', async (req, res, next) => {
  try {
    const data = await Job.aggregate([
      { $match: { isActive: true, "salary.min": { $exists: true }, "salary.max": { $exists: true } } },
      {
        $group: {
          _id: "$jobTitle",
          avgMinSalary: { $avg: "$salary.min" },
          avgMaxSalary: { $avg: "$salary.max" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Application trends over time (monthly application counts)
router.get('/application-trends', async (req, res, next) => {
  try {
    const data = await Application.aggregate([
      {
        $group: {
          _id: { year: { $year: "$appliedAt" }, month: { $month: "$appliedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    // Format result: [{ year, month, count },...]
    const formatted = data.map(d => ({
      year: d._id.year,
      month: d._id.month,
      count: d.count,
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

module.exports = router;