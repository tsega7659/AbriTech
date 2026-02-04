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
      id INT AUTO_INCREMENT PRIMARY KEY,
      name ENUM('admin', 'teacher', 'student', 'parent') UNIQUE NOT NULL
    )`
  },
  {
    table: 'user',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'fullName', type: 'VARCHAR(255) NOT NULL' },
      { name: 'gender', type: 'VARCHAR(255)' },
      { name: 'username', type: 'VARCHAR(255) UNIQUE NOT NULL' },
      { name: 'email', type: 'VARCHAR(255) UNIQUE NOT NULL' },
      { name: 'passwordHash', type: 'VARCHAR(255) NOT NULL' },
      { name: 'phoneNumber', type: 'VARCHAR(255)' },
      { name: 'parentPhone', type: 'VARCHAR(255)' },
      { name: 'address', type: 'TEXT' },
      { name: 'roleId', type: 'INT NOT NULL' },
      { name: 'firstLogin', type: 'TINYINT(1) DEFAULT 1' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (roleId) REFERENCES role(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS user (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      fullName VARCHAR(255) NOT NULL,
      gender VARCHAR(255),
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      passwordHash VARCHAR(255) NOT NULL,
      phoneNumber VARCHAR(255),
      parentPhone VARCHAR(255),
      address TEXT,
      roleId INT NOT NULL,
      firstLogin TINYINT(1) DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roleId) REFERENCES role(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'student',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'userId', type: 'BIGINT UNIQUE NOT NULL' },
      { name: 'isCurrentStudent', type: 'TINYINT(1) NOT NULL' },
      { name: 'classLevel', type: 'VARCHAR(255)' },
      { name: 'educationLevel', type: 'VARCHAR(255)' },
      { name: 'schoolName', type: 'VARCHAR(255)' },
      { name: 'courseLevel', type: "ENUM('beginner', 'intermediate', 'advanced') NOT NULL" },
      { name: 'parentEmail', type: 'VARCHAR(255)' },
      { name: 'referralCode', type: 'VARCHAR(255) UNIQUE' }
    ],
    foreignKeys: [
      'FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS student (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      userId BIGINT UNIQUE NOT NULL,
      isCurrentStudent TINYINT(1) NOT NULL,
      classLevel VARCHAR(255),
      educationLevel VARCHAR(255),
      schoolName VARCHAR(255),
      courseLevel ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
      parentEmail VARCHAR(255),
      referralCode VARCHAR(255) UNIQUE,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'parent',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'userId', type: 'BIGINT UNIQUE NOT NULL' }
    ],
    foreignKeys: [
      'FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS parent (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      userId BIGINT UNIQUE NOT NULL,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'parentstudent',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'parentId', type: 'BIGINT NOT NULL' },
      { name: 'studentId', type: 'BIGINT NOT NULL' }
    ],
    foreignKeys: [
      'FOREIGN KEY (parentId) REFERENCES parent(id) ON DELETE CASCADE',
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS parentstudent (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      parentId BIGINT NOT NULL,
      studentId BIGINT NOT NULL,
      FOREIGN KEY (parentId) REFERENCES parent(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'teacher',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'userId', type: 'BIGINT UNIQUE NOT NULL' },
      { name: 'specialization', type: 'VARCHAR(255)' }
    ],
    foreignKeys: [
      'FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS teacher (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      userId BIGINT UNIQUE NOT NULL,
      specialization VARCHAR(255),
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'course',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'name', type: 'VARCHAR(255) NOT NULL' },
      { name: 'category', type: 'VARCHAR(255) NOT NULL' },
      { name: 'level', type: "ENUM('beginner', 'intermediate', 'advanced') NOT NULL" },
      { name: 'youtubeLink', type: 'VARCHAR(255) NOT NULL' },
      { name: 'image', type: 'VARCHAR(255)' },
      { name: 'description', type: 'TEXT' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    sql: `CREATE TABLE IF NOT EXISTS course (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
      youtubeLink VARCHAR(255) NOT NULL,
      image VARCHAR(255),
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    table: 'teachercourse',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'teacherId', type: 'BIGINT NOT NULL' },
      { name: 'courseId', type: 'BIGINT NOT NULL' }
    ],
    foreignKeys: [
      'FOREIGN KEY (teacherId) REFERENCES user(id) ON DELETE CASCADE',
      'FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS teachercourse (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      teacherId BIGINT NOT NULL,
      courseId BIGINT NOT NULL,
      FOREIGN KEY (teacherId) REFERENCES user(id) ON DELETE CASCADE,
      FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'enrollment',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'courseId', type: 'BIGINT NOT NULL' },
      { name: 'progressPercentage', type: 'FLOAT DEFAULT 0' },
      { name: 'status', type: "ENUM('active', 'completed') DEFAULT 'active'" },
      { name: 'enrolledAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE',
      'FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS enrollment (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      studentId BIGINT NOT NULL,
      courseId BIGINT NOT NULL,
      progressPercentage FLOAT DEFAULT 0,
      status ENUM('active', 'completed') DEFAULT 'active',
      enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE,
      FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'lesson',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'courseId', type: 'BIGINT NOT NULL' },
      { name: 'title', type: 'VARCHAR(255) NOT NULL' },
      { name: 'description', type: 'TEXT NOT NULL' },
      { name: 'summaryText', type: 'TEXT' },
      { name: 'orderNumber', type: 'INT NOT NULL' },
      { name: 'type', type: "ENUM('text', 'video', 'image', 'link', 'file') DEFAULT 'text'" },
      { name: 'contentUrl', type: 'VARCHAR(255)' },
      { name: 'textContent', type: 'TEXT' }
    ],
    foreignKeys: [
      'FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS lesson (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      courseId BIGINT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      summaryText TEXT,
      orderNumber INT NOT NULL,
      FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'lesson_resource',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'lessonId', type: 'BIGINT NOT NULL' },
      { name: 'type', type: "ENUM('video', 'image', 'text', 'link', 'file') NOT NULL" },
      { name: 'contentUrl', type: 'VARCHAR(1000)' },
      { name: 'textContent', type: 'LONGTEXT' },
      { name: 'orderNumber', type: 'INT DEFAULT 1' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS lesson_resource (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      lessonId BIGINT NOT NULL,
      type ENUM('video', 'image', 'text', 'link', 'file') NOT NULL,
      contentUrl VARCHAR(1000),
      textContent LONGTEXT,
      orderNumber INT DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'lessonprogress',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'lessonId', type: 'BIGINT NOT NULL' },
      { name: 'completed', type: 'TINYINT(1) DEFAULT 0' },
      { name: 'completedAt', type: 'DATETIME' }
    ],
    foreignKeys: [
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE',
      'FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS lessonprogress (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      studentId BIGINT NOT NULL,
      lessonId BIGINT NOT NULL,
      completed TINYINT(1) DEFAULT 0,
      completedAt DATETIME,
      FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE,
      FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'lessonquiz',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
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
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
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
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'quizId', type: 'BIGINT NOT NULL' },
      { name: 'selectedOption', type: 'VARCHAR(255) NOT NULL' },
      { name: 'isCorrect', type: 'TINYINT(1) NOT NULL' },
      { name: 'attemptNumber', type: 'INT NOT NULL' },
      { name: 'result', type: "ENUM('pass', 'fail') NOT NULL" },
      { name: 'attemptedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE',
      'FOREIGN KEY (quizId) REFERENCES lessonquiz(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS quizattempt (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      studentId BIGINT NOT NULL,
      quizId BIGINT NOT NULL,
      selectedOption VARCHAR(255) NOT NULL,
      isCorrect TINYINT(1) NOT NULL,
      attemptNumber INT NOT NULL,
      result ENUM('pass', 'fail') NOT NULL,
      attemptedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE,
      FOREIGN KEY (quizId) REFERENCES lessonquiz(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'assignment',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'courseId', type: 'BIGINT NOT NULL' },
      { name: 'title', type: 'VARCHAR(255) NOT NULL' },
      { name: 'description', type: 'TEXT NOT NULL' },
      { name: 'dueDate', type: 'DATETIME' },
      { name: 'requiresApproval', type: 'TINYINT(1) DEFAULT 1' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS assignment (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      courseId BIGINT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      dueDate DATETIME,
      requiresApproval TINYINT(1) DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'assignmentsubmission',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'assignmentId', type: 'BIGINT NOT NULL' },
      { name: 'studentId', type: 'BIGINT NOT NULL' },
      { name: 'submissionType', type: "ENUM('file', 'link', 'text') NOT NULL" },
      { name: 'submissionContent', type: 'TEXT NOT NULL' },
      { name: 'status', type: "ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'" },
      { name: 'result', type: "ENUM('pass', 'fail')" },
      { name: 'feedback', type: 'TEXT' },
      { name: 'submittedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (assignmentId) REFERENCES assignment(id) ON DELETE CASCADE',
      'FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS assignmentsubmission (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      assignmentId BIGINT NOT NULL,
      studentId BIGINT NOT NULL,
      submissionType ENUM('file', 'link', 'text') NOT NULL,
      submissionContent TEXT NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      result ENUM('pass', 'fail'),
      feedback TEXT,
      submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignmentId) REFERENCES assignment(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'lessonaisummary',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'lessonId', type: 'BIGINT UNIQUE NOT NULL' },
      { name: 'aiSummary', type: 'TEXT NOT NULL' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS lessonaisummary (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      lessonId BIGINT UNIQUE NOT NULL,
      aiSummary TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'aichatlog',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'userId', type: 'BIGINT NOT NULL' },
      { name: 'lessonId', type: 'BIGINT' },
      { name: 'userMessage', type: 'TEXT NOT NULL' },
      { name: 'aiResponse', type: 'TEXT NOT NULL' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE',
      'FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS aichatlog (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      userId BIGINT NOT NULL,
      lessonId BIGINT,
      userMessage TEXT NOT NULL,
      aiResponse TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
      FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'notification',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'userId', type: 'BIGINT NOT NULL' },
      { name: 'title', type: 'VARCHAR(255) NOT NULL' },
      { name: 'message', type: 'TEXT NOT NULL' },
      { name: 'type', type: "ENUM('assignment', 'grade', 'event', 'suggestion', 'system') DEFAULT 'system'" },
      { name: 'isRead', type: 'TINYINT(1) DEFAULT 0' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS notification (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      userId BIGINT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('assignment', 'grade', 'event', 'suggestion', 'system') DEFAULT 'system',
      isRead TINYINT(1) DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )`
  },
  {
    table: 'blog',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'title', type: 'VARCHAR(255) NOT NULL' },
      { name: 'content', type: 'LONGTEXT NOT NULL' },
      { name: 'coverImage', type: 'VARCHAR(255)' },
      { name: 'isPublished', type: 'TINYINT(1) DEFAULT 1' },
      { name: 'createdBy', type: 'BIGINT NOT NULL' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    foreignKeys: [
      'FOREIGN KEY (createdBy) REFERENCES user(id) ON DELETE CASCADE'
    ],
    sql: `CREATE TABLE IF NOT EXISTS blog (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT NOT NULL,
      coverImage VARCHAR(255),
      isPublished TINYINT(1) DEFAULT 1,
      createdBy BIGINT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES user(id) ON DELETE CASCADE
    )`
  }
];

module.exports = schema;
