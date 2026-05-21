import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Task from "@/models/Task";
import { getTokenFromRequest } from "@/utils/verifyToken";
import { linkMemberToAdmin, toObjectId } from "@/lib/adminMembers";
import { sendEmail } from "@/lib/nodemailer";

function formatDeadline(deadline) {
  if (!deadline) return "No deadline provided";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "Invalid deadline";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildMemberEmail({ member, admin, rawPassword, task }) {
  const appUrl = "https://teammanage-alpha.vercel.app";
  const taskTitle = task?.title || "No task assigned yet";
  const taskDescription = task?.description || "No description provided.";
  const taskDeadline = task?.deadline ? formatDeadline(task.deadline) : "No deadline assigned.";

  const subject = `${admin.name} added you to their team`;
  const text = `Hello ${member.name || "there"},

${admin.name} has added you to their team.

${rawPassword ? `Your login password is: ${rawPassword}

` : ""}Task: ${taskTitle}
Description: ${taskDescription}
Deadline: ${taskDeadline}

Open your dashboard: ${appUrl}/login

If you have questions, contact ${admin.name} at ${admin.email}.
`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
      <h2 style="color:#0b65c2;">You have been added to ${admin.name}&apos;s team</h2>
      <p>Hello ${member.name || "there"},</p>
      <p>${admin.name} has added you to their team.</p>
      ${rawPassword ? `<p><strong>Your login password:</strong> ${rawPassword}</p>` : ""}
      <div style="margin-top:1rem;padding:1rem;background:#f4f7fb;border-radius:8px;">
        <p><strong>Task:</strong> ${taskTitle}</p>
        <p><strong>Description:</strong> ${taskDescription}</p>
        <p><strong>Deadline:</strong> ${taskDeadline}</p>
      </div>
      <p style="margin-top:1rem;">Login here: <a href="${appUrl}/login">${appUrl}/login</a></p>
      <p>If you have questions, contact ${admin.name} at ${admin.email}.</p>
    </div>
  `;

  return { subject, text, html };
}

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

    const { name, email, password, taskTitle, taskDescription, deadline } = await req.json();
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

    const admin = await User.findById(adminId).select("name email teamMembers");
    if (!admin) {
      return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    let member;
    let isNewUser = false;
    let createdTask = null;

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

      const alreadyLinked = admin?.teamMembers?.some(
        (id) => id.toString() === existing._id.toString()
      );

      if (alreadyLinked || existing.addedBy?.toString() === adminId.toString()) {
        return NextResponse.json({ error: "Member already in your team" }, { status: 400 });
      }

      if (name.trim()) existing.name = name.trim();
      await existing.save();
      await linkMemberToAdmin(adminId, existing._id, existing);
      member = existing;
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      member = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "user",
        verified: true,
        addedBy: adminId,
      });
      await linkMemberToAdmin(adminId, member._id, member);
      isNewUser = true;
    }

    if (taskTitle?.trim()) {
      createdTask = await Task.create({
        title: taskTitle.trim(),
        description: taskDescription?.trim() || "",
        assignedTo: member._id,
        assignedBy: adminId,
        deadline: deadline ? new Date(deadline) : null,
      });
    }

    const safeMember = await User.findById(member._id).select("-password");

    try {
      const emailContent = buildMemberEmail({
        member: safeMember,
        admin,
        rawPassword: isNewUser ? password : undefined,
        task: createdTask,
      });
      await sendEmail({
        to: safeMember.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error("Failed to send team member email:", emailError);
    }

    return NextResponse.json(
      {
        message: existing ? "Existing user added to your team" : "Team member added successfully",
        user: safeMember,
        task: createdTask,
      },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    console.error("Add member error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
