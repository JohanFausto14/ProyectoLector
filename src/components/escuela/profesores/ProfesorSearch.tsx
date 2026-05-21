'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onNew: () => void;
  totalFiltered: number;
}

export default function ProfesorSearch({ value, onChange, onNew, totalFiltered }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-[#c8d8f0]/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-playfair text-2xl font-bold text-[#0a1628] flex items-center gap-2">
            Gestión de Profesores
            <span className="px-2.5 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-sm font-sans rounded-full">
              {totalFiltered}
            </span>
          </h3>
          <p className="text-sm text-[#1e3a6e] mt-1">Administra el personal docente</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex-1 md:w-80">
            <Input
              type="text"
              placeholder="Buscar profesor..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          </div>

          <Button
            onClick={onNew}
            variant="primary"
            size="md"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            }
            className="whitespace-nowrap"
          >
            Nuevo Profesor
          </Button>
        </div>
      </div>
    </div>
  );
}