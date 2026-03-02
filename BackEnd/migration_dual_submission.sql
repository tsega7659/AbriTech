-- Migration to support both text and file submissions for assignments
ALTER TABLE assignmentsubmission ADD COLUMN fileUrl VARCHAR(255) AFTER submissionContent;
ALTER TABLE assignmentsubmission ADD COLUMN textContent TEXT AFTER fileUrl;

-- Migrate existing data
-- Current logic: submissionContent stores either the text or the file path based on submissionType
UPDATE assignmentsubmission SET textContent = submissionContent WHERE submissionType = 'text';
UPDATE assignmentsubmission SET fileUrl = submissionContent WHERE submissionType = 'file';
UPDATE assignmentsubmission SET fileUrl = submissionContent WHERE submissionType = 'link';

-- Note: We keep submissionContent and submissionType for backward compatibility if needed, 
-- but moving forward we will use textContent and fileUrl.
