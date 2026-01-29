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

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment
};