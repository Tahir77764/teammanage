import { NextResponse } from "next/server";
import Task from "@/models/Task";
import { connectDB } from "@/lib/mongodb";

export async function POST(req) {
  await connectDB();

  const body = await req.json();

  const task = await Task.create(body);

  return NextResponse.json(task);
}