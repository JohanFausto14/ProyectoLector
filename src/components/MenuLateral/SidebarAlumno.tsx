'use client';
import MenuBase from './MenuBase';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
}

export default function SidebarAlumno({ isOpen, onClose }: Props) {
  const menuItems = [
    {
      label: 'Mi Biblioteca',
      href: '/alumno/library',
      icon: 'library',
    },
    {
      label: 'Tienda',
      href: '/alumno/store',
      icon: 'store',
    },
    {
      label: 'Canjear Libro',
      href: '/alumno/redeem',
      icon: 'ticket',
    },
    {
      label: 'Progreso',
      href: '/alumno/stats',
      icon: 'chart',
    },
    {
      label: 'Horario',
      href: '/alumno/schedule',
      icon: 'calendar',
    },
    {
      label: 'Ajustes',
      href: '/alumno/settings',
      icon: 'settings',
    },
  ];

  return (
    <MenuBase
      isOpen={isOpen}
      role="Estudiante"
      menuItems={menuItems}
      onClose={onClose}
    />
  );
}