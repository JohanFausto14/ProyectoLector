'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SidebarEscuela from '../../components/MenuLateral/SidebarEscuela';
import RouteGuard from '../../components/auth/RouteGuard';

export default function EscuelaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#f5f5f5] relative w-full max-w-full overflow-x-hidden">
      <SidebarEscuela isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 md:ml-64 px-4 py-2 md:px-8 md:py-4 min-h-screen transition-all">
        <header className="flex items-center gap-4 mb-2 md:mb-0">
          <button
            className="md:hidden text-[#0a1628] p-2 hover:bg-black/5 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
        <RouteGuard allowedRoles={['director']}>
          {children}
        </RouteGuard>
      </main>
    </div>
  );
}
