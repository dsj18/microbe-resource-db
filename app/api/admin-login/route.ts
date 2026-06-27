import { NextResponse } from "next/server";
import {
  adminSessionCookieName,
  getAdminSessionCookieOptions,
  getAdminSessionToken,
  verifyAdminPassword,
} from "@/src/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const requestUrl = new URL(request.url);

  if (!verifyAdminPassword(password)) {
    return NextResponse.redirect(new URL("/login?error=1", requestUrl));
  }

  const response = NextResponse.redirect(new URL("/admin", requestUrl));
  response.cookies.set(
    adminSessionCookieName,
    getAdminSessionToken(),
    getAdminSessionCookieOptions(),
  );

  return response;
}

