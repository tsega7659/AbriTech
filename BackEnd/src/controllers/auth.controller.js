const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateReferralCode } = require('../utils/codeGenerator');
const { sendReferralEmail } = require('../utils/sendReferralEmail');
require('dotenv').config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET // Make sure to set this in .env

// Helper to get role ID by name
const getRoleId = async (conn, roleName) => {
  const [rows] = await conn.execute('SELECT id FROM role WHERE name = ?', [roleName]);
  if (rows.length > 0) return rows[0].id;

  // If role doesn't exist, insert it (auto-seeding for convenience)
  const [result] = await conn.execute('INSERT INTO role (name) VALUES (?)', [roleName]);
  return result.insertId;
};

const login = async (req, res) => {
  const { username, email, usernameOrEmail: paramIdentifier, password } = req.body;

  // Use whichever field was provided
  const usernameOrEmail = paramIdentifier || username || email;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'Username/Email and password are required' });
  }

  try {
    const [users] = await pool.execute(
      'SELECT u.*, r.name as roleName FROM user u JOIN role r ON u.roleId = r.id WHERE u.username = ? OR u.email = ?',
      [usernameOrEmail, usernameOrEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.roleName, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.roleName
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const registerStudent = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      fullName, username, email, password, gender = null, phoneNumber = null, address = null,
      schoolName = null, educationLevel = null, classLevel = null, isCurrentStudent, // isCurrentStudent is boolean
      parentEmail = null, parentPhone = null, courseLevel
    } = req.body;

    // 1. Check if user exists
    const [existingUsers] = await conn.execute(
      'SELECT id FROM user WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existingUsers.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Get Role ID
    const roleId = await getRoleId(conn, 'student');

    // 4. Insert into User table
    // Ensure we pass null for optional fields if they are missing
    const [userResult] = await conn.execute(
      `INSERT INTO user (fullName, gender, username, email, passwordHash, phoneNumber, parentPhone, address, roleId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, gender, username, email, passwordHash, phoneNumber, parentPhone, address, roleId]
    );
    const userId = userResult.insertId;

    // 5. Handle Student specifics (Referral Code)
    let referralCode = null;
    if (isCurrentStudent) {
      // It's a loop to ensure uniqueness, though collision is rare with 8 chars
      let unique = false;
      while (!unique) {
        referralCode = generateReferralCode();
        const [existing] = await conn.execute('SELECT id FROM student WHERE referralCode = ?', [referralCode]);
        if (existing.length === 0) unique = true;
      }

      if (parentEmail && referralCode) {
  const subject = "Your Child's Referral Code - AbriTech LMS";

  const plainText = `Hello!\n\nYour child ${fullName} has registered on AbriTech LMS and added you as their parent/guardian.\n\nTo view their progress, grades, and teacher feedback, please create your parent account using this referral code:\n\n${referralCode}\n\nLink: https://localhost:5173/parent/register?code=${referralCode}\n\nThank you!\nAbriTech LMS Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #f9f9f9;">
      <h2 style="color: #2c3e50; text-align: center;">Hello!</h2>
      <p>Your child <strong>${fullName}</strong> has just registered on <strong>AbriTech LMS</strong> and added you as their parent/guardian.</p>
      <p>To view their progress, grades, and teacher feedback, please create your parent account using this referral code:</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <h1 style="background: #3498db; color: white; padding: 20px; border-radius: 10px; display: inline-block; font-size: 32px; letter-spacing: 5px;">
          ${referralCode}
        </h1>
      </div>  
      <p style="margin-top: 40px;">Thank you,<br><strong>AbriTech LMS Team</strong></p>
    </div>
  `;

  // Call with exactly these 4 arguments
  await sendReferralEmail(parentEmail, subject, plainText, html);
}
    }

    // 6. Insert into Student table
    await conn.execute(
      `INSERT INTO student (userId, isCurrentStudent, classLevel, educationLevel, schoolName, courseLevel, parentEmail, referralCode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, isCurrentStudent ? 1 : 0, classLevel, educationLevel, schoolName, courseLevel, parentEmail, referralCode]
    );

    await conn.commit();
    res.status(201).json({ message: 'Student registered successfully', userId, referralCode });

  } catch (error) {
    await conn.rollback();
    console.error('Register Student Error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  } finally {
    conn.release();
  }
};

const registerParent = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      fullName, username, email, password, phoneNumber = null
    } = req.body;

    // 1. Check existing
    const [existingUsers] = await conn.execute(
      'SELECT id FROM user WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existingUsers.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Role ID
    const roleId = await getRoleId(conn, 'parent');

    // 4. Insert User
    const [userResult] = await conn.execute(
      `INSERT INTO user (fullName, username, email, passwordHash, phoneNumber, roleId) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, username, email, passwordHash, phoneNumber, roleId]
    );
    const userId = userResult.insertId;

    // 5. Insert Parent
    await conn.execute(
      'INSERT INTO parent (userId) VALUES (?)',
      [userId]
    );

    await conn.commit();
    res.status(201).json({ message: 'Parent registered successfully', userId });

  } catch (error) {
    await conn.rollback();
    console.error('Register Parent Error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  } finally {
    conn.release();
  }
};

const registerTeacher = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      fullName, username, email, gender = null, phoneNumber = null, address = null
    } = req.body;

    // 1. Check existing
    const [existing] = await conn.execute(
      'SELECT id FROM user WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // 2. Generate random password
    const rawPassword = generateReferralCode(10); // Using the generator for a random string
    const passwordHash = await bcrypt.hash(rawPassword, SALT_ROUNDS);

    // 3. Get Role ID
    const roleId = await getRoleId(conn, 'teacher');

    // 4. Insert User
    const [userResult] = await conn.execute(
      `INSERT INTO user (fullName, gender, username, email, passwordHash, phoneNumber, roleId, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, gender, username, email, passwordHash, phoneNumber, roleId, address]
    );

    // 5. Mock Email
    const teacherSubject = 'Your Teacher Account - AbriTech LMS';
const teacherText = `Welcome ${fullName}!\n\nAn admin has created your teacher account.\n\nUsername: ${username}\nPassword: ${rawPassword}\n\nPlease login and change your password immediately.\n\nThank you!`;
const teacherHtml = `<p>Welcome <strong>${fullName}</strong>!</p><p>An admin has created your teacher account.</p><p><strong>Username:</strong> ${username}<br><strong>Password:</strong> ${rawPassword}</p><p>Please login and change your password right away.</p>`;

await sendReferralEmail(email, teacherSubject, teacherText, teacherHtml);

    await conn.commit();
    res.status(201).json({ message: 'Teacher registered successfully. Credentials sent to email.', rawPassword });

  } catch (error) {
    await conn.rollback();
    console.error('Register Teacher Error:', error);
    res.status(500).json({ message: 'Teacher registration failed', error: error.message });
  } finally {
    conn.release();
  }
};

const logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};

module.exports = {
  login,
  registerStudent,
  registerParent,
  registerTeacher,
  logout
};