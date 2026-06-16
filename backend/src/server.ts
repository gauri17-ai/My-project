import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/routes';
import projectRoutes from './modules/projects/routes';
import chatRoutes from './modules/chat/routes';
import requirementRoutes from './modules/requirements/routes';
import recommendRoutes from './modules/recommend/routes';
import docRoutes from './modules/docs/routes';
import adminRoutes from './modules/users/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // For MVP/development, allow all origins
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/docs', docRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint (DEP-009)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    },
    message: 'Server is running and healthy'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
