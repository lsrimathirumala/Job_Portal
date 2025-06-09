const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage config — resumes go to 'uploads/resumes'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
    fs.mkdir(uploadDir, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, uploadDir);
    });
  },
  filename: (req, file, cb) => {
    const userId = req.user.userId;
    const ext = path.extname(file.originalname);
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

// File filter: allow only PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowedTypes.test(file.mimetype);
  if (isValidExt && isValidMime) cb(null, true);
  else cb(new Error('Only PDF, DOC and DOCX files are allowed'));
};

const upload = multer({ storage, fileFilter });

// --- CREATE Candidate Profile ---
router.post('/', authenticateJWT, authorizeRoles('candidate'), async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const exists = await Candidate.findOne({ userId });

    if (exists) {
      return res.status(409).json({ error: 'Candidate profile already exists' });
    }

    const candidate = new Candidate({ ...req.body, userId });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    next(err);
  }
});

// --- UPDATE Candidate Profile ---
router.patch('/:id', authenticateJWT, authorizeRoles('candidate'), upload.single('resumeFile'), async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const candidateId = req.params.id;

    let candidate = await Candidate.findOne({
      $or: [{ userId: userId }, { _id: candidateId }],
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    // Ensure ownership
    if (!candidate.userId.equals(userId)) {
      return res.status(403).json({ error: 'Forbidden to update other user\'s profile' });
    }

    Object.assign(candidate, req.body);

    if (req.file) {
      candidate.resumeFile = {
        filename: req.file.filename,
        url: `/uploads/resumes/${req.file.filename}`,
      };
    }

    await candidate.save();
    res.json(candidate);
  } catch (err) {
    if (err instanceof multer.MulterError || err.message.includes('Only PDF')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// --- DELETE Candidate Profile ---
router.delete('/:id', authenticateJWT, authorizeRoles('candidate'), async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const candidate = await Candidate.findOne({ userId });

    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    if (!candidate.userId.equals(userId)) {
      return res.status(403).json({ error: 'Forbidden to delete others\' profile' });
    }

    // Delete resume file if exists
    if (candidate.resumeFile?.filename) {
      const filePath = path.join(__dirname, '..', 'uploads', 'resumes', candidate.resumeFile.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.warn('Could not delete resume file:', err.message);
      });
    }

    await candidate.remove();
    res.json({ message: 'Candidate profile deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// --- SEARCH Candidates ---
router.get('/', async (req, res, next) => {
  try {
    const { search, skills, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filters = {};
    if (search) filters.$text = { $search: search };
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
      filters.skills = { $all: skillsArray };
    }

    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

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

// --- GET Candidate by ID ---
router.get('/:id', async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    next(err);
  }
});

// --- UPLOAD Resume Only ---
router.post('/uploadResume', authenticateJWT, authorizeRoles('candidate'), upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    res.status(200).json({ resumeUrl });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ error: 'Resume upload failed' });
  }
});

module.exports = router;
