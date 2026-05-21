import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getTokenFromRequest } from "@/utils/verifyToken";
import { getMembersForAdmin, syncAdminTeamMembers, toObjectId } from "@/lib/adminMembers";

export async function GET(req) {
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

    await syncAdminTeamMembers(adminId);
    const users = await getMembersForAdmin(adminId);

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
