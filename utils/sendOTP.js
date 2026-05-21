import { transporter, verifyEmailConfig } from "@/lib/nodemailer";

export async function sendOTPEmail(email, otp) {
  await verifyEmailConfig();

  await transporter.sendMail({
    from: `"TeamManage" <${process.env.EMAIL_USER?.trim()}>`,
    to: email,
    subject: "Verify your TeamManage account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2563eb;">Email verification</h2>
        <p>Use this one-time code to complete your signup:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af; text-align: center; margin: 24px 0;">${otp}</p>
        <p style="color: #64748b;">This code expires in 10 minutes. If you did not sign up, you can ignore this email.</p>
      </div>
    `,
    text: `Your TeamManage verification code is ${otp}. It expires in 10 minutes.`,
  });
}
