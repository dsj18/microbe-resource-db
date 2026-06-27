import Link from "next/link";
import { HomeSearchBox } from "@/src/components/HomeSearchBox";
import { StrainCard } from "@/src/components/StrainCard";
import {
  getStrainCount,
  getStrainExamples,
} from "@/src/lib/supabase/strains";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [strainCount, exampleStrains] = await Promise.all([
    getStrainCount(),
    getStrainExamples(6),
  ]);
  const features = [
    { title: "菌株检索", href: "/strains" },
    { title: "保存位置管理", href: "/admin/storage" },
    { title: "二维码访问", href: "/admin/qrcodes" },
    { title: "序列与文献管理", href: "/admin/references" },
  ];

  return (
    <main className="min-h-screen">
      <section className="border-b border-emerald-100 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Fertilizer Microbial Resource Database
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              肥料微生物资源库
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              用于管理、检索和展示肥料相关微生物资源，包括菌株信息、保存位置、功能特性、序列信息和相关文献。
            </p>

            <HomeSearchBox />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/strains"
                className="inline-flex h-12 items-center justify-center rounded-md bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                查看菌株列表
              </Link>
              <Link
                href="/admin"
                className="inline-flex h-12 items-center justify-center rounded-md border border-emerald-200 bg-white px-6 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
              >
                后台管理
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-100 bg-emerald-700 p-6 text-white shadow-sm">
            <p className="text-sm font-medium text-emerald-100">当前数据库数据</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-semibold">{strainCount}</p>
                <p className="mt-1 text-sm text-emerald-100">菌株记录</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">4</p>
                <p className="mt-1 text-sm text-emerald-100">核心模块</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">16S</p>
                <p className="mt-1 text-sm text-emerald-100">序列类型</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">Supabase</p>
                <p className="mt-1 text-sm text-emerald-100">数据库</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Link
              key={`${feature.href}-${index}`}
              href={feature.href}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 text-sm font-semibold text-emerald-800">
                {feature.title.slice(0, 2)}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                支持资源库静态原型展示，后续可扩展为数据库驱动的管理模块。
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              示例菌株
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              点击卡片可查看保存位置、序列信息与相关文献。
            </p>
          </div>
          <Link
            href="/strains"
            className="hidden text-sm font-semibold text-emerald-700 hover:text-emerald-900 sm:inline"
          >
            查看全部
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {exampleStrains.map((strain, index) => (
            <StrainCard key={`${strain.code}-${index}`} strain={strain} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
