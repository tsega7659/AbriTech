const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { pgPool } = require('./db');

const adapter = new PrismaPg(pgPool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
