const pool = require('../config/db');

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Check if user exists
        const [existing] = await pool.execute('SELECT id, username, email FROM user WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Disable FK checks and delete
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
        await pool.execute('DELETE FROM user WHERE id = ?', [id]);
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

        res.json({ message: `User ${existing[0].username} (ID: ${id}) deleted successfully` });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.execute(`
            SELECT u.id, u.fullName, u.username, u.email, r.name as role 
            FROM user u 
            JOIN role r ON u.roleId = r.id
            ORDER BY u.id
        `);
        res.json(users);
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

module.exports = {
    deleteUser,
    getAllUsers
};
