import Link from "next/link";
import type { Strain } from "@/src/data/strains";

type StrainCardProps = {
  strain: Strain;
  compact?: boolean;
};

export function DataTags({ items }: { items: string[] }) {
  const visibleItems = items.filter(Boolean);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleItems.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function StrainCard({ strain, compact = false }: StrainCardProps) {
  return (
    <Link
      href={`/strains/${encodeURIComponent(strain.code)}`}
      className="group block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700">{strain.code}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 group-hover:text-emerald-800">
            {strain.genus || "未注明属名"}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {strain.crop || "来源对象未注明"}
            {strain.sourcePart ? ` / ${strain.sourcePart}` : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          {strain.sequencingIdentified || "未注明"}
        </span>
      </div>

      {!compact ? (
        <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">采集地点</dt>
            <dd className="mt-1">{strain.collectionLocation || "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">保存位置</dt>
            <dd className="mt-1">
              {[strain.storageCondition, strain.freezerNumber, strain.storageLocation]
                .filter(Boolean)
                .join(" / ") || "-"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">负责人</dt>
            <dd className="mt-1">{strain.owner || "-"}</dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-4">
        <DataTags
          items={[
            strain.phylum,
            strain.className,
            strain.family,
            strain.sequencingType,
          ]}
        />
      </div>
      <p className="mt-4 text-sm font-medium text-emerald-700">
        点击进入详情页
      </p>
    </Link>
  );
}
