import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { signAuthToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedOtp = String(otp || "").trim();

    if (!normalizedEmail || !normalizedOtp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const otpRecord = await OTP.findOne({ email: normalizedEmail, otp: normalizedOtp });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ error: "OTP expired. Please sign up again." }, { status: 400 });
    }

    if (!otpRecord.password || !otpRecord.name) {
      return NextResponse.json({ error: "Signup session expired. Please sign up again." }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser?.verified) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ error: "Account already exists. Please login." }, { status: 400 });
    }

    if (existingUser) {
      await User.deleteOne({ _id: existingUser._id });
    }

    const user = await User.create({
      name: otpRecord.name,
      email: normalizedEmail,
      password: otpRecord.password,
      role: otpRecord.role || "user",
      verified: true,
    });

    await OTP.deleteOne({ _id: otpRecord._id });

    const token = signAuthToken(user);
    const redirectTo =
      user.role === "admin" ? "/admin/dashboard" : "/dashboard";

    const response = NextResponse.json(
      {
        message: "Account verified successfully",
        role: user.role,
        name: user.name,
        redirectTo,
      },
      { status: 200 }
    );

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
