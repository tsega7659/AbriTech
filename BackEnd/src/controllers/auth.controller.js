const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateReferralCode, generateUsername, generateSecurePassword } = require('../utils/codeGenerator');
const { sendEmail } = require('../utils/emailUtils');
const { teacherWelcomeEmail, credentialsUpdatedEmail, forgotPasswordEmail } = require('../utils/emailTemplates');
require('dotenv').config();

const SALT_ROUNDS = 10;

// Helper to get role ID by name
const getRoleId = async (conn, roleName) => {
  const [rows] = await conn.execute('SELECT id FROM role WHERE name = ?', [roleName]);
  if (rows.length > 0) return rows[0].id;

  const [result] = await conn.execute('INSERT INTO role (name) VALUES (?) RETURNING id', [roleName]);
  return result[0].id;
};

const login = async (req, res) => {
  const { usernameOrEmail: paramIdentifier, password } = req.body;
  const identifier = paramIdentifier.trim().toLowerCase();

  try {
    const [users] = await pool.execute(
      'SELECT u.*, r.name as "roleName" FROM "user" u JOIN role r ON u."roleId" = r.id WHERE LOWER(u.username) = ? OR LOWER(u.email) = ?',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await pool.execute('UPDATE "user" SET "lastLogin" = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { userId: user.id, role: user.roleName, username: user.username },
      process.env.JWT_SECRET,
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
      fullName, username, email, password, gender, phoneNumber, address,
      schoolName, educationLevel, classLevel, isCurrentStudent,
      parentEmail, parentPhone, courseLevel
    } = req.body;

    // 1. Check if user already exists
    const [existingUsers] = await conn.execute(
      'SELECT id FROM "user" WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existingUsers.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const roleId = await getRoleId(conn, 'student');

    // 3. Insert into User table
    const [userResult] = await conn.execute(
      `INSERT INTO "user" ("fullName", gender, username, email, "passwordHash", "phoneNumber", "parentPhone", address, "roleId") 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [fullName, gender, username, email, passwordHash, phoneNumber, parentPhone, address, roleId]
    );
    const userId = userResult[0].id;

    // 4. Handle Referral Code for current students
    let referralCode = null;
    if (isCurrentStudent) {
      let unique = false;
      while (!unique) {
        referralCode = generateReferralCode();
        const [existing] = await conn.execute('SELECT id FROM student WHERE referralcode = ?', [referralCode]);
        if (existing.length === 0) unique = true;
      }

      if (parentEmail) {
        try {
          const subject = 'Your Child has registered - Link your account';
          const text = `Hello! Your child ${fullName} has registered at AbriTech.\nUse this referral code: ${referralCode}`;
          const html = `<h2>Welcome to AbriTech</h2><p>Your child <strong>${fullName}</strong> has registered. Referral code: <strong>${referralCode}</strong></p>`;
          await sendEmail(parentEmail, subject, text, html);
        } catch (mailErr) {
          console.error('Email failed:', mailErr.message);
        }
      }
    }

    // 5. Insert into Student table
    await conn.execute(
      `INSERT INTO student (userid, iscurrentstudent, classlevel, educationlevel, schoolname, courselevel, parentemail, referralcode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, !!isCurrentStudent, classLevel, educationLevel, schoolName, courseLevel.toLowerCase(), parentEmail || null, referralCode]
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

    let {
      fullName, username, email, password, phoneNumber
    } = req.body;

    // 1. Generate username if not provided
    if (!username) {
      let generatedUsername = generateUsername(fullName);
      let usernameExists = true;
      let counter = 1;
      let finalUsername = generatedUsername;

      while (usernameExists) {
        const [existing] = await conn.execute(
          'SELECT id FROM "user" WHERE username = ?',
          [finalUsername]
        );
        if (existing.length === 0) {
          usernameExists = false;
        } else {
          finalUsername = `${generatedUsername}${counter}`;
          counter++;
        }
      }
      username = finalUsername;
    }

    // 2. Check existing
    const [existingUsers] = await conn.execute(
      `SELECT u.id, r.name as "roleName" 
       FROM "user" u 
       JOIN role r ON u."roleId" = r.id 
       WHERE u.username = ? OR u.email = ?`,
      [username, email]
    );

    if (existingUsers.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // 3. Hash Password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const roleId = await getRoleId(conn, 'parent');

    // 4. Insert User
    const [userResult] = await conn.execute(
      `INSERT INTO "user" ("fullName", username, email, "passwordHash", "phoneNumber", "roleId") 
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [fullName, username, email, passwordHash, phoneNumber, roleId]
    );
    const userId = userResult[0].id;

    // 5. Insert Parent
    await conn.execute('INSERT INTO parent ("userId") VALUES (?)', [userId]);

    await conn.commit();
    res.status(201).json({ message: 'Parent registered successfully', userId, username });
  } catch (error) {
    await conn.rollback();
    console.error('Register Parent Error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  } finally {
    conn.release();
  }
};

const registerAdmin = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let { fullName, username, email, password, phoneNumber = null } = req.body;

    console.log('--- Admin Registration Start ---');

    // 1. Generate username if not provided
    if (!username) {
      let generatedUsername = generateUsername(fullName);
      let usernameExists = true;
      let counter = 1;
      let finalUsername = generatedUsername;

      while (usernameExists) {
        const [existing] = await conn.execute(
          'SELECT id FROM "user" WHERE username = ?',
          [finalUsername]
        );
        if (existing.length === 0) {
          usernameExists = false;
        } else {
          finalUsername = `${generatedUsername}${counter}`;
          counter++;
        }
      }
      username = finalUsername;
    }

    // 2. Check existing
    const [existing] = await conn.execute(
      'SELECT id FROM "user" WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // 3. Hash Password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Get Role ID
    const roleId = await getRoleId(conn, 'admin');

    // 5. Insert User
    const [userResult] = await conn.execute(
      `INSERT INTO "user" ("fullName", username, email, "passwordHash", "phoneNumber", "roleId") 
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [fullName, username, email, passwordHash, phoneNumber, roleId]
    );

    await conn.commit();
    console.log('--- Admin Registration Successful ---');
    res.status(201).json({ message: 'Admin registered successfully', userId: userResult[0].id, username });

  } catch (error) {
    await conn.rollback();
    console.error('Register Admin Error:', error);
    res.status(500).json({ message: 'Admin registration failed', error: error.message });
  } finally {
    conn.release();
  }
};

const registerTeacher = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      fullName, email, gender = null, phoneNumber = null, address = null, courseIds = [], specialization = null
    } = req.body;

    console.log('--- Teacher Registration Start ---');
    console.log('Full Name:', fullName, 'Courses:', courseIds);

    // 1. Generate username from full name and password
    let username = generateUsername(fullName);
    const rawPassword = generateSecurePassword(12);

    // 2. Check if generated username exists, append number if needed
    let usernameExists = true;
    let counter = 1;
    let finalUsername = username;

    while (usernameExists) {
      const [existing] = await conn.execute(
        'SELECT id FROM "user" WHERE username = ?',
        [finalUsername]
      );
      if (existing.length === 0) {
        usernameExists = false;
      } else {
        finalUsername = `${username}${counter}`;
        counter++;
      }
    }

    // 3. Check if email exists
    const [emailCheck] = await conn.execute(
      'SELECT id FROM "user" WHERE email = ?',
      [email]
    );
    if (emailCheck.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 4. Hash Password
    const passwordHash = await bcrypt.hash(rawPassword, SALT_ROUNDS);

    // 5. Get Role ID
    const roleId = await getRoleId(conn, 'teacher');

    // 6. Insert User
    console.log('Inserting user with username:', finalUsername);
    const [userResult] = await conn.execute(
      `INSERT INTO "user" ("fullName", gender, username, email, "passwordHash", "phoneNumber", "roleId", address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [fullName, gender, finalUsername, email, passwordHash, phoneNumber, roleId, address]
    );
    const userId = userResult[0].id;

    // 7. Insert into teacher table
    console.log('Inserting into teacher table...');
    const [teacherResult] = await conn.execute(
      'INSERT INTO teacher ("userId", specialization) VALUES (?, ?) RETURNING id',
      [userId, specialization]
    );
    const teacherId = teacherResult[0].id;

    // 8. Assign courses if provided
    if (courseIds && courseIds.length > 0) {
      console.log('Assigning courses:', courseIds);
      for (const courseId of courseIds) {
        await conn.execute(
          'INSERT INTO teachercourse ("teacherId", "courseId") VALUES (?, ?)',
          [teacherId, courseId]
        );
      }
    }

    // 9. Send email with credentials
    const emailContent = teacherWelcomeEmail(fullName, finalUsername, rawPassword);
    try {
      await sendEmail(email, emailContent.subject, emailContent.text, emailContent.html);
      console.log('Welcome email sent to:', email);
    } catch (mailErr) {
      console.error('Email sending failed (non-blocking):', mailErr.message);
    }

    await conn.commit();
    console.log('--- Teacher Registration Successful ---');
    res.status(201).json({
      message: 'Teacher registered successfully. Credentials sent to email.',
      userId,
      username: finalUsername,
      password: rawPassword
    });

  } catch (error) {
    await conn.rollback();
    console.error('Register Teacher Error:', error);
    res.status(500).json({ message: 'Teacher registration failed', error: error.message });
  } finally {
    conn.release();
  }
};

const updateCredentials = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { userId } = req.user; // From auth middleware
    const { newUsername, newPassword } = req.body;

    console.log('--- Update Credentials Start ---');
    console.log('User ID:', userId);

    if (!newUsername && !newPassword) {
      await conn.rollback();
      return res.status(400).json({ message: 'Please provide new username or password' });
    }

    // Get current user info
    const [users] = await conn.execute(
      'SELECT username, email, "fullName" FROM "user" WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = users[0];
    let updateFields = [];
    let updateValues = [];

    // Check if new username is different and available
    if (newUsername && newUsername !== currentUser.username) {
      const [existing] = await conn.execute(
        'SELECT id FROM "user" WHERE username = ? AND id != ?',
        [newUsername, userId]
      );
      if (existing.length > 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'Username already taken' });
      }
      updateFields.push('username = ?');
      updateValues.push(newUsername);
    }

    // Hash new password if provided
    if (newPassword) {
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      updateFields.push('"passwordHash" = ?');
      updateValues.push(passwordHash);
    }

    // Add userId for WHERE clause
    updateValues.push(userId);

    // Set firstLogin to false
    updateFields.push('"firstLogin" = false');

    // Update user
    const updateQuery = `UPDATE "user" SET ${updateFields.join(', ')} WHERE id = ?`;
    await conn.execute(updateQuery, updateValues);

    // Send confirmation email
    const finalUsername = newUsername || currentUser.username;
    const emailContent = credentialsUpdatedEmail(currentUser.fullName, finalUsername);
    try {
      await sendEmail(currentUser.email, emailContent.subject, emailContent.text, emailContent.html);
    } catch (mailErr) {
      console.error('Email sending failed (non-blocking):', mailErr.message);
    }

    await conn.commit();
    console.log('--- Credentials Updated Successfully ---');
    res.json({
      message: 'Credentials updated successfully',
      username: finalUsername
    });

  } catch (error) {
    await conn.rollback();
    console.error('Update Credentials Error:', error);
    res.status(500).json({ message: 'Failed to update credentials', error: error.message });
  } finally {
    conn.release();
  }
};

const logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};

const forgotPassword = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const [users] = await conn.execute('SELECT id, "fullName" FROM "user" WHERE LOWER(email) = ?', [normalizedEmail]);
    if (users.length === 0) {
      console.warn('[ForgotPassword] User not found:', normalizedEmail);
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const user = users[0];

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Update user with OTP and expiry
    await conn.execute(
      'UPDATE "user" SET "resetPasswordOtp" = ?, "resetPasswordExpires" = ? WHERE id = ?',
      [otp, expiresAt, user.id]
    );

    // Send email
    const emailContent = forgotPasswordEmail(user.fullName, otp);
    try {
      await sendEmail(email, emailContent.subject, emailContent.text, emailContent.html);
      res.json({ message: 'OTP sent to your email' });
    } catch (mailErr) {
      console.error('Email sending failed:', mailErr);
      res.status(500).json({ message: 'Failed to send email' });
    }

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

const verifyOtp = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const [users] = await conn.execute(
      'SELECT id, "resetPasswordOtp", "resetPasswordExpires" FROM "user" WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    res.json({ message: 'OTP verified successfully' });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

const resetPassword = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validate password complexity
    if (newPassword.length < 8 || !(/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword))) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and contain both letters and numbers' });
    }

    const [users] = await conn.execute(
      'SELECT id, "resetPasswordOtp", "resetPasswordExpires" FROM "user" WHERE LOWER(email) = ?',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Re-verify OTP to ensure security
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Hash new password
    console.log('[ResetPassword] Hashing new password for:', normalizedEmail);
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    console.log('[ResetPassword] New hash generated, length:', passwordHash.length);

    // Update password and clear OTP
    const [result] = await conn.execute(
      'UPDATE "user" SET "passwordHash" = ?, "resetPasswordOtp" = NULL, "resetPasswordExpires" = NULL WHERE id = ?',
      [passwordHash, user.id]
    );
    console.log('[ResetPassword] Update result - affectedRows:', result.affectedRows);

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
};

module.exports = {
  login,
  registerStudent,
  registerParent,
  registerAdmin,
  registerTeacher,
  updateCredentials,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword
};
