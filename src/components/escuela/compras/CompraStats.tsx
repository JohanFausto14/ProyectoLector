interface Props {
  totalGastado: number;
  licenciasActivas: number;
  librosComprados: number;
  totalCompras: number;
}

export default function CompraStats({
  totalGastado,
  licenciasActivas,
  librosComprados,
  totalCompras,
}: Props) {
  const items = [
    {
      label: 'Total Invertido',
      value: `$${totalGastado.toLocaleString('es-MX')}`,
      icon: (
        <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      color: 'from-emerald-500/10 to-emerald-500/5',
    },
    {
      label: 'Licencias Activas',
      value: licenciasActivas,
      icon: (
        <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
        </svg>
      ),
      color: 'from-blue-500/10 to-blue-500/5',
    },
    {
      label: 'Libros Comprados',
      value: librosComprados,
      icon: (
        <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      ),
      color: 'from-amber-500/10 to-amber-500/5',
    },
    {
      label: 'Total Compras',
      value: totalCompras,
      icon: (
        <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
      ),
      color: 'from-purple-500/10 to-purple-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-gradient-to-br from-white to-[#faf8f5] rounded-xl p-6 shadow-md border border-[#c8d8f0]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-xl bg-gradient-to-br ${item.color} shadow-sm`}>
              {item.icon}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#6b8cba] mb-1">
                {item.label}
              </p>
              <h3 className="text-3xl font-playfair font-bold text-[#0a1628]">
                {item.value}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}