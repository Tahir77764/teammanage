import { NextResponse } from "next/server";
import Task from "@/models/Task";
import { connectDB } from "@/lib/mongodb";
import { getTokenFromRequest } from "@/utils/verifyToken";

export async function GET(req) {
  try {
    await connectDB();

    const user = getTokenFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tasks = await Task.find({ assignedTo: user.id })
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
