import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getTokenFromRequest } from "@/utils/verifyToken";
import { linkMemberToAdmin, toObjectId } from "@/lib/adminMembers";

export async function POST(req) {
  try {
    await connectDB();

    const auth = getTokenFromRequest(req);
    if (!auth?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    const adminId = toObjectId(auth.id);
    if (!adminId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { name, email, password } = await req.json();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.role === "admin") {
        return NextResponse.json({ error: "Cannot add an admin as a team member" }, { status: 400 });
      }

      if (
        existing.addedBy &&
        existing.addedBy.toString() !== adminId.toString()
      ) {
        return NextResponse.json(
          { error: "This user belongs to another admin's team" },
          { status: 400 }
        );
      }

      const admin = await User.findById(adminId).select("teamMembers");
      const alreadyLinked = admin?.teamMembers?.some(
        (id) => id.toString() === existing._id.toString()
      );

      if (alreadyLinked || existing.addedBy?.toString() === adminId.toString()) {
        return NextResponse.json({ error: "Member already in your team" }, { status: 400 });
      }

      if (name.trim()) existing.name = name.trim();
      await existing.save();

      await linkMemberToAdmin(adminId, existing._id, existing);

      const member = await User.findById(existing._id).select("-password");
      return NextResponse.json(
        { message: "Existing user added to your team", user: member },
        { status: 200 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const member = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      verified: true,
      addedBy: adminId,
    });

    await linkMemberToAdmin(adminId, member._id, member);

    const safeMember = await User.findById(member._id).select("-password");

    return NextResponse.json(
      { message: "Team member added successfully", user: safeMember },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add member error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
