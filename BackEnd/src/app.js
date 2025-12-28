const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// Public health check (does not trigger DB init)
app.get('/', (req, res) => {
  res.json({ message: 'LMS Backend API running 🚀' });
});

// Lazy DB initialization middleware for all API routes
const dbInitMiddleware = require('./middleware/dbInitMiddleware');
app.use('/api', dbInitMiddleware);

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/parents', require('./routes/parent.routes'));
app.use('/api/teachers', require('./routes/teacher.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/courses', require('./routes/course.routes'));

module.exports = app;
