-- Migration script to add firstLogin column and create teacher table
-- Run this script on your existing database

USE abritech_db;

-- Add firstLogin column to user table
ALTER TABLE user 
ADD COLUMN firstLogin TINYINT(1) DEFAULT 1 AFTER roleId;

-- Create teacher table if it doesn't exist
CREATE TABLE IF NOT EXISTS teacher (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT UNIQUE NOT NULL,
  specialization VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Set existing users' firstLogin to 0 (they've already logged in)
UPDATE user SET firstLogin = 0 WHERE firstLogin IS NULL;

SELECT 'Migration completed successfully!' as status;
