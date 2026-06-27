import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminSessionCookieName = "microbe_admin_session";

const sessionMessage = "microbe-resource-db-admin-session-v1";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function createSessionToken() {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return "";
  }

  return createHmac("sha256", adminPassword)
    .update(sessionMessage)
    .digest("hex");
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminPassword(password: string) {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return false;
  }

  return safeEquals(password, adminPassword);
}

export async function isAdminAuthenticated() {
  const expectedToken = createSessionToken();

  if (!expectedToken) {
    return false;
  }

  const cookieStore = await cookies();
  const actualToken = cookieStore.get(adminSessionCookieName)?.value ?? "";

  return safeEquals(actualToken, expectedToken);
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  };
}

export function getAdminSessionToken() {
  return createSessionToken();
}

