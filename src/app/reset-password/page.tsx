'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '../../service/auth.service';

// ── Componente interno que usa useSearchParams ─────────────────
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      setTokenError(true);
    } else {
      setToken(t);
    }
  }, [searchParams]);

  const validate = (): string => {
    if (!nuevaPassword || nuevaPassword.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (nuevaPassword.length > 100) {
      return 'La contraseña no puede superar 100 caracteres.';
    }
    if (nuevaPassword !== confirmarPassword) {
      return 'Las contraseñas no coinciden.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, nuevaPassword);
      setSuccess(true);
      // Redirigir al login tras 3 segundos
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string[] | string } } };
      const msg = axiosError.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg[0]);
      } else if (typeof msg === 'string') {
        setError(msg);
      } else {
        setError('Ocurrió un error. El enlace puede haber expirado. Solicita uno nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Token inválido o ausente
  if (tokenError) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-5 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-white/80 font-lora text-sm leading-relaxed mb-6">
          El enlace no es válido o ya fue utilizado. Solicita uno nuevo desde la página de recuperación.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block bg-[#c41e3a] text-white font-bold font-playfair text-sm uppercase py-3 px-6 rounded-sm shadow-lg hover:bg-[#a01830] transition-all tracking-[0.2em]"
        >
          SOLICITAR NUEVO ENLACE
        </Link>
      </div>
    );
  }

  // Éxito
  if (success) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-5 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30">
          <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white/80 font-lora text-sm leading-relaxed mb-2">
          ¡Contraseña restablecida exitosamente!
        </p>
        <p className="text-white/40 font-lora text-xs mb-6">
          Serás redirigido al inicio de sesión en unos segundos...
        </p>
        <Link
          href="/login"
          className="text-[#d4af37] font-lora text-sm underline decoration-[#d4af37]/30 hover:text-[#c41e3a] transition-colors"
        >
          Ir al inicio de sesión →
        </Link>
      </div>
    );
  }

  // Formulario
  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="text-white/60 font-lora text-sm leading-relaxed mb-6">
        Elige una nueva contraseña para tu cuenta.
      </p>

      {/* Nueva contraseña */}
      <div className="mb-4">
        <label className="block font-lora text-[10px] uppercase text-[#d4af37] mb-2 tracking-widest">
          Nueva contraseña
        </label>
        <input
          type="password"
          value={nuevaPassword}
          onChange={(e) => { setNuevaPassword(e.target.value); setError(''); }}
          placeholder="Mínimo 6 caracteres"
          minLength={6}
          maxLength={100}
          className="w-full bg-[#050c18]/70 border-b-2 border-[#1e3a6e] text-white font-playfair text-base py-2.5 px-3 focus:outline-none focus:border-[#c41e3a] transition-all rounded-t-sm placeholder-white/30"
          autoComplete="new-password"
        />
      </div>

      {/* Confirmar contraseña */}
      <div className="mb-5">
        <label className="block font-lora text-[10px] uppercase text-[#d4af37] mb-2 tracking-widest">
          Confirmar contraseña
        </label>
        <input
          type="password"
          value={confirmarPassword}
          onChange={(e) => { setConfirmarPassword(e.target.value); setError(''); }}
          placeholder="Repite la contraseña"
          className="w-full bg-[#050c18]/70 border-b-2 border-[#1e3a6e] text-white font-playfair text-base py-2.5 px-3 focus:outline-none focus:border-[#c41e3a] transition-all rounded-t-sm placeholder-white/30"
          autoComplete="new-password"
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
        {isLoading ? 'Guardando...' : 'RESTABLECER CONTRASEÑA'}
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
  );
}

// ── Page (envuelve en Suspense por useSearchParams) ────────────
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-[#1A2F45] border border-[#d4af37]/30 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-10 pt-10 pb-6 border-b border-[#d4af37]/20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#d4af37]/10 rounded-full flex items-center justify-center border border-[#d4af37]/40">
              <svg className="w-8 h-8 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="font-playfair text-2xl font-bold text-[#d4af37] tracking-wide">
              Nueva contraseña
            </h1>
            <p className="font-lora text-white/50 text-sm mt-2">
              PROYECTO LECTOR
            </p>
          </div>

          {/* Body */}
          <div className="px-10 py-8">
            <Suspense fallback={
              <p className="text-white/50 font-lora text-sm text-center">Cargando...</p>
            }>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}