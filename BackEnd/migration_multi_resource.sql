-- Migration to support multiple resources per lesson

CREATE TABLE IF NOT EXISTS lesson_resource (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  lessonId BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  contentUrl VARCHAR(255),
  textContent TEXT,
  orderNumber INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
);

-- Migrate existing data from lesson table to lesson_resource
INSERT INTO lesson_resource (lessonId, type, contentUrl, textContent, orderNumber)
SELECT id, type, contentUrl, textContent, 1 FROM lesson
WHERE type IS NOT NULL;

-- Optional: You may want to keep the old columns in 'lesson' table for backward compatibility 
-- or remove them after verifying everything works. For now, we keep them.
