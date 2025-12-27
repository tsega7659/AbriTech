USE abritech_db;

-- Enums (MySQL supports ENUM directly)
-- RoleName, CourseLevel, etc., are used in tables below

CREATE TABLE role (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name ENUM('admin', 'teacher', 'student', 'parent') UNIQUE NOT NULL
);

CREATE TABLE user (
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
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roleId) REFERENCES role(id) ON DELETE CASCADE
);

CREATE TABLE student (
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
);

CREATE TABLE parent (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT UNIQUE NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE parent_student (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  parentId BIGINT NOT NULL,
  studentId BIGINT NOT NULL,
  FOREIGN KEY (parentId) REFERENCES parent(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE
);

CREATE TABLE course (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  youtubeLink VARCHAR(255) NOT NULL,
  image VARCHAR(255),
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teacher_course (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacherId BIGINT NOT NULL,
  courseId BIGINT NOT NULL,
  FOREIGN KEY (teacherId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE
);

CREATE TABLE enrollment (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  studentId BIGINT NOT NULL,
  courseId BIGINT NOT NULL,
  progressPercentage FLOAT DEFAULT 0,
  status ENUM('active', 'completed') DEFAULT 'active',
  enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE,
  FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE
);

CREATE TABLE lesson (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  courseId BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  summaryText TEXT,
  orderNumber INT NOT NULL,
  FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE
);

CREATE TABLE lesson_progress (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  studentId BIGINT NOT NULL,
  lessonId BIGINT NOT NULL,
  completed TINYINT(1) DEFAULT 0,
  completedAt DATETIME,
  FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE,
  FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
);

CREATE TABLE lesson_quiz (
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
);

CREATE TABLE quiz_attempt (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  studentId BIGINT NOT NULL,
  quizId BIGINT NOT NULL,
  selectedOption VARCHAR(255) NOT NULL,
  isCorrect TINYINT(1) NOT NULL,
  attemptNumber INT NOT NULL,
  result ENUM('pass', 'fail') NOT NULL,
  attemptedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES student(id) ON DELETE CASCADE,
  FOREIGN KEY (quizId) REFERENCES lesson_quiz(id) ON DELETE CASCADE
);

CREATE TABLE assignment (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  courseId BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  dueDate DATETIME,
  requiresApproval TINYINT(1) DEFAULT 1,
  FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE
);

CREATE TABLE assignment_submission (
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
);

CREATE TABLE lesson_ai_summary (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  lessonId BIGINT UNIQUE NOT NULL,
  aiSummary TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
);

CREATE TABLE ai_chat_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT NOT NULL,
  lessonId BIGINT,
  userMessage TEXT NOT NULL,
  aiResponse TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
);

CREATE TABLE notification (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('assignment', 'grade', 'event', 'suggestion', 'system') DEFAULT 'system',
  isRead TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE blog (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  coverImage VARCHAR(255),
  isPublished TINYINT(1) DEFAULT 1,
  createdBy BIGINT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES user(id) ON DELETE CASCADE
);