'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SidebarProfesor from '../../components/MenuLateral/SidebarProfesor';
import RouteGuard from '../../components/auth/RouteGuard';

export default function ProfesorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const getTitle = () => {
    if (pathname.includes('/alumnos')) return { title: 'Mis Alumnos', sub: 'Gestión académica.' };
    if (pathname.includes('/horario')) return { title: 'Horario', sub: 'Clases asignadas.' };
    return { title: 'Panel Profesor', sub: 'Bienvenido profesor.' };
  };

  const currentTitle = getTitle();

  return (
    <div className="min-h-screen flex bg-[#f5f5f5] relative w-full max-w-full overflow-x-hidden">

      <SidebarProfesor isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 md:ml-64 p-4 md:p-8 min-h-screen transition-all">
        <header className="flex items-center gap-4 mb-8">
          <button
            className="md:hidden text-[#0a1628] p-2 hover:bg-black/5 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">{currentTitle.title}</h1>
            <p className="text-sm text-gray-600 hidden md:block">{currentTitle.sub}</p>
          </div>
        </header>
        <RouteGuard allowedRoles={['maestro']}>
          {children}
        </RouteGuard>
      </main>
    </div>
  );
}
