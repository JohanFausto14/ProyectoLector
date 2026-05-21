import { Compra } from '@/types/escuela/compras';

interface Props {
  compra: Compra;
}

export default function CompraRow({ compra }: Props) {
  return (
    <tr className="block md:table-row bg-white md:bg-transparent mb-4 md:mb-0 rounded-xl md:rounded-none shadow-sm md:shadow-none border border-[#c8d8f0] md:border-b md:border-transparent hover:bg-[#faf8f5] transition-colors duration-200">
      <td className="block md:table-cell py-3 md:py-4 px-4 md:px-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center relative">
        <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Producto</span>
        <span className="font-lora font-semibold text-[#0a1628] block md:inline">
          {compra.nombre}
        </span>
      </td>
      <td className="block md:table-cell py-3 md:py-4 px-4 md:px-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
        <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Tipo</span>
        <span className="px-3 py-1 bg-gradient-to-r from-[#d4af37]/10 to-[#d4af37]/5 text-[#0a1628] text-xs font-bold rounded-full border border-[#d4af37]/20 capitalize inline-block whitespace-nowrap">
          {compra.tipo}
        </span>
      </td>
      <td className="block md:table-cell py-3 md:py-4 px-4 md:px-4 border-b border-[#c8d8f0]/30 md:border-0 text-[#1e3a6e] font-lora md:text-center">
        <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Cantidad</span>
        <span className="block md:inline">{compra.cantidad} unidades</span>
      </td>
      <td className="block md:table-cell py-3 md:py-4 px-4 md:px-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
        <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Total</span>
        <span className="font-playfair font-bold text-[#0a1628] text-lg block md:inline">
          ${compra.total.toLocaleString('es-MX')}
        </span>
      </td>
      <td className="block md:table-cell py-3 md:py-4 px-4 md:px-4 border-b border-[#c8d8f0]/30 md:border-0 md:text-center">
        <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba] mb-2 block">Estado</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold inline-block whitespace-nowrap ${compra.estado === 'activa'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-700'
            }`}
        >
          {compra.estado === 'activa' ? 'Activa' : 'Inactiva'}
        </span>
      </td>
      <td className="block md:table-cell py-3 md:py-4 px-4 md:px-4 flex md:table-cell justify-between items-center bg-[#f5f8ff]/50 md:bg-transparent rounded-b-xl md:rounded-none">
        <span className="md:hidden text-[10px] font-bold uppercase text-[#6b8cba]">Acciones</span>
        <div className="flex gap-2 justify-end md:justify-center">
          <button className="px-4 py-2 bg-white border-2 border-[#c8d8f0] hover:border-[#d4af37] hover:bg-[#f5f8ff] text-[#0a1628] rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            Ver
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#c19a2e] text-[#0a1628] rounded-lg font-bold text-sm hover:from-[#c19a2e] hover:to-[#b08a28] transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Editar
          </button>
        </div>
      </td>
    </tr>
  );
}