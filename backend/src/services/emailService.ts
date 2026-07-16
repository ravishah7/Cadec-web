// backend/src/services/emailService.ts

import nodemailer from "nodemailer";

/* ----------------------------------------
  Transporter
-----------------------------------------*/

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true", // false enables STARTTLS upgrade
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  tls: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
});

const FROM = process.env.EMAIL_USER
  ? `CADEC PGDAV <${process.env.EMAIL_USER}>`
  : "CADEC PGDAV <noreply@cadec.in>";
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:8080";

/* ----------------------------------------
   Email Verification
-----------------------------------------*/
export const sendVerificationEmail = async (
  email: string,
  name:  string,
  token: string
): Promise<void> => {
  const verifyUrl = `${FRONTEND}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: "Verify your CADEC email address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">
                        CADEC PGDAV
                      </h1>
                      <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                        Career Development Centre
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 32px;">
                      <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">
                        Hi ${name} 👋
                      </h2>
                      <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                        Thanks for signing up! Please verify your email address
                        to activate your account and access all CADEC features.
                      </p>

                      <!-- Button -->
                      <table cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding:8px 0 32px;">
                            <a href="${verifyUrl}"
                              style="display:inline-block;background:#6366f1;color:#ffffff;
                                     text-decoration:none;padding:14px 32px;border-radius:8px;
                                     font-size:15px;font-weight:600;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">
                        Or copy and paste this link in your browser:
                      </p>
                      <p style="margin:0 0 24px;word-break:break-all;">
                        <a href="${verifyUrl}"
                          style="color:#6366f1;font-size:12px;">${verifyUrl}</a>
                      </p>

                      <div style="background:#f9fafb;border-radius:8px;padding:16px;border:1px solid #e5e7eb;">
                        <p style="margin:0;color:#6b7280;font-size:13px;">
                          ⏰ This link expires in <strong>24 hours</strong>.<br/>
                          If you didn't create an account, you can safely ignore this email.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                      <p style="margin:0;color:#9ca3af;font-size:12px;">
                        © ${new Date().getFullYear()} CADEC PGDAV · All rights reserved
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};

/* ----------------------------------------
   Password Reset
-----------------------------------------*/
export const sendPasswordResetEmail = async (
  email: string,
  name:  string,
  token: string
): Promise<void> => {
  const resetUrl = `${FRONTEND}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: "Reset your CADEC password",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                  
                  <tr>
                    <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">CADEC PGDAV</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:40px 32px;">
                      <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">
                        Password Reset Request
                      </h2>
                      <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                        Hi ${name}, we received a request to reset your password.
                        Click the button below to set a new password.
                      </p>

                      <table cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding:8px 0 32px;">
                            <a href="${resetUrl}"
                              style="display:inline-block;background:#6366f1;color:#ffffff;
                                     text-decoration:none;padding:14px 32px;border-radius:8px;
                                     font-size:15px;font-weight:600;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="background:#fef3c7;border-radius:8px;padding:16px;border:1px solid #fde68a;">
                        <p style="margin:0;color:#92400e;font-size:13px;">
                          ⚠️ This link expires in <strong>1 hour</strong>.<br/>
                          If you didn't request a password reset, ignore this email —
                          your password will not change.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                      <p style="margin:0;color:#9ca3af;font-size:12px;">
                        © ${new Date().getFullYear()} CADEC PGDAV · All rights reserved
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};

/* ----------------------------------------
   Contact Form Email
-----------------------------------------*/
/* ----------------------------------------
   HTML escape helper — prevents user input
   from breaking the email markup
-----------------------------------------*/
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/* ----------------------------------------
   Contact Form Email
-----------------------------------------*/
interface ContactEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const sendContactEmail = async (
  data: ContactEmailData
): Promise<void> => {
  const { firstName, lastName, email, phone, subject, message } = data;

  const safe = {
    firstName: escapeHtml(firstName),
    lastName: escapeHtml(lastName),
    email: escapeHtml(email),
    phone: phone ? escapeHtml(phone) : "Not provided",
    subject: escapeHtml(subject),
    // preserve line breaks in the message body
    message: escapeHtml(message).replace(/\n/g, "<br/>"),
  };

  await transporter.sendMail({
    from: FROM,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `New Contact Form Submission: ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                        New Contact Form Submission
                      </h1>
                      <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                        CADEC PGDAV Website
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:32px;">

                      <!-- Details table -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
                        <tr>
                          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;width:100px;color:#9ca3af;font-size:13px;font-weight:600;vertical-align:top;">
                            Name
                          </td>
                          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">
                            ${safe.firstName} ${safe.lastName}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#9ca3af;font-size:13px;font-weight:600;vertical-align:top;">
                            Email
                          </td>
                          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">
                            <a href="mailto:${safe.email}" style="color:#6366f1;text-decoration:none;">${safe.email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#9ca3af;font-size:13px;font-weight:600;vertical-align:top;">
                            Phone
                          </td>
                          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">
                            ${safe.phone}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#9ca3af;font-size:13px;font-weight:600;vertical-align:top;">
                            Subject
                          </td>
                          <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;">
                            ${safe.subject}
                          </td>
                        </tr>
                      </table>

                      <!-- Message -->
                      <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;font-weight:600;">
                        Message
                      </p>
                      <div style="background:#f9fafb;border-radius:8px;padding:16px;border:1px solid #e5e7eb;color:#374151;font-size:14px;line-height:1.6;">
                        ${safe.message}
                      </div>

                      <!-- Reply CTA -->
                      <table cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding:28px 0 4px;">
                            <a href="mailto:${safe.email}"
                              style="display:inline-block;background:#6366f1;color:#ffffff;
                                     text-decoration:none;padding:12px 28px;border-radius:8px;
                                     font-size:14px;font-weight:600;">
                              Reply to ${safe.firstName}
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                      <p style="margin:0;color:#9ca3af;font-size:12px;">
                        Sent from the CADEC PGDAV contact form · ${new Date().toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};
/* ----------------------------------------
   Verify transporter on startup
-----------------------------------------*/
export const verifyEmailConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log("✅ Email service connected");
  } catch (error) {
    console.warn("⚠️  Email service not connected:", error);
  }
};
