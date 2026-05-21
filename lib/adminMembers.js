import mongoose from "mongoose";
import User from "@/models/User";
import { addMemberToAdminTeam, removeMemberFromAdminTeams } from "@/lib/teamHelpers";

export function toObjectId(id) {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

/** Link a member user to an admin (User.teamMembers + member.addedBy + Team.members) */
export async function linkMemberToAdmin(adminId, memberId, memberDoc = null) {
  const adminObjectId = toObjectId(adminId);
  const memberObjectId = toObjectId(memberId);

  if (!adminObjectId || !memberObjectId) {
    throw new Error("Invalid admin or member id");
  }

  const member =
    memberDoc ||
    (await User.findByIdAndUpdate(
      memberObjectId,
      {
        $set: {
          addedBy: adminObjectId,
          verified: true,
          role: "user",
        },
      },
      { new: true }
    ));

  if (!member) {
    throw new Error("Member not found");
  }

  await User.findByIdAndUpdate(adminObjectId, {
    $addToSet: { teamMembers: memberObjectId },
  });

  await addMemberToAdminTeam(adminObjectId, memberObjectId);

  return member;
}

export async function unlinkMemberFromAdmin(adminId, memberId) {
  const adminObjectId = toObjectId(adminId);
  const memberObjectId = toObjectId(memberId);

  await User.findByIdAndUpdate(adminObjectId, {
    $pull: { teamMembers: memberObjectId },
  });

  await removeMemberFromAdminTeams(adminObjectId, memberObjectId);
}

/** All team members for an admin from DB */
export async function getMembersForAdmin(adminId) {
  const adminObjectId = toObjectId(adminId);
  if (!adminObjectId) return [];

  const admin = await User.findById(adminObjectId).select("teamMembers");
  const memberIds = new Set();

  if (admin?.teamMembers?.length) {
    admin.teamMembers.forEach((id) => memberIds.add(id.toString()));
  }

  const byAddedBy = await User.find({
    role: "user",
    addedBy: adminObjectId,
    verified: true,
  }).select("_id");

  byAddedBy.forEach((u) => memberIds.add(u._id.toString()));

  if (memberIds.size === 0) return [];

  const ids = [...memberIds].map((id) => new mongoose.Types.ObjectId(id));

  return User.find({
    _id: { $in: ids },
    role: "user",
  })
    .select("-password")
    .sort({ createdAt: -1 });
}

/** Backfill admin.teamMembers from users with matching addedBy */
export async function syncAdminTeamMembers(adminId) {
  const adminObjectId = toObjectId(adminId);
  const members = await User.find({
    role: "user",
    addedBy: adminObjectId,
  }).select("_id");

  if (!members.length) return;

  await User.findByIdAndUpdate(adminObjectId, {
    $addToSet: {
      teamMembers: { $each: members.map((m) => m._id) },
    },
  });
}
