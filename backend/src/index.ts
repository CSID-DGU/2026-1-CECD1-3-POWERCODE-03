import express from 'express';
import cors from 'cors';
import { PORT } from './config/jwt.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev/testing. Adjust for production.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route connections
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'An unexpected error occurred on the server' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==========================================`);
  console.log(`  User Management Service running on:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`==========================================`);
});
