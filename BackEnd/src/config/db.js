const { Pool } = require('pg');
require('dotenv').config();

let dbConfig;

if (process.env.DATABASE_URL) {
  // Use the DATABASE_URL if provided (Prisma style)
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('pooler.supabase.com') ? { rejectUnauthorized: false } : false
  };
} else {
  const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';

  dbConfig = isProduction ? {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false },
  } : {
    host: process.env.LOCAL_DB_HOST || 'localhost',
    user: process.env.LOCAL_DB_USER || 'postgres',
    password: process.env.LOCAL_DB_PASSWORD || 'password',
    database: process.env.LOCAL_DB_NAME || 'abritech_db',
    port: parseInt(process.env.LOCAL_DB_PORT || '5432'),
  };
}

const pgPool = new Pool({
  ...dbConfig,
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 30000,
  max: 10,
});

const RESERVED_TABLES = ['user', 'session', 'role'];
const CAMEL_CASE_COLUMNS = [
  "userId", "contentUrl", "textContent", "orderNumber", "createdAt",
  "firstName", "lastName", "replyMessage", "repliedAt", "repliedBy",
  "youtubeLink", "isFree", "scholarshipAvailable", "hasDiscount", "discountPrice",
  "hasScholarship", "courseId", "summaryText", "accessType", "contentType",
  "isCurrentStudent", "classLevel", "educationLevel", "schoolName", "courseLevel",
  "parentEmail", "referralCode", "studentId", "progressPercentage", "timeSpentSeconds",
  "finalGrade", "enrolledAt", "lessonId", "completedAt", "parentId",
  "teacherId", "dueDate", "requiresApproval", "maxPoints", "updatedAt",
  "assignmentId", "submissionType", "submissionContent", "maxScore", "submittedAt",
  "githubLink", "imageUrl", "videoUrl", "isPublished", "linkedIn",
  "enrollmentId", "verificationCode", "issuedAt", "transactionId", "transactionReference",
  "paymentMethod", "phoneNumber", "eventId", "registeredAt", "quizId",
  "selectedOption", "isCorrect", "attemptNumber", "attemptedAt", "registerLink",
  "aiSummary", "userMessage", "aiResponse", "isRead", "coverImage",
  "createdBy", "optionA", "optionB", "optionC", "optionD", "correctOption",
  "maxAttempts", "badgeId", "awardedAt", "fullName", "passwordHash",
  "parentPhone", "roleId", "activeAt", "resetPasswordOtp", "firstLogin",
  "resetPasswordExpires", "lastLogin"
];

// Helper to convert '?' parameters to '$1, $2, ...' and handle PostgreSQL quoting
const transformSql = (sql) => {
  let transformed = sql;

  // 1. Convert ? to $n
  let index = 1;
  transformed = transformed.replace(/\?/g, () => `$${index++}`);

  // 2. Quote reserved table names and camelCase columns
  // Using look-behind/ahead to avoid double quoting and handle identifiers correctly
  const allIdentifiers = [...RESERVED_TABLES, ...CAMEL_CASE_COLUMNS];

  // Sort by length descending to match longest identifiers first (e.g., 'roleId' before 'role')
  allIdentifiers.sort((a, b) => b.length - a.length);

  allIdentifiers.forEach(id => {
    // Quote if NOT preceded or followed by a quote.
    // We ALLOW dots before it so u.roleId -> u."roleId"
    const regex = new RegExp(`(?<![\\"\\'])\\b${id}\\b(?![\\"\\'])`, 'gi');
    transformed = transformed.replace(regex, (match) => {
      // If it's preceded by a dot, we need to handle it carefully to avoid quoting the dot
      // But actually \b handles the boundary.
      const original = allIdentifiers.find(i => i.toLowerCase() === match.toLowerCase());
      return `"${original || match}"`;
    });
  });

  return transformed;
};

// Wrap the client to provide mysql2-like methods
const wrapClient = (client) => {
  return {
    ...client,
    execute: async (sql, params = []) => {
      let transformedSql = transformSql(sql);
      if (sql.trim().toUpperCase().startsWith('INSERT') && !sql.toUpperCase().includes('RETURNING')) {
        transformedSql += ' RETURNING id';
      }
      const res = await client.query(transformedSql, params);

      const resultObj = {
        affectedRows: res.rowCount,
        insertId: res.rows[0]?.id || null,
        length: res.rows.length
      };

      return [res.rows, resultObj];
    },
    query: async (sql, params = []) => {
      let transformedSql = transformSql(sql);
      if (sql.trim().toUpperCase().startsWith('INSERT') && !sql.toUpperCase().includes('RETURNING')) {
        transformedSql += ' RETURNING id';
      }
      const res = await client.query(transformedSql, params);

      const resultObj = {
        affectedRows: res.rowCount,
        insertId: res.rows[0]?.id || null,
        length: res.rows.length
      };

      return [res.rows, resultObj];
    },
    beginTransaction: () => client.query('BEGIN'),
    commit: () => client.query('COMMIT'),
    rollback: () => client.query('ROLLBACK'),
    release: () => client.release(),
  };
};

// Wrap the pool to provide mysql2-like methods
const pool = {
  execute: async (sql, params = []) => {
    let transformedSql = transformSql(sql);
    if (sql.trim().toUpperCase().startsWith('INSERT') && !sql.toUpperCase().includes('RETURNING')) {
      transformedSql += ' RETURNING id';
    }
    const res = await pgPool.query(transformedSql, params);

    const resultObj = {
      affectedRows: res.rowCount,
      insertId: res.rows[0]?.id || null,
      length: res.rows.length
    };

    return [res.rows, resultObj];
  },
  query: async (sql, params = []) => {
    let transformedSql = transformSql(sql);
    if (sql.trim().toUpperCase().startsWith('INSERT') && !sql.toUpperCase().includes('RETURNING')) {
      transformedSql += ' RETURNING id';
    }
    const res = await pgPool.query(transformedSql, params);

    const resultObj = {
      affectedRows: res.rowCount,
      insertId: res.rows[0]?.id || null,
      length: res.rows.length
    };

    return [res.rows, resultObj];
  },
  getConnection: async () => {
    const client = await pgPool.connect();
    return wrapClient(client);
  },
  end: () => pgPool.end(),
  on: (event, handler) => pgPool.on(event, handler),
  pgPool, // Export the raw pool for Prisma adapter
};

module.exports = pool;
