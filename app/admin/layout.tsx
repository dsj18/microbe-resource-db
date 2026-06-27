import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/src/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/login");
  }

  return children;
}

