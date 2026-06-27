"use client";

import { useState } from "react";

export function HomeSearchBox() {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();

  return (
    <form
      action="/strains"
      className="mt-8 rounded-lg border border-emerald-100 bg-emerald-50/70 p-3 shadow-sm"
    >
      <label className="sr-only" htmlFor="home-search">
        搜索菌株
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="home-search"
          name="query"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="输入菌株编号、属名、作物或保存位置，例如 L2P01A8 / Variovorax / 油菜"
          className="h-12 w-full rounded-md border border-emerald-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        <button
          type="submit"
          disabled={!trimmedQuery}
          className="inline-flex h-12 items-center justify-center rounded-md bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          搜索
        </button>
      </div>
    </form>
  );
}
