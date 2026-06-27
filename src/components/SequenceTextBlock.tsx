"use client";

import { useState } from "react";

type SequenceTextBlockProps = {
  sequence: string | null;
};

const previewLength = 300;

export function SequenceTextBlock({ sequence }: SequenceTextBlockProps) {
  const text = sequence?.trim() || "";
  const [expanded, setExpanded] = useState(false);
  const canToggle = text.length > previewLength;
  const visibleText =
    canToggle && !expanded ? `${text.slice(0, previewLength)}...` : text;

  return (
    <div className="mt-3">
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-md bg-slate-950 p-4 font-mono text-sm leading-6 text-emerald-50">
        {visibleText || "暂无序列"}
      </pre>
      {canToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-3 inline-flex h-10 items-center justify-center rounded-md border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
        >
          {expanded ? "收起序列" : "展开完整序列"}
        </button>
      ) : null}
    </div>
  );
}

