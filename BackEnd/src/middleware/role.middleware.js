// Role middleware will be defined here

const checkRole = (roles) => {
  return (req, res, next) => {
    // Implementation
    next();
  };
};

module.exports = {
  checkRole
};