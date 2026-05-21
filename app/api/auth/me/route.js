import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { getTokenFromRequest } from "@/utils/verifyToken";

export async function GET(req) {
  try {
    await connectDB();

    const auth = getTokenFromRequest(req);

    if (!auth?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let query = User.findById(auth.id).select("-password");

    if (auth.role === "admin") {
      query = query.populate("teamMembers", "name email role verified createdAt");
    }

    const userData = await query;

    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
