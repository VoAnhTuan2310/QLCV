import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routesV1 from './routes/v1';
import { errorHandler } from './middlewares/error.middleware';
import { swaggerDocument } from './docs/swagger';

const app: Application = express();

// Security Middlewares (Helmet + Enhanced CORS)
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Swagger Documentation API Route
app.get('/api-docs/json', (_req, res) => {
  res.status(200).json(swaggerDocument);
});

// API Routes V1
app.use('/api/v1', routesV1);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
