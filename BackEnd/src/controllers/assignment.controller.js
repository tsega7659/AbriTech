const pool = require('../config/db');
const fs = require('fs');

// ----- ADMIN: Manage Assignments (Projects) -----

const getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const [assignments] = await pool.execute(
      'SELECT * FROM assignment WHERE "courseId" = ? ORDER BY "orderNumber" ASC, id ASC',
      [courseId]
    );
    res.json(assignments);
  } catch (error) {
    console.error('Get Assignments Error:', error);
    res.status(500).json({ message: 'Failed to fetch assignments', error: error.message });
  }
};

const getAssignments = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const { userId, role } = req.user;

    let query = 'SELECT * FROM assignment WHERE "courseId" = ? ORDER BY "orderNumber" ASC, id ASC';
    let params = [courseId];

    // If student, join with their submissions
    if (role === 'student') {
      const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
      if (students.length > 0) {
        const studentId = students[0].id;
        query = `
          SELECT a.*, s.status, s."submissionType", s."submissionContent", s."fileUrl", s."textContent", s.score, s.feedback, s.result, s."submittedAt" 
          FROM assignment a
          LEFT JOIN assignmentsubmission s ON a.id = s."assignmentId" AND s."studentId" = ?
          WHERE a."courseId" = ? 
          ORDER BY a."orderNumber" ASC, a.id ASC
        `;
        params = [studentId, courseId];
      }
    }

    const [assignments] = await pool.execute(query, params);
    res.json(assignments);
  } catch (error) {
    console.error('Get Assignments Error:', error);
    res.status(500).json({ message: 'Failed to fetch assignments', error: error.message });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    let query = 'SELECT * FROM assignment WHERE id = ?';
    let params = [id];

    if (role === 'student') {
      const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
      if (students.length > 0) {
        const studentId = students[0].id;
        query = `
          SELECT a.*, s.status, s."submissionType", s."submissionContent", s."fileUrl", s."textContent", s.score, s.feedback, s.result, s."submittedAt" 
          FROM assignment a
          LEFT JOIN assignmentsubmission s ON a.id = s."assignmentId" AND s."studentId" = ?
          WHERE a.id = ?
        `;
        params = [studentId, id];
      }
    }

    const [assignment] = await pool.execute(query, params);

    if (assignment.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment[0]);
  } catch (error) {
    console.error('Get Assignment By ID Error:', error);
    res.status(500).json({ message: 'Failed to fetch assignment', error: error.message });
  }
};

// Admin creates a project/assignment
const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, orderNumber, dueDate, requiresApproval, maxPoints } = req.body;

    if (!courseId || !title || !description) {
      return res.status(400).json({ message: 'Course ID, title, and description are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO assignment ("courseId", title, description, "orderNumber", "dueDate", "requiresApproval", "maxPoints") VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
      [
        courseId,
        title,
        description,
        orderNumber || 1,
        dueDate || null,
        requiresApproval !== undefined ? (requiresApproval ? true : false) : true,
        maxPoints || 100
      ]
    );

    res.status(201).json({
      message: 'Assignment created successfully',
      assignmentId: result[0].id
    });
  } catch (error) {
    console.error('Create Assignment Error:', error);
    res.status(500).json({ message: 'Failed to create assignment', error: error.message });
  }
};

// Admin updates a project/assignment
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, orderNumber, dueDate, requiresApproval, maxPoints } = req.body;

    const [existing] = await pool.execute('SELECT id FROM assignment WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await pool.execute(
      'UPDATE assignment SET title = ?, description = ?, "orderNumber" = ?, "dueDate" = ?, "requiresApproval" = ?, "maxPoints" = ?, "updatedAt" = NOW() WHERE id = ?',
      [
        title,
        description,
        orderNumber || 1,
        dueDate || null,
        requiresApproval !== undefined ? (requiresApproval ? true : false) : true,
        maxPoints || 100,
        id
      ]
    );

    res.json({ message: 'Assignment updated successfully' });
  } catch (error) {
    console.error('Update Assignment Error:', error);
    res.status(500).json({ message: 'Failed to update assignment', error: error.message });
  }
};

// Admin deletes a project/assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT id FROM assignment WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await pool.execute('DELETE FROM assignment WHERE id = ?', [id]);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete Assignment Error:', error);
    res.status(500).json({ message: 'Failed to delete assignment', error: error.message });
  }
};

// ----- STUDENT: Submit Assignment -----

const submitAssignment = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const { userId } = req.user;
    const { submissionType, submissionContent, isFinal } = req.body;

    // Get student ID
    const [students] = await pool.execute('SELECT id FROM student WHERE "userId" = ?', [userId]);
    if (students.length === 0) {
      return res.status(403).json({ message: 'Only students can submit assignments' });
    }
    const studentId = students[0].id;

    const textContent = submissionContent || '';
    let fileUrl = null;

    if (req.file) {
      fileUrl = req.file.path;
    }

    if (!textContent && !fileUrl) {
      return res.status(400).json({ message: 'At least one form of submission (text or file) is required' });
    }

    // Check assignment exists
    const [assignments] = await pool.execute('SELECT "dueDate" FROM assignment WHERE id = ?', [assignmentId]);
    if (assignments.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check for existing submission
    const [existing] = await pool.execute(
      'SELECT id, status, "fileUrl", "textContent" FROM assignmentsubmission WHERE "assignmentId" = ? AND "studentId" = ?',
      [assignmentId, studentId]
    );

    const newStatus = isFinal === 'true' ? 'pending' : 'draft';

    const legacyType = fileUrl ? 'file' : 'text';
    const legacyContent = fileUrl || textContent;

    if (existing.length > 0) {
      if (existing[0].status !== 'draft' && existing[0].status !== 'redo') {
        return res.status(400).json({ message: 'Assignment already submitted for review and cannot be modified' });
      }

      const existingRecord = existing[0];

      // Cleanup ghost file to prevent storage leak
      if (fileUrl && existingRecord.fileUrl && existingRecord.fileUrl !== fileUrl) {
        try {
          if (fs.existsSync(existingRecord.fileUrl)) {
            fs.unlinkSync(existingRecord.fileUrl);
          }
        } catch (err) {
          console.error('Failed to unlink old assignment file:', err);
        }
      }

      // Preserve historical context natively via append
      let finalContent = textContent;
      if (existingRecord.textContent && existingRecord.textContent.trim().length > 0 && textContent !== existingRecord.textContent) {
        finalContent = `${textContent}\n\n--- RESUBMISSION [${new Date().toISOString().split('T')[0]}] ---\n\n${existingRecord.textContent}`;
      }
      // If we didn't submit new text, but there was old text, preserve it
      if (!textContent && existingRecord.textContent) {
        finalContent = existingRecord.textContent;
      }

      // Re-evaluate legacyType and legacyContent based on combination
      const resolvedLegacyType = fileUrl ? 'file' : 'text';
      const resolvedLegacyContent = fileUrl || finalContent;

      await pool.execute(
        'UPDATE assignmentsubmission SET "submissionType" = ?, "submissionContent" = ?, "fileUrl" = ?, "textContent" = ?, status = ?, "submittedAt" = NOW() WHERE id = ?',
        [resolvedLegacyType, resolvedLegacyContent, fileUrl || existingRecord.fileUrl, finalContent, newStatus, existingRecord.id]
      );

      const [updated] = await pool.execute('SELECT * FROM assignmentsubmission WHERE id = ?', [existing[0].id]);
      res.json({
        message: isFinal === 'true' ? 'Assignment submitted for review successfully' : 'Draft saved successfully',
        submission: updated[0]
      });
    } else {
      const [result] = await pool.execute(
        'INSERT INTO assignmentsubmission ("assignmentId", "studentId", "submissionType", "submissionContent", "fileUrl", "textContent", status) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
        [assignmentId, studentId, legacyType, legacyContent, fileUrl, textContent, newStatus]
      );

      const [newSub] = await pool.execute('SELECT * FROM assignmentsubmission WHERE id = ?', [result[0].id]);
      res.json({
        message: isFinal === 'true' ? 'Assignment submitted for review successfully' : 'Draft saved successfully',
        submission: newSub[0]
      });
    }
  } catch (error) {
    console.error('Submit Assignment Error:', error);
    res.status(500).json({ message: 'Failed to submit assignment', error: error.message });
  }
};

// ----- INSTRUCTOR: Assess Submission -----

const assessSubmission = async (req, res) => {
  try {
    const { id: submissionId } = req.params;
    const { status, result, feedback, score, maxScore } = req.body;

    if (!['pending', 'approved', 'rejected', 'redo'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await pool.execute(
      'UPDATE assignmentsubmission SET status = ?, result = ?, feedback = ?, score = ?, "maxScore" = ? WHERE id = ?',
      [status, result || null, feedback || null, score !== undefined ? score : null, maxScore || 100, submissionId]
    );

    res.json({ message: 'Submission assessed successfully' });
  } catch (error) {
    console.error('Assess Submission Error:', error);
    res.status(500).json({ message: 'Failed to assess submission', error: error.message });
  }
};

module.exports = {
  getAssignments,
  getAssignmentsByCourse,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  assessSubmission
};
