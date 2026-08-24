const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { generalLimiter } = require('./middleware/rateLimit.middleware');

const app = express();

app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Handled per-frontend deployment
}));

const rawAllowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
  'https://www.abritechet.com',
  'https://abritechet.com',
  'https://abritech.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean).map(url => url.trim().replace(/\/+$/, ''));

const allowedOriginsSet = new Set(rawAllowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.trim().replace(/\/+$/, '');
    if (allowedOriginsSet.has(normalizedOrigin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy error: Origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'chapa-signature']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: 'AbriTech Backend API running 🚀', status: 'online' });
});

const dbInitMiddleware = require('./middleware/dbInitMiddleware');
app.use('/api', dbInitMiddleware);

app.use('/api', generalLimiter);

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/parents', require('./routes/parent.routes'));
app.use('/api/teachers', require('./routes/teacher.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/blogs', require('./routes/blog.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/assignments', require('./routes/assignment.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/payments', require('./routes/payment.routes'));

const errorMiddleware = require('./middleware/error.middleware');
app.use(errorMiddleware);

module.exports = app;

