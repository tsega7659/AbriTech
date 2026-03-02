-- migration_course_time_tracking.sql
-- Add timeSpentSeconds to enrollment table to track student learning duration

ALTER TABLE enrollment 
ADD COLUMN timeSpentSeconds INT DEFAULT 0;
