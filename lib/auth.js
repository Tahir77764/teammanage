import jwt from "jsonwebtoken";

const getSecret = () => process.env.JWT_SECRET || "fallback_secret";

export function signAuthToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    getSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  const decoded = jwt.verify(token, getSecret());
  return {
    id: (decoded.id || decoded.userId)?.toString(),
    role: decoded.role,
    email: decoded.email,
  };
}

export function setAuthCookie(response, token) {
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}
