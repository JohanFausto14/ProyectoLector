interface Props {
  totalProfesores: number;
  totalActivos: number;
  totalAlumnosAtendidos: number;
  totalGrupos: number;
}

export default function ProfesorStats({
  totalProfesores,
  totalActivos,
  totalAlumnosAtendidos,
  totalGrupos,
}: Props) {
  const stats = [
    {
      label: 'Total Profesores',
      value: totalProfesores,
      icon: (
        <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      ),
      color: 'from-indigo-500/10 to-indigo-500/5',
    },
    {
      label: 'Activos',
      value: totalActivos,
      icon: (
        <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      color: 'from-emerald-500/10 to-emerald-500/5',
    },
    {
      label: 'Estudiantes',
      value: totalAlumnosAtendidos,
      icon: (
        <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ),
      color: 'from-blue-500/10 to-blue-500/5',
    },
    {
      label: 'Grupos Asignados',
      value: totalGrupos,
      icon: (
        <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      ),
      color: 'from-purple-500/10 to-purple-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gradient-to-br from-white to-[#faf8f5] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-sm`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">
                {stat.label}
              </p>
              <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">
                {stat.value}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}