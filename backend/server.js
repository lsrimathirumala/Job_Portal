require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

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

// Protected routes
app.use('/api/jobs', authenticateJWT, jobRoutes);
app.use('/api/candidates', authenticateJWT, candidateRoutes);
app.use('/api/applications', authenticateJWT, applicationRoutes);
app.use('/api/analytics', authenticateJWT, analyticsRoutes);

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});