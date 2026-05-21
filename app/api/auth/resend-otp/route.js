import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { generateOTP } from "@/lib/generateOTP";
import { sendOTPEmail } from "@/utils/sendOTP";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser?.verified) {
      return NextResponse.json({ error: "Account already verified. Please login." }, { status: 400 });
    }

    const pending = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!pending?.password || !pending?.name) {
      return NextResponse.json(
        { error: "No pending signup found. Please complete signup first." },
        { status: 400 }
      );
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    pending.otp = otpCode;
    pending.expiresAt = expiresAt;
    await pending.save();

    await sendOTPEmail(normalizedEmail, otpCode);

    return NextResponse.json({ message: "OTP resent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
