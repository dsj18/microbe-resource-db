import Link from "next/link";
import { SequenceTextBlock } from "@/src/components/SequenceTextBlock";
import { DataTags } from "@/src/components/StrainCard";
import { getStrainByCode } from "@/src/lib/supabase/strains";

export const dynamic = "force-dynamic";

type InfoRow = [string, string | null];

export default async function StrainDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const strain = await getStrainByCode(decodeURIComponent(id));

  if (!strain) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-semibold text-slate-950">未找到该菌株</h1>
        <p className="mt-3 text-slate-600">
          请返回菌株列表，确认菌株编号后重新访问。
        </p>
        <Link
          href="/strains"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          返回菌株列表
        </Link>
      </main>
    );
  }

  const taxonomyRows: InfoRow[] = [
    ["门 Phylum", strain.phylum],
    ["纲 Class", strain.class_name],
    ["目 Order", strain.order_name],
    ["科 Family", strain.family],
    ["属 Genus", strain.genus],
  ];
  const isolationRows: InfoRow[] = [
    ["来源对象/作物", strain.crop],
    ["来源组分", strain.source_part],
    ["采集地点", strain.collection_location],
    ["分离日期", strain.isolation_date],
    ["分离培养基", strain.medium],
    ["温度", strain.temperature],
  ];
  const storageRows: InfoRow[] = [
    ["保存条件", strain.storage_condition],
    ["冰箱编号", strain.freezer_number],
    ["原始冰箱编号", strain.original_freezer_number],
    ["保存位置", strain.storage_location],
    ["负责人", strain.owner],
  ];
  const resultRows: InfoRow[] = [
    ["是否申请专利", strain.has_patent],
    ["专利名称", strain.patent_name],
    ["是否发表文章", strain.has_paper],
    ["文章名称", strain.paper_name],
  ];

  return (
    <main className="min-h-screen">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-6">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/strains"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
            >
              返回菌株列表
            </Link>
            <Link
              href={`/admin/edit/${encodeURIComponent(strain.code)}`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              编辑该菌株
            </Link>
          </div>
          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                {strain.code}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
                {strain.genus || "未注明属名"}
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                {strain.crop || "来源对象未注明"}
                {strain.source_part ? ` / ${strain.source_part}` : ""}
              </p>
            </div>
            <DataTags
              items={[
                strain.sequencing_identified ?? "",
                strain.sequencing_type ?? "",
                strain.storage_condition ?? "",
              ]}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <InfoSection title="分类鉴定信息" rows={taxonomyRows} />

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">测序信息</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoItem label="是否测序鉴定" value={strain.sequencing_identified} />
              <InfoItem label="测序类型" value={strain.sequencing_type} />
              <InfoItem label="测序平台/公司" value={strain.sequencing_company} />
            </dl>
            <div className="mt-5">
              <p className="text-sm font-medium text-slate-500">鉴定序列</p>
              <SequenceTextBlock sequence={strain.sequence_text} />
            </div>
          </section>

          <InfoSection title="分离培养信息" rows={isolationRows} />
          <InfoSection title="成果信息" rows={resultRows} />
        </div>

        <aside className="space-y-6">
          <InfoSection title="保存信息" rows={storageRows} />

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">二维码访问</h2>
            <div className="mt-4 flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 p-6 text-center text-sm font-medium leading-6 text-emerald-800">
              二维码占位，后续扫码进入当前菌株详情页
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function InfoSection({
  title,
  rows,
}: {
  title: string;
  rows: InfoRow[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {rows.map(([label, value], index) => (
          <InfoItem key={`${label}-${index}`} label={label} value={value} />
        ))}
      </dl>
    </section>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-slate-800">{value || "-"}</dd>
    </div>
  );
}
