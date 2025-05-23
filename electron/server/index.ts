import express from 'express';
import cors from 'cors';
import { apiRoutes } from './routes/api';

// Create Express server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Start server
export function startServer(port: number) {
  app.listen(port, () => {
    console.log(`Express server running at http://localhost:${port}`);
  });
}