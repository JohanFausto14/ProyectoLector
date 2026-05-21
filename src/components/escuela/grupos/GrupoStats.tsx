"use client";

export default function GrupoStats({ stats }: { stats: any }) {
  const items = [
    {
      label: "Total Grupos",
      value: stats.grupos,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      gradient: "from-[#d4af37]/10 to-[#d4af37]/5",
      iconColor: "text-[#d4af37]",
    },
    {
      label: "Total Alumnos",
      value: stats.alumnos,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: "from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-600",
    },
    {
      label: "Promedio Global",
      value: stats.promedio,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      gradient: "from-purple-500/10 to-purple-500/5",
      iconColor: "text-purple-600",
    },
    {
      label: "Libros Asignados",
      value: stats.libros,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: "from-emerald-500/10 to-emerald-500/5",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-gradient-to-br from-white to-[#faf8f5] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-xl bg-gradient-to-br ${item.gradient} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <div className={item.iconColor}>{item.icon}</div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">
                {item.label}
              </p>
              <h3 className="text-3xl font-playfair font-bold text-[#0a1628] group-hover:text-[#d4af37] transition-colors duration-300">
                {item.value}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}