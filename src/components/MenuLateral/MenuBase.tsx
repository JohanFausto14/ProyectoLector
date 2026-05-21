'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';
import { useAuth } from '../../context/AuthContext';

interface MenuItem {
  href: string;
  label: string;
  icon: string;
}

interface MenuBaseProps {
  isOpen: boolean;
  role?: string;
  menuItems: MenuItem[];
  onClose?: () => void;
  navyTheme?: boolean;
}

export default function MenuBase({
  isOpen,
  menuItems,
  onClose,
  navyTheme = true,
}: MenuBaseProps) {
  const pathname = usePathname();
  const { displayName, roleLabel, logout } = useAuth();

  // --- Lógica de Cierre de Sesión ---
  const handleLogout = () => {
    logout();
  };

  // --- Renderizador de Iconos ---
  const renderIcon = (iconName: string): ReactElement => {
    const iconProps = {
      className: 'w-6 h-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
    };

    const icons: Record<string, ReactElement> = {
      library: (
        <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
      ),
      chart: (
        <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      ),
      users: (
        <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ),
      settings: (
        <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      ),
      logout: (
        <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      ),
      book: (
        <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
      ),
    };

    return icons[iconName] || icons.book;
  };

  const isReader = pathname.includes('/reader');

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 ${
        navyTheme ? 'bg-[#1A2F45] text-white' : 'bg-[#0a1628] text-[#f5f8ff]'
      } flex flex-col py-8 shadow-2xl z-[1000] transition-transform duration-300 ${
        isOpen
          ? 'translate-x-0'
          : isReader
            ? '-translate-x-full'
            : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Logo */}
      <div className="mb-10 px-6 flex flex-col items-center text-center">
        <span className="text-[#d4af37] font-black tracking-[0.2em] text-xl leading-none">PROYECTO</span>
        <span className="text-[#d4af37] font-bold tracking-[0.3em] text-xl mt-1 leading-none">LECTOR</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 px-2">
        {menuItems.map((item) => {
          // Calcular cuál es el ítem con el href más largo (más específico) que coincide
          // con el pathname actual. Solo ese gana — así nunca quedan dos seleccionados.
          const matches = (href: string) =>
            pathname === href || pathname.startsWith(href + '/');

          const bestMatch = menuItems
            .filter(m => matches(m.href))
            .reduce<string | null>((best, m) =>
              best === null || m.href.length > best.length ? m.href : best
            , null);

          const isActive = bestMatch === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all ${isActive
                  ? navyTheme
                    ? 'bg-[#c41e3a]/20 text-[#d4af37] border-l-2 border-[#c41e3a]'
                    : 'bg-[#d4af37]/10 text-[#d4af37]'
                  : navyTheme
                    ? 'text-[#c8d8f0] hover:bg-[#0d1b2a] hover:text-white'
                    : 'text-[#6b8cba] hover:bg-[#d4af37]/5 hover:text-[#f5f8ff]'
                }`}
            >
              <div className="w-6 h-6">{renderIcon(item.icon)}</div>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}

      </nav>

      {/* User & Logout Section */}
      <div className={`mt-auto px-4 pt-6 border-t ${navyTheme ? 'border-[#1e3a6e]' : 'border-[#1a2d5a]'}`}>
        <div className="mb-4 px-2">
          <p className="text-sm font-semibold">{displayName}</p>
          <p className={`text-xs ${navyTheme ? 'text-[#6b8cba]' : 'text-[#6b8cba]'}`}>{roleLabel}</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors group"
        >
          <div className="w-6 h-6 group-hover:scale-110 transition-transform">
            {renderIcon('logout')}
          </div>
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}