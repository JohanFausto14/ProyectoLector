"use client";

import { useState } from "react";

export default function GrupoFilters({
  onFilter,
}: {
  onFilter: (v: string) => void;
}) {
  const [active, setActive] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtros = [
    { label: "Todos", color: "bg-[#d4af37] text-[#0a1628]" },
    { label: "1er Grado", color: "bg-blue-500 text-white" },
    { label: "2do Grado", color: "bg-purple-500 text-white" },
    { label: "3er Grado", color: "bg-emerald-500 text-white" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Filtros de grado */}
      <div className="flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f.label}
            onClick={() => {
              setActive(f.label);
              onFilter(f.label);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
              active === f.label
                ? `${f.color} shadow-md`
                : "bg-[#f5f8ff] text-[#1e3a6e] hover:bg-[#c8d8f0]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-72">
        <input
          type="text"
          placeholder="Buscar grupo o profesor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-white focus:outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 font-lora text-sm transition-all duration-300"
        />
        <svg
          className="w-5 h-5 text-[#6b8cba] absolute left-4 top-1/2 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8cba] hover:text-[#0a1628] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}