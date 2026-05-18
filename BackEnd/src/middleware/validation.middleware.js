const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const issues = error.issues || error.errors;
    if (issues && Array.isArray(issues)) {
      const formattedErrors = issues.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: formattedErrors.map(e => e.message) // Match existing frontend error handling
      });
    }
    next(error);
  }
};

module.exports = { validate };
