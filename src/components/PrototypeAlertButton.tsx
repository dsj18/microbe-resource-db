"use client";

import type { ReactNode } from "react";

type PrototypeAlertButtonProps = {
  message: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function PrototypeAlertButton({
  message,
  children,
  variant = "secondary",
}: PrototypeAlertButtonProps) {
  const className =
    variant === "primary"
      ? "inline-flex h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
      : "inline-flex h-10 items-center justify-center rounded-md border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50";

  return (
    <button type="button" className={className} onClick={() => alert(message)}>
      {children}
    </button>
  );
}
