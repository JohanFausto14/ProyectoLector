'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SidebarAdmin from '../../components/MenuLateral/SidebarAdmin';
import RouteGuard from '../../components/auth/RouteGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar sidebar al cambiar de ruta
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const getTitle = () => {
    if (pathname.includes('/usuarios')) return { title: 'Usuarios', sub: 'Gestión general del sistema.' };
    if (pathname.includes('/reportes')) return { title: 'Reportes', sub: 'Estadísticas globales.' };
    if (pathname.includes('/libros/cargar')) return { title: 'Cargar libro', sub: 'Subir PDF y metadatos.' };
    if (pathname.includes('/libros/') && pathname !== '/admin/libros') return { title: 'Detalle libro', sub: 'Unidades y segmentos.' };
    if (pathname.includes('/libros')) return { title: 'Libros', sub: 'Catálogo y carga de libros.' };
    if (pathname.includes('/escuelas')) return { title: 'Escuelas', sub: 'Gestión de instituciones.' };
    return { title: 'Panel Admin', sub: 'Administración del sistema.' };
  };

  const currentTitle = getTitle();

  return (
    <div className="min-h-screen bg-[#eef2ff] flex relative w-full max-w-full overflow-x-hidden">

      <SidebarAdmin isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 md:ml-64 px-4 py-2 md:px-8 md:py-4 min-h-screen transition-all">

        <header className="flex items-center gap-4 mb-2 md:mb-0">
          <button
            className="md:hidden text-[#1a2d5a] p-2 hover:bg-[#1a2d5a]/5 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

        </header>

        <RouteGuard allowedRoles={['administrador']}>
          {children}
        </RouteGuard>
      </main>
    </div>
  );
}
