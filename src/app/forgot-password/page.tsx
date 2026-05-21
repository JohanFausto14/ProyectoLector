'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '../../service/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      // Siempre mostramos el mensaje de éxito (el back no revela si el email existe)
      setSubmitted(true);
    } catch {
      // Incluso si hay error de red, mostramos el mensaje genérico por seguridad
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#1A2F45] border border-[#d4af37]/30 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-10 pt-10 pb-6 border-b border-[#d4af37]/20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#d4af37]/10 rounded-full flex items-center justify-center border border-[#d4af37]/40">
              <svg className="w-8 h-8 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="font-playfair text-2xl font-bold text-[#d4af37] tracking-wide">
              Recuperar contraseña
            </h1>
            <p className="font-lora text-white/50 text-sm mt-2">
              PROYECTO LECTOR
            </p>
          </div>

          {/* Body */}
          <div className="px-10 py-8">
            {submitted ? (
              // Estado de éxito
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-5 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30">
                  <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/80 font-lora text-sm leading-relaxed mb-6">
                  Si el correo está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                </p>
                <p className="text-white/40 font-lora text-xs mb-8">
                  Revisa también tu carpeta de spam.
                </p>
                <Link
                  href="/login"
                  className="inline-block text-[#d4af37] font-lora text-sm underline decoration-[#d4af37]/30 hover:text-[#c41e3a] transition-colors"
                >
                  ← Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              // Formulario
              <form onSubmit={handleSubmit} noValidate>
                <p className="text-white/60 font-lora text-sm leading-relaxed mb-6">
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <div className="mb-5">
                  <label className="block font-lora text-[10px] uppercase text-[#d4af37] mb-2 tracking-widest">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-[#050c18]/70 border-b-2 border-[#1e3a6e] text-white font-playfair text-base py-2.5 px-3 focus:outline-none focus:border-[#c41e3a] transition-all rounded-t-sm placeholder-white/30"
                    autoComplete="email"
                  />
                  {error && (
                    <p className="text-red-400 text-[11px] mt-1.5 font-sans">⚠ {error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#c41e3a] text-white font-bold font-playfair text-sm uppercase py-3.5 rounded-sm shadow-lg hover:bg-[#a01830] active:scale-[0.98] transition-all tracking-[0.2em] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enviando...' : 'ENVIAR ENLACE'}
                </button>

                <div className="text-center mt-6">
                  <Link
                    href="/login"
                    className="text-white/40 font-lora text-xs hover:text-[#d4af37] transition-colors underline decoration-white/20"
                  >
                    ← Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}