const { ensureTablesExist } = require('../utils/dbInit');

// Course controller functions will be defined here

const getCourses = async (req, res) => {
  await ensureTablesExist();
  // Implementation
};

const getCourseById = async (req, res) => {
  // Implementation
};

module.exports = {
  getCourses,
  getCourseById
};