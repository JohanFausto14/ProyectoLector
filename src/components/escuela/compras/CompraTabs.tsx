type Tab = 'todas' | 'licencias' | 'libros';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function CompraTabs({ active, onChange }: Props) {
  const tabs: Tab[] = ['todas', 'licencias', 'libros'];

  return (
    <div className="flex gap-2 border-b border-[#c8d8f0] pb-px">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-6 py-3 font-bold text-sm rounded-t-lg transition-all duration-300 capitalize ${
            active === tab
              ? 'bg-gradient-to-b from-[#d4af37]/10 to-transparent text-[#0a1628] border-b-2 border-[#d4af37]'
              : 'text-[#6b8cba] hover:text-[#0a1628] hover:bg-[#f5f8ff]'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}