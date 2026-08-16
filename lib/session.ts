import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  username?: string;
  studentId?: string;
  role?: "admin" | "student";
  isAdmin?: boolean;
  createdAt?: number;
}

export const sessionOptions: SessionOptions = {
  password: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || "2085db4540e70e2f74fdbabcbf8493fd641cd9700ee9e932290e7fd5ead1b28f",
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
