interface Props {
  value: string;
  onChange: (v: string) => void;
  onNew: () => void;
}

export default function CompraSearch({ value, onChange, onNew }: Props) {
  return (
    <div className="flex gap-2 w-full md:w-auto">
      <div className="relative flex-1 md:w-80">
        <input
          type="text"
          placeholder="Buscar compra..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#c8d8f0] bg-white focus:outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 font-lora text-sm transition-all duration-300"
        />
        <svg
          className="w-5 h-5 text-[#6b8cba] absolute left-4 top-1/2 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>

      <button
        onClick={onNew}
        className="px-6 py-3 bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] rounded-xl font-bold hover:from-[#1e3a6e] hover:to-[#1a2d5a] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nueva Compra
      </button>
    </div>
  );
}