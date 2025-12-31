-- Create teacher table for AbriTech database
-- Run this script to add the missing teacher table

USE abritech_db;

CREATE TABLE IF NOT EXISTS teacher (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT UNIQUE NOT NULL,
  specialization VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

SELECT 'Teacher table created successfully!' as status;
