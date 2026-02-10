const pool = require('../config/db');

const getAssignments = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const [assignments] = await pool.execute(
      'SELECT * FROM assignment WHERE courseId = ? ORDER BY createdAt DESC',
      [courseId]
    );

    res.json(assignments);
  } catch (error) {
    console.error('Get Assignments Error:', error);
    res.status(500).json({ message: 'Failed to fetch assignments', error: error.message });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [assignment] = await pool.execute(
      'SELECT * FROM assignment WHERE id = ?',
      [id]
    );

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
      'INSERT INTO assignment (courseId, title, description, dueDate, requiresApproval) VALUES (?, ?, ?, ?, ?)',
      [courseId, title, description, dueDate || null, requiresApproval !== undefined ? requiresApproval : 1]
    );

    res.status(201).json({
      message: 'Assignment created successfully',
      assignmentId: result.insertId
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
    const [students] = await pool.execute('SELECT id FROM student WHERE userId = ?', [userId]);
    if (students.length === 0) {
      return res.status(403).json({ message: 'Only students can submit assignments' });
    }
    const studentId = students[0].id;

    let content = submissionContent;
    let type = submissionType;

    // If file is uploaded, override content and type
    if (req.file) {
      content = req.file.path; // Cloudinary URL
      type = 'file';
    }

    if (!content) {
      return res.status(400).json({ message: 'Submission content or file is required' });
    }

    // Check assignment deadline if submitting final
    const [assignments] = await pool.execute('SELECT dueDate FROM assignment WHERE id = ?', [assignmentId]);
    if (assignments.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    const dueDate = assignments[0].dueDate;
    if (isFinal === 'true' && dueDate && new Date() > new Date(dueDate)) {
      return res.status(400).json({ message: 'Cannot submit: Deadline has passed' });
    }

    // Check for existing submission
    const [existing] = await pool.execute(
      'SELECT id, status FROM assignmentsubmission WHERE assignmentId = ? AND studentId = ?',
      [assignmentId, studentId]
    );

    const newStatus = isFinal === 'true' ? 'pending' : 'draft';

    if (existing.length > 0) {
      // If already submitted for review (pending/approved/rejected), don't allow re-submit or draft update
      if (existing[0].status !== 'draft') {
        return res.status(400).json({ message: 'Assignment already submitted for review and cannot be modified' });
      }

      await pool.execute(
        'UPDATE assignmentsubmission SET submissionType = ?, submissionContent = ?, status = ?, submittedAt = NOW() WHERE id = ?',
        [type, content, newStatus, existing[0].id]
      );
    } else {
      await pool.execute(
        'INSERT INTO assignmentsubmission (assignmentId, studentId, submissionType, submissionContent, status) VALUES (?, ?, ?, ?, ?)',
        [assignmentId, studentId, type, content, newStatus]
      );
    }

    res.json({ message: isFinal === 'true' ? 'Assignment submitted for review successfully' : 'Draft saved successfully' });
  } catch (error) {
    console.error('Submit Assignment Error:', error);
    res.status(500).json({ message: 'Failed to submit assignment', error: error.message });
  }
};

const assessSubmission = async (req, res) => {
  try {
    const { id: submissionId } = req.params;
    const { status, result, feedback } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await pool.execute(
      'UPDATE assignmentsubmission SET status = ?, result = ?, feedback = ? WHERE id = ?',
      [status, result || null, feedback || null, submissionId]
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