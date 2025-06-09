require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json()); // modern replacement for bodyParser.json()

// Serve uploaded resume files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (!mongoURI) {
  console.error('Error: MONGO_URI env var missing');
  process.exit(1);
}

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const candidateRoutes = require('./routes/candidates');
const applicationRoutes = require('./routes/applications');
const analyticsRoutes = require('./routes/analytics');
const { authenticateJWT } = require('./middleware/auth');

app.use('/api/auth', authRoutes); // Public routes

// Make GET /api/jobs and GET /api/jobs/:id public (no auth)
app.use('/api/jobs', (req, res, next) => {
  if (req.method === 'GET') return next();
  authenticateJWT(req, res, next);
});
app.use('/api/jobs', jobRoutes);

// Other protected routes
app.use('/api/candidates', authenticateJWT, candidateRoutes);
app.use('/api/applications', authenticateJWT, applicationRoutes);
app.use('/api/analytics', authenticateJWT, analyticsRoutes);

// Global error handler (includes multer errors)
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle multer file upload errors gracefully
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
