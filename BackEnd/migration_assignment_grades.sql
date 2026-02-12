-- Migration to support numerical grading for assignments
ALTER TABLE assignment ADD COLUMN maxPoints INT DEFAULT 100;
ALTER TABLE assignmentsubmission ADD COLUMN score FLOAT DEFAULT NULL;
ALTER TABLE assignmentsubmission ADD COLUMN maxScore INT DEFAULT 100;
