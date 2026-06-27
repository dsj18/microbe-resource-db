"use client";

import { useState } from "react";

type SequenceTextBlockProps = {
  sequence: string | null;
};

const previewLength = 300;

function formatSequence(sequence: string) {
  return sequence.replace(/\s+/g, "").replace(/(.{80})/g, "$1\n").trim();
}

export function SequenceTextBlock({ sequence }: SequenceTextBlockProps) {
  const text = sequence?.trim() || "";
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("");
  const canToggle = text.length > previewLength;
  const visibleText =
    canToggle && !expanded ? `${text.slice(0, previewLength)}...` : text;
  const formattedText = formatSequence(visibleText);

  async function handleCopy() {
    setStatus("");

    try {
      await navigator.clipboard.writeText(text);
      setStatus("已复制序列");
    } catch {
      setStatus("复制失败");
    }
  }

  if (!text) {
    return (
      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
        暂无序列信息
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">
          序列长度：{text.replace(/\s+/g, "").length} bp
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
          >
            复制序列
          </button>
          {canToggle ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              {expanded ? "收起序列" : "展开完整序列"}
            </button>
          ) : null}
        </div>
      </div>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md border border-emerald-100 bg-emerald-50 p-4 font-mono text-sm leading-6 text-slate-800">
        {formattedText}
      </pre>
      {status ? (
        <p className="mt-2 text-sm text-emerald-700">{status}</p>
      ) : null}
    </div>
  );
}
