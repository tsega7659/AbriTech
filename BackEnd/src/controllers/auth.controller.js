const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateReferralCode, generateUsername, generateSecurePassword } = require('../utils/codeGenerator');
const { sendEmail } = require('../utils/emailUtils');
const { teacherWelcomeEmail, credentialsUpdatedEmail, forgotPasswordEmail } = require('../utils/emailTemplates');
require('dotenv').config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; // Make sure to set this in .env

// Helper to get role ID by name
const getRoleId = async (conn, roleName) => {
  const [rows] = await conn.execute('SELECT id FROM role WHERE name = ?', [roleName]);
  if (rows.length > 0) return rows[0].id;

  // If role doesn't exist, insert it (auto-seeding for convenience)
  const [result] = await conn.execute('INSERT INTO role (name) VALUES (?) RETURNING id', [roleName]);
  return result[0].id;
};

const login = async (req, res) => {
  const { username, email, usernameOrEmail: paramIdentifier, password } = req.body;

  // Use whichever field was provided
  const usernameOrEmail = paramIdentifier || username || email;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'Username/Email and password are required' });
  }

  const identifier = usernameOrEmail.trim().toLowerCase();

  try {
    console.log('[Login] Attempting login for:', identifier);
    const [users] = await pool.execute(
      'SELECT u.*, r.name as "roleName" FROM "user" u JOIN role r ON u."roleId" = r.id WHERE LOWER(u.username) = ? OR LOWER(u.email) = ?',
      [identifier, identifier]
    );

    if (users.length === 0) {
      console.warn('[Login] User not found:', identifier);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      console.warn('[Login] Password mismatch for:', identifier);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('[Login] Success for:', identifier, 'Role:', user.roleName);
    
    // Update lastLogin
    await pool.execute('UPDATE "user" SET "lastLogin" = NOW() WHERE id = ?', [user.id]);

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
    console.log('[DEBUG] Body fields:', JSON.stringify({
      fullName: !!fullName, username: !!username, email: !!email, password: !!password,
      gender, educationLevel, courseLevel, isCurrentStudent,
      passwordLen: password ? password.length : 0
    }));

    // --- Validation Rules ---
    const errors = [];

    // 1. All fields required
    const requiredFields = [
      'fullName', 'username', 'email', 'password', 'gender', 'educationLevel', 'courseLevel'
    ];
    if (isCurrentStudent) {
      requiredFields.push('parentEmail');
    }

    for (const field of requiredFields) {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    }

    // 2. Name validation (no numbers or special characters except /)
    if (fullName && !/^[a-zA-Z\s\/]+$/.test(fullName)) {
      errors.push('Name can only contain letters, spaces, and "/"');
    }

    // 3. Phone number validation (starts with 09, exactly 10 digits)
    const phoneRegex = /^09\d{8}$/;
    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      errors.push('Phone number must start with 09 and be 10 digits');
    }
    if (parentPhone && !phoneRegex.test(parentPhone)) {
      errors.push('Parent phone number must start with 09 and be 10 digits');
    }

    // 4. Grade level validation (Required check already done, allow alphanumeric)
    /* 
    if (classLevel && !/^\d+$/.test(classLevel.toString())) {
      errors.push('Grade level must be a number');
    }
    */

    // 5. Password validation (>= 8 chars, letters and numbers)
    if (password) {
      if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
      if (!(/[a-zA-Z]/.test(password) && /\d/.test(password))) {
        errors.push('Password must contain both letters and numbers');
      }
    }

    if (errors.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // 1a. Validate Parent Email (Self-referral check)
    if (parentEmail && parentEmail.toLowerCase() === email.toLowerCase()) {
      console.log('Validation Error: Student tried to use their own email as parent email.');
      await conn.rollback();
      return res.status(400).json({ message: 'You cannot use your own email as your parent email' });
    }

    // 1b. Validate Parent Email (Role check) - only relevant for current students
    if (isCurrentStudent && parentEmail) {
      const [existingParentUser] = await conn.execute(
        `SELECT u.id, r.name as "roleName" 
         FROM "user" u 
         JOIN role r ON u."roleId" = r.id 
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
      'SELECT id FROM "user" WHERE username = ? OR email = ?',
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
      `INSERT INTO "user" ("fullName", gender, username, email, "passwordHash", "phoneNumber", "parentPhone", address, "roleId") 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [fullName, gender, username, email, passwordHash, phoneNumber, parentPhone, address, roleId]
    );
    const userId = userResult[0].id;
    console.log('User created with ID:', userId);

    // 5. Handle Student specifics (Referral Code)
    let referralCode = null;
    if (isCurrentStudent) {
      console.log('Generating referral code for current student...');
      let unique = false;
      while (!unique) {
        referralCode = generateReferralCode();
        const [existing] = await conn.execute('SELECT id FROM student WHERE referralcode = ?', [referralCode]);
        if (existing.length === 0) unique = true;
      }
      console.log('Unique Referral Code:', referralCode);

      if (parentEmail) {
        console.log('Sending referral email to:', parentEmail);
        try {
          const subject = 'Your Child has registered - Link your account';
          const text = `Hello! Your child ${fullName} has registered at AbriTech.\nUse this referral code to link your parent account: ${referralCode}`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4dbfec;">Your Child has registered at AbriTech</h2>
              <p>Hello!</p>
              <p>Your child <strong>${fullName}</strong> has registered at AbriTech Learning Management System.</p>
              <p>Use this referral code to link your parent account:</p>
              <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #1e293b; font-family: 'Courier New', monospace;">${referralCode}</span>
              </div>
              <p style="color: #64748b; font-size: 14px;">If you did not expect this email, please contact our support team.</p>
            </div>
          `;
          await sendEmail(parentEmail, subject, text, html);
        } catch (mailErr) {
          console.error('Email sending failed (non-blocking):', mailErr.message);
        }
      }
    }

    // 6. Insert into Student table
    console.log('Inserting into Student table...');
    const normalizedCourseLevel = courseLevel ? courseLevel.toLowerCase() : 'beginner';
    await conn.execute(
      `INSERT INTO student (userid, iscurrentstudent, classlevel, educationlevel, schoolname, courselevel, parentemail, referralcode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, isCurrentStudent ? true : false, classLevel, educationLevel, schoolName, normalizedCourseLevel, parentEmail || null, referralCode]
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

    // --- Validation Rules ---
    const errors = [];
    const requiredFields = ['fullName', 'username', 'email', 'password', 'phoneNumber'];

    for (const field of requiredFields) {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    }

    // 1. Name validation
    if (fullName && !/^[a-zA-Z\s\/]+$/.test(fullName)) {
      errors.push('Name can only contain letters, spaces, and "/"');
    }

    // 2. Phone number validation
    if (phoneNumber && !/^09\d{8}$/.test(phoneNumber)) {
      errors.push('Phone number must start with 09 and be 10 digits');
    }

    // 3. Password validation
    if (password) {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!(/[a-zA-Z]/.test(password) && /\d/.test(password))) {
        errors.push('Password must contain both letters and numbers');
      }
    }

    if (errors.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // 1. Check existing
    const [existingUsers] = await conn.execute(
      `SELECT u.id, r.name as "roleName" 
       FROM "user" u 
       JOIN role r ON u."roleId" = r.id 
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
      `INSERT INTO "user" ("fullName", username, email, "passwordHash", "phoneNumber", "roleId") 
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [fullName, username, email, passwordHash, phoneNumber, roleId]
    );
    const userId = userResult[0].id;
    console.log('User created with ID:', userId);

    // 5. Insert Parent
    console.log('Inserting into Parent table...');
    await conn.execute(
      'INSERT INTO parent ("userId") VALUES (?)',
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

const registerAdmin = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { fullName, username, email, password, phoneNumber = null } = req.body;

    console.log('--- Admin Registration Start ---');

    // 1. Check existing
    const [existing] = await conn.execute(
      'SELECT id FROM "user" WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Get Role ID
    const roleId = await getRoleId(conn, 'admin');

    // 4. Insert User
    const [userResult] = await conn.execute(
      `INSERT INTO "user" ("fullName", username, email, "passwordHash", "phoneNumber", "roleId") 
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [fullName, username, email, passwordHash, phoneNumber, roleId]
    );

    await conn.commit();
    console.log('--- Admin Registration Successful ---');
    res.status(201).json({ message: 'Admin registered successfully', userId: userResult[0].id });

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
    await conn.execute(
      'INSERT INTO teacher ("userId", specialization) VALUES (?, ?)',
      [userId, specialization]
    );

    // 8. Assign courses if provided
    if (courseIds && courseIds.length > 0) {
      console.log('Assigning courses:', courseIds);
      for (const courseId of courseIds) {
        await conn.execute(
          'INSERT INTO teachercourse ("teacherId", "courseId") VALUES (?, ?)',
          [userId, courseId]
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
