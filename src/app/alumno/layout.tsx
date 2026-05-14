'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SidebarAlumno from '../../components/MenuLateral/SidebarAlumno';
import RouteGuard from '../../components/auth/RouteGuard';

export default function DashboardLayout({
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

  // 🔹 Titles por ruta
  const getTitle = () => {
    if (pathname.includes('/library'))
      return { title: 'Mi Biblioteca', sub: 'Tus libros y progreso académico.' };

    if (pathname.includes('/store'))
      return { title: 'Tienda de Libros', sub: 'Explora y descubre nuevo conocimiento.' };

    if (pathname.includes('/redeem'))
      return { title: 'Canjear Libro', sub: 'Activa tus licencias institucionales.' };

    if (pathname.includes('/stats'))
      return { title: 'Tu Progreso', sub: 'Estadísticas detalladas de aprendizaje.' };

    if (pathname.includes('/schedule'))
      return { title: 'Horario', sub: 'Próximas clases y lecturas asignadas.' };

    if (pathname.includes('/settings'))
      return { title: 'Ajustes', sub: 'Configura tu perfil y preferencias.' };

    return { title: 'Panel Principal', sub: 'Bienvenido a tu plataforma.' };
  };

  const currentTitle = getTitle();

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex relative">
      {/* Sidebar */}
      <SidebarAlumno isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen transition-all">

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">

            {/* Burger */}
            <button
              className="md:hidden text-[#2b1b17] p-2 hover:bg-black/5 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Title */}
            <div>
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-[#2b1b17]">
                {currentTitle.title}
              </h1>
              <p className="hidden md:block font-lora text-[#5d4037] italic mt-1 text-sm md:text-base">
                {currentTitle.sub}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#a1887f] hover:text-[#d4af37] transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="animate-fade">
          <RouteGuard allowedRoles={['alumno']}>
            {children}
          </RouteGuard>
        </div>
      </main>
    </div>
  );
}