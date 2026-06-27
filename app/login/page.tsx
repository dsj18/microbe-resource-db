import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/src/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const isAuthenticated = await isAdminAuthenticated();

  if (isAuthenticated) {
    redirect("/admin");
  }

  const params = await searchParams;
  const hasError = Boolean(
    Array.isArray(params.error) ? params.error[0] : params.error,
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Admin Login
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            管理员登录
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            请输入管理员密码后进入后台管理页面。
          </p>

          {hasError ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              管理员密码不正确，请重新输入。
            </div>
          ) : null}

          <form action="/api/admin-login" method="post" className="mt-6">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                管理员密码
              </span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <button
              type="submit"
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              登录后台
            </button>
          </form>

          <Link
            href="/"
            className="mt-6 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}

