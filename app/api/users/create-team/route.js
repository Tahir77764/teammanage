import { NextResponse } from "next/server";
import Team from "@/models/Team";
import { connectDB } from "@/lib/mongodb";
import { getTokenFromRequest } from "@/utils/verifyToken";

export async function POST(req) {
  try {
    await connectDB();

    const user = getTokenFromRequest(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Only admins can create teams" },
        { status: 403 }
      );
    }

    const { name, description, members } = await req.json();

    const team = await Team.create({
      name,
      description,
      admin: user.id,
      members: members || [],
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
