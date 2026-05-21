import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, "");

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export async function verifyEmailConfig() {
  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set in .env.local");
  }
  await transporter.verify();
}

export async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Missing required email fields");
  }

  await verifyEmailConfig();

  return transporter.sendMail({
    from: emailUser,
    to,
    subject,
    text,
    html,
  });
}
