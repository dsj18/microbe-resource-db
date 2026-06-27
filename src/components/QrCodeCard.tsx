"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import type { Strain } from "@/src/data/strains";

type QrCodeCardProps = {
  strain: Pick<
    Strain,
    | "code"
    | "genus"
    | "crop"
    | "sourcePart"
    | "freezerNumber"
    | "storageLocation"
  >;
  detailUrl: string;
};

function displayGenus(genus: string) {
  const normalized = genus.trim().toLowerCase();

  if (!normalized || normalized === "ussigned" || normalized === "unassigned") {
    return "未明确鉴定属";
  }

  return genus;
}

function safeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "_");
}

export function QrCodeCard({ strain, detailUrl }: QrCodeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function handleCopy() {
    setStatus("");
    setError("");

    try {
      await navigator.clipboard.writeText(detailUrl);
      setStatus("已复制");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "复制链接失败",
      );
    }
  }

  function handleDownload() {
    setStatus("");
    setError("");

    const canvas = canvasRef.current;

    if (!canvas) {
      setError("二维码尚未生成，请稍后再试。");
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");

    if (!dataUrl || dataUrl === "data:,") {
      setError("二维码图片生成失败。");
      return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `QR_${safeFileName(strain.code)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setStatus("二维码已下载");
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-800">
            {strain.code}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {displayGenus(strain.genus)}
          </h2>
          <dl className="mt-3 grid gap-2 text-sm text-slate-600">
            <div>
              <dt className="font-medium text-slate-500">来源对象/作物</dt>
              <dd>{strain.crop || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">来源组分</dt>
              <dd>{strain.sourcePart || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">保存位置</dt>
              <dd>
                {[strain.freezerNumber, strain.storageLocation]
                  .filter(Boolean)
                  .join(" / ") || "-"}
              </dd>
            </div>
          </dl>
          <Link
            href={`/strains/${encodeURIComponent(strain.code)}`}
            className="mt-4 inline-flex break-all text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            {detailUrl}
          </Link>
        </div>

        <div className="flex shrink-0 justify-center rounded-md border border-emerald-100 bg-emerald-50 p-3">
          <QRCodeCanvas
            ref={canvasRef}
            data-qr-filename={`QR_${safeFileName(strain.code)}.png`}
            value={detailUrl}
            size={144}
            level="M"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#0f172a"
            title={`${strain.code} 详情页二维码`}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
        >
          复制链接
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          下载二维码
        </button>
      </div>

      {status ? (
        <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {status}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </article>
  );
}
