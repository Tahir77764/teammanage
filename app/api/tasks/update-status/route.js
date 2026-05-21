import { NextResponse } from "next/server";
import Task from "@/models/Task";
import { connectDB } from "@/lib/mongodb";

export async function PUT(req) {
  await connectDB();

  const { taskId, status } = await req.json();

  const updated = await Task.findByIdAndUpdate(
    taskId,
    { status },
    { new: true }
  );

  return NextResponse.json(updated);
}