import mongoose from "mongoose";
import Team from "@/models/Team";

function toObjectId(id) {
  if (id instanceof mongoose.Types.ObjectId) return id;
  return new mongoose.Types.ObjectId(id);
}

export async function getOrCreateAdminTeam(adminId) {
  const adminObjectId = toObjectId(adminId);
  let team = await Team.findOne({ admin: adminObjectId });

  if (!team) {
    team = await Team.create({
      name: "My Team",
      description: "Default team",
      admin: adminObjectId,
      members: [],
    });
  }

  return team;
}

export async function addMemberToAdminTeam(adminId, memberId) {
  const team = await getOrCreateAdminTeam(adminId);
  const memberIdStr = memberId.toString();

  if (!team.members.some((id) => id.toString() === memberIdStr)) {
    team.members.push(memberId);
    await team.save();
  }

  return team;
}

export async function removeMemberFromAdminTeams(adminId, memberId) {
  const adminObjectId = toObjectId(adminId);
  const memberObjectId = toObjectId(memberId);

  await Team.updateMany(
    { admin: adminObjectId },
    { $pull: { members: memberObjectId } }
  );
}
