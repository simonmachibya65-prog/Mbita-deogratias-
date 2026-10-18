import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  username?: string;
  studentId?: string;
  role?: "admin" | "student";
  isAdmin?: boolean;
  createdAt?: number;
}

const secret = process.env.NEXTAUTH_SECRET ?? process.env.SESSION_SECRET;
if (!secret) {
  throw new Error(
    "Session secret is not set. Please set NEXTAUTH_SECRET or SESSION_SECRET in your environment."
  );
}

export const sessionOptions: SessionOptions = {
  password: secret,
  cookieName: "mbita_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax" as const,
  },
};

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}
