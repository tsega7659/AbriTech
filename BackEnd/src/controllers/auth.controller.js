const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateReferralCode } = require('../utils/codeGenerator');
const { sendEmail } = require('../utils/emailUtils');
require('dotenv').config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; // Make sure to set this in .env

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

    console.log('--- Student Registration Start ---');
    console.log('Username:', username, 'Email:', email);
    console.log('Parent Email provided:', parentEmail);

    // 1a. Validate Parent Email (Self-referral check)
    if (parentEmail && parentEmail.toLowerCase() === email.toLowerCase()) {
      console.log('Validation Error: Student tried to use their own email as parent email.');
      await conn.rollback();
      return res.status(400).json({ message: 'You cannot use your own email as your parent email' });
    }

    // 1b. Validate Parent Email (Role check)
    if (parentEmail) {
      const [existingParentUser] = await conn.execute(
        `SELECT u.id, r.name as roleName 
         FROM user u 
         JOIN role r ON u.roleId = r.id 
         WHERE u.email = ?`,
        [parentEmail]
      );

      if (existingParentUser.length > 0) {
        const foundRole = existingParentUser[0].roleName;
        console.log(`Parent email ${parentEmail} found in DB with role: ${foundRole}`);
        if (foundRole !== 'parent') {
          console.log('Validation Error: Parent email belongs to a non-parent account.');
          await conn.rollback();
          return res.status(400).json({
            message: `The email ${parentEmail} is already registered as a ${foundRole} and cannot be used as a parent email.`
          });
        }
      } else {
        console.log('Parent email not found in user table - this is a new parent target.');
      }
    }

    // 1c. Check if student user exists
    const [existingUsers] = await conn.execute(
      'SELECT id FROM user WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existingUsers.length > 0) {
      console.log('Validation Error: Student username or email already exists.');
      await conn.rollback();
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Get Role ID
    const roleId = await getRoleId(conn, 'student');

    // 4. Insert into User table
    console.log('Inserting into User table...');
    const [userResult] = await conn.execute(
      `INSERT INTO user (fullName, gender, username, email, passwordHash, phoneNumber, parentPhone, address, roleId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, gender, username, email, passwordHash, phoneNumber, parentPhone, address, roleId]
    );
    const userId = userResult.insertId;
    console.log('User created with ID:', userId);

    // 5. Handle Student specifics (Referral Code)
    let referralCode = null;
    if (isCurrentStudent) {
      console.log('Generating referral code for current student...');
      let unique = false;
      while (!unique) {
        referralCode = generateReferralCode();
        const [existing] = await conn.execute('SELECT id FROM student WHERE referralCode = ?', [referralCode]);
        if (existing.length === 0) unique = true;
      }
      console.log('Unique Referral Code:', referralCode);

      if (parentEmail) {
        console.log('Sending referral email to:', parentEmail);
        try {
          await sendEmail(
            parentEmail,
            'Your Child has registered - Link your account',
            `Hello! Your child ${fullName} has registered at AbriTech.\nUse this referral code to link your parent account: ${referralCode}`
          );
        } catch (mailErr) {
          console.error('Email sending failed (non-blocking):', mailErr.message);
        }
      }
    }

    // 6. Insert into Student table
    console.log('Inserting into Student table...');
    await conn.execute(
      `INSERT INTO student (userId, isCurrentStudent, classLevel, educationLevel, schoolName, courseLevel, parentEmail, referralCode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, isCurrentStudent ? 1 : 0, classLevel, educationLevel, schoolName, courseLevel, parentEmail, referralCode]
    );

    await conn.commit();
    console.log('--- Student Registration Successful ---');
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

    console.log('--- Parent Registration Start ---');
    console.log('Username:', username, 'Email:', email);

    // 1. Check existing
    const [existingUsers] = await conn.execute(
      `SELECT u.id, r.name as roleName 
       FROM user u 
       JOIN role r ON u.roleId = r.id 
       WHERE u.username = ? OR u.email = ?`,
      [username, email]
    );

    if (existingUsers.length > 0) {
      const isSameEmail = existingUsers.some(u => u.email === email);
      const roles = existingUsers.map(u => u.roleName);

      console.log('Validation Error: Parent user already exists.', { isSameEmail, roles });
      await conn.rollback();

      if (roles.includes('parent')) {
        return res.status(400).json({
          message: 'An account with this email already exists. Please sign in instead.'
        });
      } else {
        return res.status(400).json({
          message: `This email is already registered as a ${roles[0]}. Please use a different email.`
        });
      }
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Role ID
    const roleId = await getRoleId(conn, 'parent');

    // 4. Insert User
    console.log('Inserting into User table...');
    const [userResult] = await conn.execute(
      `INSERT INTO user (fullName, username, email, passwordHash, phoneNumber, roleId) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, username, email, passwordHash, phoneNumber, roleId]
    );
    const userId = userResult.insertId;
    console.log('User created with ID:', userId);

    // 5. Insert Parent
    console.log('Inserting into Parent table...');
    await conn.execute(
      'INSERT INTO parent (userId) VALUES (?)',
      [userId]
    );

    await conn.commit();
    console.log('--- Parent Registration Successful ---');
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
    await sendEmail(
      email,
      'Your AbriTech Teacher Account',
      `Welcome ${fullName}!\nAn admin has created your account.\nUsername: ${username}\nPassword: ${rawPassword}\nPlease login and change your password.`
    );

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