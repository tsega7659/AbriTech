const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  accelerateUrl: "dummy"
});

module.exports = prisma;
