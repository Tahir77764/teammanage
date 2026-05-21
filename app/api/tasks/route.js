import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import { getTokenFromRequest } from "@/utils/verifyToken";
import { toObjectId } from "@/lib/adminMembers";

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

    const { title, description, assignedTo, deadline } = await req.json();

    if (!title || !assignedTo) {
      return NextResponse.json({ error: "Title and assignedTo are required" }, { status: 400 });
    }

    const adminId = toObjectId(auth.id);
    const assignedObjectId = toObjectId(assignedTo);
    const admin = await User.findById(adminId).select("teamMembers");

    const isTeamMember =
      admin?.teamMembers?.some((id) => id.toString() === assignedObjectId?.toString()) ||
      (await User.exists({
        _id: assignedObjectId,
        role: "user",
        addedBy: adminId,
        verified: true,
      }));

    if (!isTeamMember) {
      return NextResponse.json(
        { error: "Assign tasks only to members in your team" },
        { status: 400 }
      );
    }

    const newTask = await Task.create({
      title,
      description: description || "",
      assignedTo,
      assignedBy: auth.id,
      deadline: deadline || null,
      status: "Pending",
    });

    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email");

    return NextResponse.json(
      { message: "Task created successfully", task: populatedTask },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const auth = getTokenFromRequest(req);
    if (!auth?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let tasks;
    if (auth.role === "admin") {
      tasks = await Task.find({ assignedBy: auth.id }).populate("assignedTo", "name email");
    } else {
      tasks = await Task.find({ assignedTo: auth.id }).populate("assignedBy", "name email");
    }

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
