import { verifyToken } from "@/lib/auth";

export function getTokenFromRequest(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
