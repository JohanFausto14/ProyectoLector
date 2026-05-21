'use client';

import { useMemo, useState } from 'react';
import { Compra } from '@/types/escuela/compras';

// Importa tus componentes
import CompraStats from '@/components/escuela/compras/CompraStats';
import CompraTabs from '@/components/escuela/compras/CompraTabs';
import CompraSearch from '@/components/escuela/compras/CompraSearch';
import CompraTable from '@/components/escuela/compras/CompraTable';
import NuevaCompraModal from '@/components/escuela/compras/NuevaCompraModal';
import EmptyState from '@/components/escuela/compras/EmptyState';

export default function ComprasPage() {
  const [activeTab, setActiveTab] = useState<'todas' | 'licencias' | 'libros'>('todas');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // 🔵 Simulación — luego vendrá del backend (service)
  const compras: Compra[] = [
    {
      id: 1,
      tipo: 'licencia',
      nombre: 'Licencia Premium',
      cantidad: 50,
      precioUnitario: 299,
      total: 14950,
      fecha: '2024-01-15',
      estado: 'activa',
    },
    {
      id: 2,
      tipo: 'libro',
      nombre: 'Cien Años de Soledad',
      cantidad: 25,
      precioUnitario: 380,
      total: 9500,
      fecha: '2024-02-10',
      estado: 'activa',
    },
  ];

  // 🔎 Filtros
  const filtered = useMemo(() => {
    return compras.filter((c) => {
      const matchesSearch = c.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'todas' || c.tipo === activeTab.slice(0, -1);
      return matchesSearch && matchesTab;
    });
  }, [compras, search, activeTab]);

  // 📊 Stats
  const stats = useMemo(() => {
    return {
      totalGastado: compras.reduce((a, b) => a + b.total, 0),
      licenciasActivas: compras.filter((c) => c.tipo === 'licencia' && c.estado === 'activa').length,
      librosComprados: compras.filter((c) => c.tipo === 'libro').reduce((a, b) => a + b.cantidad, 0),
      totalCompras: compras.length,
    };
  }, [compras]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 📊 Estadísticas */}
      <CompraStats {...stats} />

      {/* 🔍 Search and Actions */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-[#c8d8f0]/50">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-playfair text-2xl font-bold text-[#0a1628] flex items-center gap-2">
                Gestión de Compras
                <span className="px-2.5 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-sm font-sans rounded-full">
                  {filtered.length}
                </span>
              </h3>
              <p className="text-sm text-[#1e3a6e] mt-1">Administra las compras de licencias y libros</p>
            </div>

            <CompraSearch
              value={search}
              onChange={setSearch}
              onNew={() => setShowModal(true)}
            />
          </div>

          {/* Tabs */}
          <CompraTabs active={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* 📋 Tabla o Empty State */}
      {filtered.length === 0 ? (
        <EmptyState text="No se encontraron compras" />
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-[#c8d8f0]/50 overflow-hidden">
          <CompraTable compras={filtered} />
        </div>
      )}

      {/* ➕ Modal */}
      <NuevaCompraModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}