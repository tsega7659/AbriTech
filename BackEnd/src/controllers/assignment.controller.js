const pool = require('../config/db');

const getAssignments = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const { userId, role } = req.user;

    let query = 'SELECT * FROM assignment WHERE "courseId" = ? ORDER BY "createdAt" DESC';
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
          ORDER BY a.id ASC
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

const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate, requiresApproval } = req.body;

    if (!courseId || !title || !description) {
      return res.status(400).json({ message: 'Course ID, title, and description are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO assignment ("courseId", title, description, "dueDate", "requiresApproval") VALUES (?, ?, ?, ?, ?) RETURNING id',
      [courseId, title, description, dueDate || null, requiresApproval !== undefined ? (requiresApproval ? true : false) : true]
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

    // Check assignment deadline if submitting final
    const [assignments] = await pool.execute('SELECT "dueDate" FROM assignment WHERE id = ?', [assignmentId]);
    if (assignments.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    const dueDate = assignments[0].dueDate;
    if (isFinal === 'true' && dueDate && new Date() > new Date(dueDate)) {
      return res.status(400).json({ message: 'Cannot submit: Deadline has passed' });
    }

    // Check for existing submission
    const [existing] = await pool.execute(
      'SELECT id, status FROM assignmentsubmission WHERE "assignmentId" = ? AND "studentId" = ?',
      [assignmentId, studentId]
    );

    const newStatus = isFinal === 'true' ? 'pending' : 'draft';

    // For backward compatibility, we'll still populate submissionType and submissionContent
    // Legacy mapping: if file exists, type is 'file', otherwise 'text'
    const legacyType = fileUrl ? 'file' : 'text';
    const legacyContent = fileUrl || textContent;

    if (existing.length > 0) {
      if (existing[0].status !== 'draft') {
        return res.status(400).json({ message: 'Assignment already submitted for review and cannot be modified' });
      }

      await pool.execute(
        'UPDATE assignmentsubmission SET "submissionType" = ?, "submissionContent" = ?, "fileUrl" = ?, "textContent" = ?, status = ?, "submittedAt" = NOW() WHERE id = ?',
        [legacyType, legacyContent, fileUrl, textContent, newStatus, existing[0].id]
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

const assessSubmission = async (req, res) => {
  try {
    const { id: submissionId } = req.params;
    const { status, result, feedback, score, maxScore } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
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
  getAssignmentById,
  createAssignment,
  submitAssignment,
  assessSubmission
};
