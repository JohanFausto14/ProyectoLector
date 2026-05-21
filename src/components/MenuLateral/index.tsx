// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';

// export const MenuLateral: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
//     const pathname = usePathname();

//     // Mapping ID to Route
//     const menuItems = [
//         { route: '/alumno/library', icon: 'library', label: 'Mi Biblioteca' },
//         { route: '/alumno/store', icon: 'store', label: 'Tienda' },
//         { route: '/alumno/redeem', icon: 'ticket', label: 'Canjear Código' },
//         { route: '/alumno/stats', icon: 'chart', label: 'Progreso' },
//         { route: '/alumno/schedule', icon: 'calendar', label: 'Horario' },
//         { route: '/alumno/settings', icon: 'settings', label: 'Ajustes' },
//     ];

//     return (
//         <aside
//             className={`fixed left-0 top-0 h-full w-64 bg-[#0a1628] text-[#f5f8ff] flex flex-col items-stretch py-8 shadow-2xl z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
//         >
//             <div className="mb-10 px-6 flex flex-col items-center text-center">
//                 <span className="text-[#d4af37] font-black tracking-[0.2em] text-xl leading-none">PROYECTO</span>
//                 <span className="text-[#d4af37] font-bold tracking-[0.3em] text-xl mt-1 leading-none">LECTOR</span>
//             </div>

//             <nav className="flex-1 flex flex-col gap-2 px-2">
//                 {menuItems.map(item => {
//                     // Check if current path starts with the item route (simple active check)
//                     const isActive = pathname === item.route;

//                     return (
//                         <Link
//                             key={item.route}
//                             href={item.route}
//                             className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group relative overflow-hidden focus:outline-none
//                                 ${isActive
//                                     ? 'bg-[#d4af37]/10 text-[#d4af37]'
//                                     : 'text-[#6b8cba] hover:bg-[#d4af37]/5 hover:text-[#f5f8ff]'
//                                 }`}
//                         >
//                             {/* Active Indicator */}
//                             <div
//                                 className={`absolute left-0 top-0 bottom-0 w-1 bg-[#d4af37] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
//                             ></div>

//                             <div className="icon-container w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110">
//                                 {item.icon === 'library' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>}
//                                 {item.icon === 'store' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>}
//                                 {item.icon === 'ticket' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>}
//                                 {item.icon === 'chart' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
//                                 {item.icon === 'calendar' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
//                                 {item.icon === 'settings' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
//                             </div>

//                             <span className="block font-lora text-base tracking-wide">{item.label}</span>
//                         </Link>
//                     )
//                 })}
//             </nav>

//             <div className="mt-auto px-4 py-6 border-t border-[#1a2d5a]">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-[#1e3a6e] overflow-hidden border-2 border-[#d4af37] flex items-center justify-center">
//                         {/* Avatar Icon (using SVG to avoid image requirement) */}
//                         <svg className="w-6 h-6 text-[#0a1628]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
//                     </div>
//                     <div className="block">
//                         <p className="text-[#f5f8ff] text-sm font-playfair font-bold">Estudiante</p>
//                         <p className="text-[#6b8cba] text-xs">Clase A-1</p>
//                     </div>
//                 </div>
//             </div>
//         </aside>
//     );
// };

// export default MenuLateral;
