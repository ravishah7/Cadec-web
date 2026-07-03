import nodemailer from "nodemailer";

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_TO,
} = process.env;

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const createTransporter = () => {
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Email configuration is incomplete.");
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

// Contact Form Email
export const sendContactEmail = async (
  contactData: ContactData
): Promise<void> => {
  try {
    const transporter = createTransporter();

    await transporter.verify();

    const recipientEmail =
      EMAIL_TO || "ravi19808ravi0@gmail.com";

    const mailOptions = {
      from: `"CADEC Website" <${EMAIL_USER}>`,
      to: recipientEmail,
      replyTo: contactData.email,
      subject: `New Contact Form Submission: ${escapeHtml(
        contactData.subject
      )}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto">
          <h2 style="color:#1f2937;">
            📩 New Contact Form Submission
          </h2>

          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td><strong>Name</strong></td>
              <td>${escapeHtml(contactData.firstName)} ${escapeHtml(
        contactData.lastName
      )}</td>
            </tr>

            <tr>
              <td><strong>Email</strong></td>
              <td>${escapeHtml(contactData.email)}</td>
            </tr>

            ${
              contactData.phone
                ? `
            <tr>
              <td><strong>Phone</strong></td>
              <td>${escapeHtml(contactData.phone)}</td>
            </tr>`
                : ""
            }

            <tr>
              <td><strong>Subject</strong></td>
              <td>${escapeHtml(contactData.subject)}</td>
            </tr>
          </table>

          <hr>

          <h3>Message</h3>

          <p style="white-space:pre-wrap;line-height:1.7;">
            ${escapeHtml(contactData.message)}
          </p>

          <hr>

          <small>
            Sent from the CADEC PGDAV website contact form.
          </small>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(
      `✅ Contact email sent successfully to ${recipientEmail}`
    );
  } catch (error) {
    console.error("❌ Error sending contact email:", error);

    // Prevent API failure if email fails
    console.log(
      "Contact form saved successfully, but email could not be delivered."
    );
  }
};

// Notification Email
export const sendNotificationEmail = async (
  subject: string,
  message: string
): Promise<void> => {
  try {
    const transporter = createTransporter();

    await transporter.verify();

    const recipientEmail =
      EMAIL_TO || "demo@gmail.com";

    await transporter.sendMail({
      from: `"CADEC Website" <${EMAIL_USER}>`,
      to: recipientEmail,
      subject: escapeHtml(subject),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto">
          <h2>${escapeHtml(subject)}</h2>

          <hr>

          <p style="white-space:pre-wrap;line-height:1.7;">
            ${escapeHtml(message)}
          </p>
        </div>
      `,
    });

    console.log("✅ Notification email sent successfully");
  } catch (error) {
    console.error("❌ Error sending notification email:", error);
    throw error;
  }
};