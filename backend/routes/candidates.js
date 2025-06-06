// routes/candidates.js

const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Create Candidate Profile - must be authenticated & candidate role
router.post('/', authenticateJWT, authorizeRoles('candidate'), async (req, res, next) => {
  try {
    const userId = req.user.userId.User || req.user.userId;
    console.log("Extracted userId:", userId, 'Type: ', typeof userId);
    // Check if candidate profile already exists for user
    const exists = await Candidate.findOne({ userId: userId.toString() });
    if (exists) {
      return res.status(409).json({ error: 'Candidate profile already exists for this user' });
    }

    const candidateData = {
      ...req.body,
      userId,
    };

    const candidate = new Candidate(candidateData);
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    next(err);
  }
});

// Update Candidate Profile - only owner allowed
router.patch('/:id', authenticateJWT, authorizeRoles('candidate'), async (req, res, next) => {
  try {
    const userId = req.user.userId.User || req.user.userId;
    const candidate = await Candidate.findOne({ userId: userId.toString() });

    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    if (!candidate.userId.equals(userId)) {
      return res.status(403).json({ error: 'Forbidden to update others\' profile' });
    }

    Object.assign(candidate, req.body);
    await candidate.save();

    res.json(candidate);
  } catch (err) {
    next(err);
  }
});

// Delete Candidate Profile - only owner allowed
router.delete('/:id', authenticateJWT, authorizeRoles('candidate'), async (req, res, next) => {
  try {
    const userId = req.user.userId.User || req.user.userId;
    const candidate = await Candidate.findOne({ userId: userId.toString() });

    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    if (!candidate.userId.equals(userId)) {
      return res.status(403).json({ error: 'Forbidden to delete others\' profile' });
    }

    await candidate.remove();
    res.json({ message: 'Candidate profile deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Search Candidates (public)
router.get('/', async (req, res, next) => {
  try {
    const { search, skills, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filters = {};
    if (search) filters.$text = { $search: search };
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      filters.skills = { $all: skillsArray };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const candidates = await Candidate.find(filters)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCount = await Candidate.countDocuments(filters);

    res.json({
      page: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      candidates,
    });
  } catch (err) {
    next(err);
  }
});

// Get Candidate by ID (public)
router.get('/:id', async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
