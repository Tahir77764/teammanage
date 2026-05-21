import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Task from "@/models/Task";
import { getTokenFromRequest } from "@/utils/verifyToken";
import { unlinkMemberFromAdmin, toObjectId } from "@/lib/adminMembers";

export async function DELETE(req, { params }) {
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
    const { id } = await params;
    const memberId = toObjectId(id);

    const member = await User.findById(memberId);

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const admin = await User.findById(adminId).select("teamMembers");
    const isOnTeam =
      member.addedBy?.toString() === adminId.toString() ||
      admin?.teamMembers?.some((mid) => mid.toString() === memberId.toString());

    if (member.role !== "user" || !isOnTeam) {
      return NextResponse.json(
        { error: "You can only remove members from your own team" },
        { status: 403 }
      );
    }

    await Task.deleteMany({
      assignedTo: memberId,
      assignedBy: adminId,
    });

    await unlinkMemberFromAdmin(adminId, memberId);
    await User.deleteOne({ _id: memberId });

    return NextResponse.json({ message: "Team member removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete member error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
