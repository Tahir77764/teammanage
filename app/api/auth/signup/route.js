import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { generateOTP } from "@/lib/generateOTP";
import { sendOTPEmail } from "@/utils/sendOTP";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password, role } = await req.json();

    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !password) {
      return NextResponse.json({ error: "Please fill all fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser?.verified) {
      return NextResponse.json({ error: "User already exists. Please login." }, { status: 400 });
    }

    if (existingUser && !existingUser.verified) {
      await User.deleteOne({ _id: existingUser._id });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const userRole = role === "admin" ? "admin" : "user";

    await OTP.deleteMany({ email: normalizedEmail });
    await OTP.create({
      email: normalizedEmail,
      otp: otpCode,
      expiresAt,
      name: name.trim(),
      password: hashedPassword,
      role: userRole,
    });

    await sendOTPEmail(normalizedEmail, otpCode);

    return NextResponse.json(
      { message: "OTP sent successfully. Check your email." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    const message =
      error.message?.includes("EMAIL_USER") || error.code === "EAUTH"
        ? "Email service is not configured. Check EMAIL_USER and EMAIL_PASS in .env.local"
        : error.message || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
