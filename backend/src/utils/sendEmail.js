const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.text || options.message,
    ...(options.html && { html: options.html }),
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

// ─── Shared layout wrapper ────────────────────────────────────────────────────
const layout = (body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RareNest</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a3c5e 0%,#2d6a9f 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:1px;">RareNest</h1>
            <p style="margin:6px 0 0;color:#a8cce8;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Premium Properties</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fb;padding:24px 40px;border-top:1px solid #e8eaed;text-align:center;">
            <p style="margin:0;color:#9aa3af;font-size:12px;line-height:1.6;">
              © ${new Date().getFullYear()} RareNest. All rights reserved.<br/>
              You received this email because an action was taken on your account.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Reusable HTML snippets ───────────────────────────────────────────────────
const credBox = (email, password) => `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background:#f0f7ff;border:1px solid #c3dff7;border-radius:8px;padding:20px 24px;">
      <p style="margin:0 0 6px;color:#1a3c5e;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Login Credentials</p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;width:80px;">Email</td>
          <td style="padding:4px 0;color:#1a3c5e;font-size:14px;font-weight:600;">${email}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#555;font-size:14px;">Password</td>
          <td style="padding:4px 0;color:#1a3c5e;font-size:14px;font-weight:600;font-family:monospace;letter-spacing:1px;">${password}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

const ctaButton = (url, label) => `
<table cellpadding="0" cellspacing="0" style="margin:28px 0;">
  <tr>
    <td style="background:linear-gradient(135deg,#1a3c5e,#2d6a9f);border-radius:8px;">
      <a href="${url}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">${label}</a>
    </td>
  </tr>
</table>`;

const divider = () => `<hr style="border:none;border-top:1px solid #e8eaed;margin:24px 0;" />`;

const note = (text) => `
<p style="margin:16px 0 0;background:#fffbea;border-left:4px solid #f5a623;border-radius:4px;padding:12px 16px;color:#7a5c00;font-size:13px;line-height:1.6;">
  ${text}
</p>`;

// ─── Email builders ───────────────────────────────────────────────────────────

sendEmail.guestEnquiryHtml = ({ propertyTitle, email, password, loginUrl }) =>
  layout(`
    <h2 style="margin:0 0 8px;color:#1a3c5e;font-size:22px;font-weight:700;">Enquiry Received!</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
      Thank you for your enquiry about <strong style="color:#1a3c5e;">"${propertyTitle}"</strong>.
      Your message has been sent to the seller and they will be in touch soon.
    </p>
    ${divider()}
    <p style="margin:0 0 4px;color:#333;font-size:15px;line-height:1.7;">
      We've created a <strong>RareNest account</strong> for you so you can track your enquiries and explore more properties.
    </p>
    ${credBox(email, password)}
    ${note('Please change your password after your first login for security.')}
    ${ctaButton(loginUrl, 'Log In to RareNest →')}
    ${divider()}
    <p style="margin:0;color:#9aa3af;font-size:13px;line-height:1.6;">
      If you did not make this enquiry, please ignore this email or contact our support team.
    </p>
  `);

sendEmail.guestSellerHtml = ({ email, password, loginUrl }) =>
  layout(`
    <h2 style="margin:0 0 8px;color:#1a3c5e;font-size:22px;font-weight:700;">Welcome to RareNest!</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
      Your <strong>seller account</strong> has been created. You can now list your properties,
      manage enquiries, and connect with potential buyers — all from one place.
    </p>
    ${divider()}
    ${credBox(email, password)}
    ${note('Please change your password after your first login for security.')}
    ${ctaButton(loginUrl, 'Access Your Seller Dashboard →')}
    ${divider()}
    <p style="margin:0;color:#9aa3af;font-size:13px;line-height:1.6;">
      If you did not create this account, please contact our support team immediately.
    </p>
  `);

sendEmail.guestListingHtml = ({ propertyTitle, email, password, loginUrl }) =>
  layout(`
    <h2 style="margin:0 0 8px;color:#1a3c5e;font-size:22px;font-weight:700;">Your Listing Is Submitted!</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
      Thank you for listing <strong style="color:#1a3c5e;">"${propertyTitle}"</strong> on RareNest.
      Our team will review your listing and verify it shortly.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#f0fff4;border:1px solid #a3d9b1;border-radius:8px;padding:16px 20px;">
          <p style="margin:0;color:#1a6630;font-size:14px;line-height:1.7;">
            ✅ &nbsp;<strong>Listing submitted</strong> — pending admin verification.<br/>
            You'll be notified once it goes live.
          </p>
        </td>
      </tr>
    </table>
    ${divider()}
    <p style="margin:0 0 4px;color:#333;font-size:15px;line-height:1.7;">
      We've created a <strong>RareNest seller account</strong> for you to manage your listings.
    </p>
    ${credBox(email, password)}
    ${note('Please change your password after your first login for security.')}
    ${ctaButton(loginUrl, 'Manage My Listings →')}
    ${divider()}
    <p style="margin:0;color:#9aa3af;font-size:13px;line-height:1.6;">
      If you did not submit this listing, please contact our support team immediately.
    </p>
  `);

sendEmail.passwordResetHtml = ({ resetUrl }) =>
  layout(`
    <h2 style="margin:0 0 8px;color:#1a3c5e;font-size:22px;font-weight:700;">Reset Your Password</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
      We received a request to reset the password for your RareNest account.
      Click the button below to choose a new password.
    </p>
    ${ctaButton(resetUrl, 'Reset My Password →')}
    <p style="margin:0 0 8px;color:#555;font-size:13px;line-height:1.6;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0;word-break:break-all;color:#2d6a9f;font-size:13px;">${resetUrl}</p>
    ${divider()}
    ${note('This link expires in <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your password will not change.')}
  `);

module.exports = sendEmail;
