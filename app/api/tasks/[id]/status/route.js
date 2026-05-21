import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import { getTokenFromRequest } from "@/utils/verifyToken";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const auth = getTokenFromRequest(req);
    if (!auth?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!status || !["Pending", "In Progress", "Completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const isAssignee = task.assignedTo.toString() === auth.id;
    const isAssigningAdmin =
      auth.role === "admin" && task.assignedBy.toString() === auth.id;

    if (!isAssignee && !isAssigningAdmin) {
      return NextResponse.json({ error: "Forbidden. Not your task." }, { status: 403 });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(id)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email");

    return NextResponse.json(
      { message: "Status updated successfully", task: updatedTask },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update task status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
