"use client";

import { useState } from "react";
import JSZip from "jszip";

type QrBatchDownloadButtonProps = {
  page: number;
};

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export function QrBatchDownloadButton({ page }: QrBatchDownloadButtonProps) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setStatus("");
    setError("");
    setIsDownloading(true);

    try {
      const canvases = Array.from(
        document.querySelectorAll<HTMLCanvasElement>(
          "canvas[data-qr-filename]",
        ),
      );

      if (canvases.length === 0) {
        setError("当前页没有可下载的二维码。");
        return;
      }

      const zip = new JSZip();

      for (const canvas of canvases) {
        const filename = canvas.dataset.qrFilename;

        if (!filename) {
          continue;
        }

        const blob = await canvasToBlob(canvas);

        if (!blob) {
          throw new Error(`二维码 ${filename} 生成失败`);
        }

        zip.file(filename, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR_codes_page_${page}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("当前页二维码已打包下载");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "批量下载失败",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="inline-flex h-12 items-center justify-center rounded-md bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isDownloading ? "打包中..." : "批量下载当前页二维码"}
      </button>
      {status ? (
        <p className="mt-2 text-sm text-emerald-700">{status}</p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

