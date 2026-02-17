/**
 * Professional HTML email templates for AbriTech LMS
 */

const teacherWelcomeEmail = (fullName, username, password) => {
  return {
    subject: 'Welcome to AbriTech - Your Instructor Account',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4dbfec 0%, #1e293b 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
    .content { padding: 40px 30px; }
    .credentials-box { background: #f1f5f9; border-left: 4px solid #4dbfec; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .credential-item { margin: 12px 0; }
    .credential-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; }
    .credential-value { font-size: 18px; color: #1e293b; font-weight: bold; font-family: 'Courier New', monospace; margin-top: 4px; }
    .button { display: inline-block; background: #4dbfec; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 8px; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Welcome to AbriTech</h1>
    </div>
    <div class="content">
      <h2 style="color: #1e293b;">Hello ${fullName}!</h2>
      <p style="color: #475569; line-height: 1.6;">
        An administrator has created your instructor account on the AbriTech Learning Management System. 
        You can now access the platform and start managing your courses.
      </p>
      
      <div class="credentials-box">
        <h3 style="margin-top: 0; color: #1e293b;">Your Login Credentials</h3>
        <div class="credential-item">
          <div class="credential-label">Username</div>
          <div class="credential-value">${username}</div>
        </div>
        <div class="credential-item">
          <div class="credential-label">Temporary Password</div>
          <div class="credential-value">${password}</div>
        </div>
      </div>
      
      <div class="warning">
        <strong>⚠️ Important:</strong> For security reasons, you will be prompted to change your username and/or password upon your first login.
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">
          Login to Your Account
        </a>
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
        If you have any questions or need assistance, please contact our support team.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AbriTech Learning Management System</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Welcome to AbriTech, ${fullName}!\n\nYour instructor account has been created.\n\nUsername: ${username}\nTemporary Password: ${password}\n\nPlease login and change your credentials on first login.\n\nLogin at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
  };
};

const credentialsUpdatedEmail = (fullName, username) => {
  return {
    subject: 'AbriTech - Credentials Updated Successfully',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
    .content { padding: 40px 30px; }
    .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Credentials Updated</h1>
    </div>
    <div class="content">
      <div class="success-icon">✅</div>
      <h2 style="color: #1e293b; text-align: center;">Success!</h2>
      <p style="color: #475569; line-height: 1.6; text-align: center;">
        Hello ${fullName}, your login credentials have been successfully updated.
      </p>
      <p style="color: #475569; line-height: 1.6; text-align: center;">
        Your new username is: <strong>${username}</strong>
      </p>
      <p style="color: #64748b; font-size: 14px; margin-top: 30px; text-align: center;">
        If you did not make this change, please contact support immediately.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AbriTech Learning Management System</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Hello ${fullName},\n\nYour login credentials have been successfully updated.\nNew username: ${username}\n\nIf you did not make this change, please contact support immediately.`
  };
};

const forgotPasswordEmail = (fullName, otp) => {
  return {
    subject: 'AbriTech - Password Reset Request',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
    .content { padding: 40px 30px; }
    .otp-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .otp-code { font-size: 32px; font-weight: bold; color: #78350f; letter-spacing: 5px; font-family: 'Courier New', monospace; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset</h1>
    </div>
    <div class="content">
      <h2 style="color: #1e293b;">Hello ${fullName},</h2>
      <p style="color: #475569; line-height: 1.6;">
        We received a request to reset your password for your AbriTech account. 
        Please use the following OTP (One-Time Password) to complete the process.
      </p>
      
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <p style="color: #92400e; font-size: 14px; margin-top: 10px;">Valid for 15 minutes</p>
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
        If you did not request a password reset, please ignore this email or contact support if you have concerns.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AbriTech Learning Management System</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Hello ${fullName},\n\nWe received a request to reset your password. Your OTP is: ${otp}\n\nThis OTP is valid for 15 minutes.\n\nIf you did not request this, please ignore this email.`
  };
};

module.exports = {
  teacherWelcomeEmail,
  credentialsUpdatedEmail,
  forgotPasswordEmail
};
