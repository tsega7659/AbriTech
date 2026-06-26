// src/utils/schema.js

/**
 * Schema definition for the database.
 * Each entry includes the table name and its SQL definition.
 * The system will use this to automatically create or update tables.
 */
const schema = [
  {
    table: 'role',
    sql: `CREATE TABLE IF NOT EXISTS role (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL
    )`
  },
  {
    table: 'user',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'fullName', type: 'VARCHAR(255) NOT NULL' },
      { name: 'gender', type: 'VARCHAR(255)' },
      { name: 'username', type: 'VARCHAR(255) UNIQUE NOT NULL' },
      { name: 'email', type: 'VARCHAR(255) UNIQUE NOT NULL' },
      { name: 'passwordHash', type: 'VARCHAR(255) NOT NULL' },
      { name: 'phoneNumber', type: 'VARCHAR(255)' },
      { name: 'parentPhone', type: 'VARCHAR(255)' },
      { name: 'address', type: 'TEXT' },
      { name: 'roleId', type: 'INT NOT NULL' },
      { name: 'firstLogin', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'resetPasswordOtp', type: 'VARCHAR(10)' },
      { name: 'resetPasswordExpires', type: 'TIMESTAMP' },
      { name: 'lastLogin', type: 'TIMESTAMP' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (roleId) REFERENCES role(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS "user" (
      id BIGSERIAL PRIMARY KEY,
      fullName VARCHAR(255) NOT NULL,
      gender VARCHAR(255),
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      passwordHash VARCHAR(255) NOT NULL,
      phoneNumber VARCHAR(255),
      parentPhone VARCHAR(255),
      address TEXT,
      roleId INT NOT NULL,
      firstLogin BOOLEAN DEFAULT TRUE,
      resetPasswordOtp VARCHAR(10),
      resetPasswordExpires TIMESTAMP,
      "lastLogin" TIMESTAMP,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roleId) REFERENCES role(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'student',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'userId', type: 'BIGINT UNIQUE NOT NULL' },
      { name: 'isCurrentStudent', type: 'BOOLEAN NOT NULL' },
      { name: 'classLevel', type: 'VARCHAR(255)' },
      { name: 'educationLevel', type: 'VARCHAR(255)' },
      { name: 'schoolName', type: 'VARCHAR(255)' },
      { name: 'courseLevel', type: "VARCHAR(255) NOT NULL" },
      { name: 'parentEmail', type: 'VARCHAR(255)' },
      { name: 'referralCode', type: 'VARCHAR(255) UNIQUE' },
      { name: 'bio', type: 'TEXT' },
      { name: 'profileImage', type: 'VARCHAR(1000)' },
      { name: 'age', type: 'INT' },
      { name: 'socialLinks', type: 'JSONB DEFAULT \'{}\'' }
    ],
    foreignKeys: [
      'FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS student (
      id BIGSERIAL PRIMARY KEY,
      userId BIGINT UNIQUE NOT NULL,
      isCurrentStudent BOOLEAN NOT NULL,
      classLevel VARCHAR(255),
      educationLevel VARCHAR(255),
      schoolName VARCHAR(255),
      courseLevel VARCHAR(255) NOT NULL,
      parentEmail VARCHAR(255),
      referralCode VARCHAR(255) UNIQUE,
      bio TEXT,
      "profileImage" VARCHAR(1000),
      age INT,
      "socialLinks" JSONB DEFAULT '{}',
      FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'parent',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'userId', type: 'BIGINT UNIQUE NOT NULL' }
    ],
    foreignKeys: [
      'FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS parent (
      id BIGSERIAL PRIMARY KEY,
      userId BIGINT UNIQUE NOT NULL,
      FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'parentstudent',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'parentId', type: 'BIGINT NOT NULL' },
      { name: 'studentId', type: 'BIGINT NOT NULL' }
    ],
    foreignKeys: [
      'FOREIGN KEY (parentId) REFERENCES parent(id) ON DELETE CASCADE',
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS parentstudent (
      id BIGSERIAL PRIMARY KEY,
      parentId BIGINT NOT NULL,
      studentId BIGINT NOT NULL,
      FOREIGN KEY (parentId) REFERENCES parent(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'teacher',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'userId', type: 'BIGINT UNIQUE NOT NULL' },
      { name: 'specialization', type: 'VARCHAR(255)' }
    ],
    foreignKeys: [
      'FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS teacher (
      id BIGSERIAL PRIMARY KEY,
      userId BIGINT UNIQUE NOT NULL,
      specialization VARCHAR(255),
      FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'course',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'name', type: 'VARCHAR(255) NOT NULL' },
      { name: 'category', type: 'VARCHAR(255) NOT NULL' },
      { name: 'level', type: "VARCHAR(255) NOT NULL" },
      { name: 'youtubeLink', type: 'VARCHAR(255) NOT NULL' },
      { name: 'image', type: 'VARCHAR(255)' },
      { name: 'description', type: 'TEXT' },
      { name: 'duration', type: 'VARCHAR(255)' },
      { name: 'price', type: 'DECIMAL(10, 2) DEFAULT 0' },
      { name: 'isFree', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'hasDiscount', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'discountPrice', type: 'DECIMAL(10, 2)' },
      { name: 'hasScholarship', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    sql: `CREATE TABLE IF NOT EXISTS course (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      level VARCHAR(255) NOT NULL,
      youtubeLink VARCHAR(255) NOT NULL,
      image VARCHAR(255),
      description TEXT,
      duration VARCHAR(255),
      price DECIMAL(10, 2) DEFAULT 0,
      isFree BOOLEAN DEFAULT TRUE,
      hasDiscount BOOLEAN DEFAULT FALSE,
      discountPrice DECIMAL(10, 2),
      hasScholarship BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    table: 'teachercourse',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'teacherId', type: 'BIGINT NOT NULL' },
      { name: 'courseId', type: 'BIGINT NOT NULL' }
    ],
    foreignKeys: [
      'FOREIGN KEY (teacherId) REFERENCES teacher(id) ON DELETE CASCADE',
      'FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS teachercourse (
      id BIGSERIAL PRIMARY KEY,
      teacherId BIGINT NOT NULL,
      courseId BIGINT NOT NULL,
      FOREIGN KEY (teacherId) REFERENCES teacher(id) ON DELETE CASCADE,
      FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'enrollment',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'courseId', type: 'BIGINT NOT NULL' },
      { name: 'progressPercentage', type: 'FLOAT DEFAULT 0' },
      { name: 'timeSpentSeconds', type: 'INT DEFAULT 0' },
      { name: 'status', type: "VARCHAR(255) DEFAULT 'active'" },
      { name: 'enrolledAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE',
      'FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS enrollment (
      id BIGSERIAL PRIMARY KEY,
      "studentId" BIGINT NOT NULL,
      "courseId" BIGINT NOT NULL,
      "progressPercentage" FLOAT DEFAULT 0,
      "timeSpentSeconds" INT DEFAULT 0,
      status VARCHAR(255) DEFAULT 'active',
      "enrolledAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("studentId") REFERENCES student(id) ON DELETE CASCADE,
      FOREIGN KEY ("courseId") REFERENCES course(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'lesson',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'courseId', type: 'BIGINT NOT NULL' },
      { name: 'title', type: 'VARCHAR(255) NOT NULL' },
      { name: 'description', type: 'TEXT NOT NULL' },
      { name: 'summaryText', type: 'TEXT' },
      { name: 'contentType', type: "VARCHAR(255) DEFAULT 'lesson'" },
      { name: 'type', type: "VARCHAR(255) DEFAULT 'text'" },
      { name: 'contentUrl', type: 'VARCHAR(1000)' },
      { name: 'textContent', type: 'TEXT' },
      { name: 'accessType', type: "VARCHAR(255) DEFAULT 'free'" }
    ],
    foreignKeys: [
      'FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS lesson (
      id BIGSERIAL PRIMARY KEY,
      courseId BIGINT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      summaryText TEXT,
      orderNumber INT NOT NULL,
      contentType VARCHAR(255) DEFAULT 'lesson',
      type VARCHAR(255) DEFAULT 'text',
      contentUrl VARCHAR(1000),
      textContent TEXT,
      accessType VARCHAR(255) DEFAULT 'free',
      FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'lesson_resource',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'lessonId', type: 'BIGINT NOT NULL' },
      { name: 'type', type: "VARCHAR(255) NOT NULL" },
      { name: 'contentUrl', type: 'VARCHAR(1000)' },
      { name: 'textContent', type: 'TEXT' },
      { name: 'orderNumber', type: 'INT DEFAULT 1' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS lesson_resource (
      id BIGSERIAL PRIMARY KEY,
      lessonid BIGINT NOT NULL,
      type VARCHAR(255) NOT NULL,
      contenturl VARCHAR(1000),
      textcontent TEXT,
      ordernumber INT DEFAULT 1,
      createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lessonid) REFERENCES lesson(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'lessonprogress',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'lessonId', type: 'BIGINT NOT NULL' },
      { name: 'completed', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'completedAt', type: 'TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE',
      'FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS lessonprogress (
      id BIGSERIAL PRIMARY KEY,
      studentId BIGINT NOT NULL,
      lessonId BIGINT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      completedAt TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE,
      FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'lessonquiz',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'lessonId', type: 'BIGINT NOT NULL' },
      { name: 'question', type: 'TEXT NOT NULL' },
      { name: 'optionA', type: 'VARCHAR(255) NOT NULL' },
      { name: 'optionB', type: 'VARCHAR(255) NOT NULL' },
      { name: 'optionC', type: 'VARCHAR(255) NOT NULL' },
      { name: 'optionD', type: 'VARCHAR(255) NOT NULL' },
      { name: 'correctOption', type: 'VARCHAR(255) NOT NULL' },
      { name: 'maxAttempts', type: 'INT DEFAULT 2' }
    ],
    foreignKeys: [
      'FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS lessonquiz (
      id BIGSERIAL PRIMARY KEY,
      lessonId BIGINT NOT NULL,
      question TEXT NOT NULL,
      optionA VARCHAR(255) NOT NULL,
      optionB VARCHAR(255) NOT NULL,
      optionC VARCHAR(255) NOT NULL,
      optionD VARCHAR(255) NOT NULL,
      correctOption VARCHAR(255) NOT NULL,
      maxAttempts INT DEFAULT 2,
      FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'quizattempt',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'quizId', type: 'BIGINT NOT NULL' },
      { name: 'selectedOption', type: 'VARCHAR(255) NOT NULL' },
      { name: 'isCorrect', type: 'BOOLEAN NOT NULL' },
      { name: 'attemptNumber', type: 'INT NOT NULL' },
      { name: 'result', type: "VARCHAR(255) NOT NULL" },
      { name: 'attemptedAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE',
      'FOREIGN KEY (quizId) REFERENCES lessonquiz(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS quizattempt (
      id BIGSERIAL PRIMARY KEY,
      studentId BIGINT NOT NULL,
      quizId BIGINT NOT NULL,
      selectedOption VARCHAR(255) NOT NULL,
      isCorrect BOOLEAN NOT NULL,
      attemptNumber INT NOT NULL,
      result VARCHAR(255) NOT NULL,
      attemptedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE,
      FOREIGN KEY (quizId) REFERENCES lessonquiz(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'assignment',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'courseId', type: 'BIGINT NOT NULL' },
      { name: 'title', type: 'VARCHAR(255) NOT NULL' },
      { name: 'description', type: 'TEXT NOT NULL' },
      { name: 'orderNumber', type: 'INT DEFAULT 1' },
      { name: 'dueDate', type: 'TIMESTAMP' },
      { name: 'requiresApproval', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'maxPoints', type: 'INT DEFAULT 100' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS assignment (
      id BIGSERIAL PRIMARY KEY,
      "courseId" BIGINT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      "orderNumber" INT DEFAULT 1,
      "dueDate" TIMESTAMP,
      "requiresApproval" BOOLEAN DEFAULT TRUE,
      "maxPoints" INT DEFAULT 100,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("courseId") REFERENCES course(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'assignmentsubmission',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'assignmentId', type: 'BIGINT NOT NULL' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'submissionType', type: "VARCHAR(255) NOT NULL" },
      { name: 'submissionContent', type: 'TEXT NOT NULL' },
      { name: 'fileUrl', type: 'VARCHAR(1000)' },
      { name: 'textContent', type: 'TEXT' },
      { name: 'status', type: "VARCHAR(255) DEFAULT 'draft'" },
      { name: 'result', type: "VARCHAR(255)" },
      { name: 'score', type: 'FLOAT DEFAULT NULL' },
      { name: 'maxScore', type: 'INT DEFAULT 100' },
      { name: 'feedback', type: 'TEXT' },
      { name: 'submittedAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      { name: 'fk_assignment', type: 'FOREIGN KEY (assignmentId) REFERENCES assignment(id) ON DELETE CASCADE' },
      { name: 'fk_student', type: 'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE' }
    ],
    sql: `CREATE TABLE IF NOT EXISTS assignmentsubmission (
      id BIGSERIAL PRIMARY KEY,
      assignmentId BIGINT NOT NULL,
      studentId BIGINT NOT NULL,
      submissionType VARCHAR(255) NOT NULL,
      submissionContent TEXT NOT NULL,
      fileUrl VARCHAR(1000),
      textContent TEXT,
      status VARCHAR(255) DEFAULT 'draft',
      result VARCHAR(255),
      score FLOAT DEFAULT NULL,
      maxScore INT DEFAULT 100,
      feedback TEXT,
      submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignmentId) REFERENCES assignment(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'lessonaisummary',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'lessonId', type: 'BIGINT UNIQUE NOT NULL' },
      { name: 'aiSummary', type: 'TEXT NOT NULL' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS lessonaisummary (
      id BIGSERIAL PRIMARY KEY,
      lessonId BIGINT UNIQUE NOT NULL,
      aiSummary TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'aichatlog',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'userId', type: 'BIGINT NOT NULL' },
      { name: 'lessonId', type: 'BIGINT' },
      { name: 'userMessage', type: 'TEXT NOT NULL' },
      { name: 'aiResponse', type: 'TEXT NOT NULL' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE',
      'FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS aichatlog (
      id BIGSERIAL PRIMARY KEY,
      userId BIGINT NOT NULL,
      lessonId BIGINT,
      userMessage TEXT NOT NULL,
      aiResponse TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE,
      FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'notification',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'userId', type: 'BIGINT NOT NULL' },
      { name: 'title', type: 'VARCHAR(255) NOT NULL' },
      { name: 'message', type: 'TEXT NOT NULL' },
      { name: 'type', type: "VARCHAR(255) DEFAULT 'system'" },
      { name: 'isRead', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS notification (
      id BIGSERIAL PRIMARY KEY,
      userId BIGINT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(255) DEFAULT 'system',
      isRead BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'blog',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'title', type: 'VARCHAR(255) NOT NULL' },
      { name: 'content', type: 'TEXT NOT NULL' },
      { name: 'coverImage', type: 'VARCHAR(255)' },
      { name: 'isPublished', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'createdBy', type: 'BIGINT NOT NULL' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (createdBy) REFERENCES "user"(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS blog (
      id BIGSERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      coverImage VARCHAR(255),
      isPublished BOOLEAN DEFAULT TRUE,
      createdBy BIGINT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES "user"(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'payment',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'userId', type: 'BIGINT' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'courseId', type: 'BIGINT NOT NULL' },
      { name: 'amount', type: 'DECIMAL(10, 2) NOT NULL' },
      { name: 'transactionId', type: 'VARCHAR(255)' },
      { name: 'transactionReference', type: 'VARCHAR(255) UNIQUE' },
      { name: 'status', type: "VARCHAR(50) DEFAULT 'pending'" },
      { name: 'provider', type: 'VARCHAR(50)' },
      { name: 'paymentMethod', type: "VARCHAR(50) DEFAULT 'Telebirr'" },
      { name: 'phoneNumber', type: 'VARCHAR(20)' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE',
      'FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS payment (
      id BIGSERIAL PRIMARY KEY,
      "userId" BIGINT,
      "studentId" BIGINT NOT NULL,
      "courseId" BIGINT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      "transactionId" VARCHAR(255),
      "transactionReference" VARCHAR(255) UNIQUE,
      status VARCHAR(50) DEFAULT 'pending',
      provider VARCHAR(50),
      "paymentMethod" VARCHAR(50) DEFAULT 'Telebirr',
      "phoneNumber" VARCHAR(20),
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("studentId") REFERENCES student(id) ON DELETE CASCADE,
      FOREIGN KEY ("courseId") REFERENCES course(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'project',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'courseId', type: 'BIGINT NOT NULL' },
      { name: 'title', type: 'VARCHAR(255) NOT NULL' },
      { name: 'description', type: 'TEXT NOT NULL' },
      { name: 'imageUrl', type: 'VARCHAR(1000)' },
      { name: 'videoUrl', type: 'VARCHAR(1000)' },
      { name: 'fileUrl', type: 'VARCHAR(1000)' },
      { name: 'githubLink', type: 'VARCHAR(1000)' },
      { name: 'status', type: "VARCHAR(50) DEFAULT 'pending'" },
      { name: 'score', type: 'INT' },
      { name: 'feedback', type: 'TEXT' },
      { name: 'submittedAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE',
      'FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS project (
      id BIGSERIAL PRIMARY KEY,
      studentId BIGINT NOT NULL,
      courseId BIGINT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      imageUrl VARCHAR(1000),
      videoUrl VARCHAR(1000),
      fileUrl VARCHAR(1000),
      githubLink VARCHAR(1000),
      status VARCHAR(50) DEFAULT 'pending',
      score INT,
      feedback TEXT,
      submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE,
      FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'contactmessage',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'firstName', type: 'VARCHAR(255) NOT NULL' },
      { name: 'lastName', type: 'VARCHAR(255) NOT NULL' },
      { name: 'email', type: 'VARCHAR(255) NOT NULL' },
      { name: 'message', type: 'TEXT NOT NULL' },
      { name: 'status', type: "VARCHAR(50) DEFAULT 'pending'" },
      { name: 'replyMessage', type: 'TEXT' },
      { name: 'repliedAt', type: 'TIMESTAMP' },
      { name: 'repliedBy', type: 'BIGINT' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (repliedBy) REFERENCES "user"(id) ON DELETE SET NULL'
    ],
    sql: `CREATE TABLE IF NOT EXISTS contactmessage (
      id BIGSERIAL PRIMARY KEY,
      "firstName" VARCHAR(255) NOT NULL,
      "lastName" VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      "replyMessage" TEXT,
      "repliedAt" TIMESTAMP,
      "repliedBy" BIGINT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("repliedBy") REFERENCES "user"(id) ON DELETE SET NULL
    )`
  },
  {
    table: 'achievement',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'type', type: 'VARCHAR(255) NOT NULL' },
      { name: 'name', type: 'VARCHAR(255) NOT NULL' },
      { name: 'description', type: 'TEXT' },
      { name: 'icon', type: 'VARCHAR(255)' },
      { name: 'unlockedAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS achievement (
      id BIGSERIAL PRIMARY KEY,
      "studentId" BIGINT NOT NULL,
      type VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      icon VARCHAR(255),
      "unlockedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("studentId") REFERENCES student(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'learning_log',
    columns: [
      { name: 'id', type: 'BIGSERIAL PRIMARY KEY' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'date', type: 'DATE NOT NULL' },
      { name: 'secondsSpent', type: 'INT DEFAULT 0' }
    ],
    foreignKeys: [
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS learning_log (
      id BIGSERIAL PRIMARY KEY,
      "studentId" BIGINT NOT NULL,
      date DATE NOT NULL,
      "secondsSpent" INT DEFAULT 0,
      UNIQUE("studentId", date),
      FOREIGN KEY ("studentId") REFERENCES student(id) ON DELETE CASCADE
    )`
  }
];

module.exports = schema;
