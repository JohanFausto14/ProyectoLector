'use client';

import { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { sanitizeText, focusFirstError } from '../../../utils/formValidation';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export default function NuevaCompraModal({ open, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    tipo: '',
    nombre: '',
    cantidad: '',
    precioUnitario: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const sNombre = sanitizeText(formData.nombre);

    if (!formData.tipo) newErrors.tipo = 'Selecciona un tipo de compra';
    if (!sNombre) newErrors.nombre = 'El nombre es requerido';

    const qty = Number(formData.cantidad);
    if (!formData.cantidad || Number.isNaN(qty) || qty <= 0) {
      newErrors.cantidad = 'Cantidad inválida';
    }

    const price = Number(formData.precioUnitario);
    if (!formData.precioUnitario || Number.isNaN(price) || price < 0) {
      newErrors.precioUnitario = 'Precio inválido';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const payload = {
        ...formData,
        nombre: sanitizeText(formData.nombre),
        cantidad: Number(formData.cantidad),
        precioUnitario: Number(formData.precioUnitario),
      };
      onSubmit?.(payload);
      setIsLoading(false);
      handleClose();
    }, 1000);
  };

  const handleClose = () => {
    setFormData({ tipo: '', nombre: '', cantidad: '', precioUnitario: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose} title="Nueva Compra" size="md">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label className="block text-sm font-bold text-[#0a1628] mb-2">
            Tipo de Compra <span className="text-red-500">*</span>
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-4 py-3 rounded-xl border-2 bg-white focus:outline-none focus:ring-4 font-lora text-sm transition-all duration-300 ${errors.tipo ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-[#c8d8f0] focus:border-[#d4af37] focus:ring-[#d4af37]/10'
              }`}
          >
            <option value="">Seleccionar tipo...</option>
            <option value="licencia">Licencia</option>
            <option value="libro">Libro</option>
          </select>
          {errors.tipo && <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#0a1628] mb-2">
            Nombre del Producto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Ej: Licencia Premium, Cien Años de Soledad"
            className={`w-full px-4 py-3 rounded-xl border-2 bg-white focus:outline-none focus:ring-4 font-lora text-sm transition-all duration-300 ${errors.nombre ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-[#c8d8f0] focus:border-[#d4af37] focus:ring-[#d4af37]/10'
              }`}
          />
          {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#0a1628] mb-2">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              disabled={isLoading}
              min="1"
              placeholder="0"
              className={`w-full px-4 py-3 rounded-xl border-2 bg-white focus:outline-none focus:ring-4 font-lora text-sm transition-all duration-300 ${errors.cantidad ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-[#c8d8f0] focus:border-[#d4af37] focus:ring-[#d4af37]/10'
                }`}
            />
            {errors.cantidad && <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0a1628] mb-2">
              Precio Unitario <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="precioUnitario"
              value={formData.precioUnitario}
              onChange={handleChange}
              disabled={isLoading}
              min="0"
              step="0.01"
              placeholder="$0.00"
              className={`w-full px-4 py-3 rounded-xl border-2 bg-white focus:outline-none focus:ring-4 font-lora text-sm transition-all duration-300 ${errors.precioUnitario ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-[#c8d8f0] focus:border-[#d4af37] focus:ring-[#d4af37]/10'
                }`}
            />
            {errors.precioUnitario && <p className="mt-1 text-sm text-red-600">{errors.precioUnitario}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-[#c8d8f0]">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-white border-2 border-[#c8d8f0] hover:border-[#d4af37] hover:bg-[#f5f8ff] text-[#0a1628] rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0a1628] to-[#1e3a6e] text-[#f5f8ff] rounded-xl font-bold hover:from-[#1e3a6e] hover:to-[#1a2d5a] shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Procesando...' : 'Guardar Compra'}
          </button>
        </div>
      </form>
    </Modal>
  );
}