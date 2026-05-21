import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import { getTokenFromRequest } from "@/utils/verifyToken";

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

    const { name, description, members } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const newTeam = await Team.create({
      name,
      description: description || "",
      admin: auth.id,
      members: members || [],
    });

    return NextResponse.json(
      { message: "Team created successfully", team: newTeam },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create team error:", error);
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

    let teams;
    if (auth.role === "admin") {
      teams = await Team.find({ admin: auth.id })
        .populate("members", "name email role")
        .sort({ createdAt: -1 });
    } else {
      teams = await Team.find({ members: auth.id }).populate("admin", "name email");
    }

    return NextResponse.json({ teams }, { status: 200 });
  } catch (error) {
    console.error("Fetch teams error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
