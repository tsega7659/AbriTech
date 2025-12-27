const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/parents', require('./routes/parent.routes'));
app.use('/api/teachers', require('./routes/teacher.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/courses', require('./routes/course.routes'));


// Health check
app.get('/', (req, res) => {
  res.json({ message: 'LMS Backend API running 🚀' });
});

module.exports = app;
