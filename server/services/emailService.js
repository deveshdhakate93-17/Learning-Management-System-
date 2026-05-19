import transporter from '../config/mailer.js';

/**
 * Send OTP email with styled HTML template.
 */
export const sendOTPEmail = async (email, otp, purpose) => {
  const subject =
    purpose === 'email_verification'
      ? '🔐 LMS — Email Verification'
      : '🔐 LMS — Password Reset';

  const actionText =
    purpose === 'email_verification'
      ? 'Verify your email address'
      : 'Reset your password';

  const html = `
    <div style="font-family: 'DM Sans', 'Segoe UI', sans-serif; max-width: 480px; margin: auto; padding: 30px; background: #ffffff; border-radius: 16px; border: 1px solid #E5E7EB;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-flex; align-items: center; gap: 10px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #4F46E5, #6366F1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 18px; font-weight: 700;">L</span>
          </div>
          <span style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; color: #1E3A8A; font-size: 20px;">LMS</span>
        </div>
      </div>
      <h2 style="color: #1A1A2E; margin-bottom: 6px; text-align: center; font-size: 18px;">Learning Management System</h2>
      <p style="color: #6B7280; margin-bottom: 24px; text-align: center; font-size: 14px;">${actionText}</p>
      <div style="background: linear-gradient(135deg, #2A4FB3, #4F46E5); color: #ffffff; font-size: 32px; letter-spacing: 10px; text-align: center; padding: 24px; border-radius: 12px; font-weight: 700; font-family: 'JetBrains Mono', monospace;">
        ${otp}
      </div>
      <p style="color: #6B7280; font-size: 13px; margin-top: 20px; text-align: center;">
        This code expires in <strong>10 minutes</strong>. Don't share it with anyone.
      </p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
      <p style="color: #9CA3AF; font-size: 11px; text-align: center;">
        If you didn't request this code, please ignore this email.<br/>
        © ${new Date().getFullYear()} LMS Learning Management System
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"LMS" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
};

/**
 * Send welcome email after verification.
 */
export const sendWelcomeEmail = async (email, fullName) => {
  const html = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 480px; margin: auto; padding: 30px; background: #ffffff; border-radius: 16px; border: 1px solid #E5E7EB;">
      <h2 style="color: #1E3A8A; margin-bottom: 12px;">Welcome to LMS, ${fullName}! 🎉</h2>
      <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
        Your email has been verified. You now have access to all courses, quizzes, notes, and the AI chat assistant.
      </p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/courses"
        style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: linear-gradient(135deg, #4F46E5, #6366F1); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px;">
        Start Learning →
      </a>
      <p style="color: #9CA3AF; font-size: 11px; margin-top: 24px;">
        © ${new Date().getFullYear()} LMS Learning Management System
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"LMS" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🎉 Welcome to LMS — Your Learning Journey Begins!',
    html,
  });
};
