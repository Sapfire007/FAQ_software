const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Validate required environment variables
function validateEnv() {
  const required = ['MONGODB_URI', 'CLIENT_URL'];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`❌ Missing required env var: ${key}`);
      process.exit(1);
    }
  }
  console.log('✅ Environment variables validated');
}
validateEnv();

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => req.method === 'GET' // Don't limit read operations
});

const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window for POST
  max: 5, // Strict limit on write operations (5 per minute)
  message: 'Too many POST requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'POST' // Only apply to POST
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(helmet());

// Custom morgan format to avoid logging sensitive data
morgan.token('sanitized-url', (req) => {
  const url = req.originalUrl;
  // Hide any sensitive patterns in URLs
  return url.replace(/token=\w+/gi, 'token=***');
});
app.use(morgan(':method :sanitized-url :status :response-time ms'));

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Disable ETag and set cache control for all API routes
app.use('/api', (req, res, next) => {
  res.set('ETag', 'false');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Routes
const faqRoutes = require('./routes/faq');
app.use('/api/faqs', postLimiter, faqRoutes); // Apply stricter POST limiting here

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', msg: 'Yaksha Backend is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  // Rate limit error
  if (err.status === 429) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  // Generic error
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

// Database connection & Server start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('your_mongodb_cluster_connection_string_here')) {
    console.warn("⚠️  WARNING: MONGODB_URI is not set properly. Connection will fail.");
    process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  // Security options for MongoDB
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
})
  .then(() => {
    console.log('✅ MongoDB connected securely');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
