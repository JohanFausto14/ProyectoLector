import { Compra } from '@/types/escuela/compras';
import CompraRow from './CompraRow';

interface Props {
  compras: Compra[];
}

export default function CompraTable({ compras }: Props) {
  return (
    <div className="w-full">
      <table className="w-full block md:table">
        <thead className="hidden md:table-header-group">
          <tr className="border-b-2 border-[#c8d8f0] block md:table-row">
            <th className="text-center py-4 px-4 font-playfair font-bold text-[#0a1628] text-sm uppercase tracking-wider">
              Producto
            </th>
            <th className="text-center py-4 px-4 font-playfair font-bold text-[#0a1628] text-sm uppercase tracking-wider">
              Tipo
            </th>
            <th className="text-center py-4 px-4 font-playfair font-bold text-[#0a1628] text-sm uppercase tracking-wider">
              Cantidad
            </th>
            <th className="text-center py-4 px-4 font-playfair font-bold text-[#0a1628] text-sm uppercase tracking-wider">
              Total
            </th>
            <th className="text-center py-4 px-4 font-playfair font-bold text-[#0a1628] text-sm uppercase tracking-wider">
              Estado
            </th>
            <th className="text-center py-4 px-4 font-playfair font-bold text-[#0a1628] text-sm uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody className="block md:table-row-group space-y-4 md:space-y-0 p-4 md:p-0">
          {compras.map((c) => (
            <CompraRow key={c.id} compra={c} />
          ))}
        </tbody>
      </table>
    </div>
  );
}