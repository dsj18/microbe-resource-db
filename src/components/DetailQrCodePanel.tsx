"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type DetailQrCodePanelProps = {
  code: string;
  detailUrl: string;
};

function safeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "_");
}

export function DetailQrCodePanel({ code, detailUrl }: DetailQrCodePanelProps) {
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
    link.download = `QR_${safeFileName(code)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setStatus("二维码已下载");
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">二维码访问</h2>
      <div className="mt-4 flex justify-center rounded-lg border border-emerald-100 bg-emerald-50 p-4">
        <QRCodeCanvas
          ref={canvasRef}
          value={detailUrl}
          size={192}
          level="M"
          marginSize={2}
          bgColor="#ffffff"
          fgColor="#0f172a"
          title={`${code} 详情页二维码`}
        />
      </div>
      <p className="mt-4 break-all text-sm font-medium text-emerald-700">
        {detailUrl}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
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
    </section>
  );
}
