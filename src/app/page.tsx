'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-lora overflow-hidden flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d4af37] rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4a90e2] rounded-full filter blur-3xl animate-pulse"></div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex flex-wrap justify-between items-center p-4 md:p-6 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#d4af37] rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#f5f8ff] rounded-full flex items-center justify-center transform group-hover:rotate-180 transition-transform duration-500">
              <svg className="w-6 h-6 text-[#0a0a0a]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
              </svg>
            </div>
          </div>
          <span className="font-playfair text-xl md:text-2xl font-bold tracking-widest bg-gradient-to-r from-[#d4af37] to-[#f5f8ff] bg-clip-text text-transparent">
            PROYECTO LECTOR
          </span>
        </div>
        <div className="flex gap-2 md:gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-end sm:justify-start">
          <Link
            href="/login"
            className="px-4 md:px-6 py-2 text-white/80 hover:text-white transition-colors font-bold relative group text-sm md:text-base"
          >
            <span className="relative z-10">Iniciar Sesión</span>
            <div className="absolute inset-0 bg-white/5 rounded-lg scale-0 group-hover:scale-100 transition-transform"></div>
          </Link>
          <Link
            href="/registro"
            className="px-4 md:px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#c19b2f] text-[#0a0a0a] rounded-lg font-bold shadow-lg hover:shadow-[#d4af37]/50 transition-all transform hover:scale-105 relative overflow-hidden group text-sm md:text-base"
          >
            <span className="relative z-10">Registrarse</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f8ff] to-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 flex flex-col items-center justify-center text-center py-20 md:py-32 px-4 flex-grow">
        <div
          className={`max-w-5xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-[#d4af37]/30 rounded-full mb-8">
            <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse"></div>
            <span className="text-sm text-[#d4af37] font-semibold">Plataforma Educativa del Futuro</span>
          </div>

          <h1 className="font-playfair text-5xl sm:text-6xl md:text-8xl font-bold mb-4 md:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-[#d4af37] to-white bg-clip-text text-transparent">
              El Conocimiento
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#d4af37] via-[#f5f8ff] to-[#d4af37] bg-clip-text text-transparent">
              es Poder
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-8 md:mb-12 leading-relaxed max-w-2xl mx-auto">
            Plataforma educativa integral con{' '}
            <span className="text-[#d4af37] font-semibold">IA avanzada</span> para alumnos,
            profesores y escuelas. Gestione el aprendizaje y potencie el futuro.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full max-w-xs sm:max-w-none mx-auto">
            <Link
              href="/login"
              className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#d4af37] to-[#c19b2f] rounded-full font-bold text-base md:text-lg text-[#0a0a0a] overflow-hidden transform hover:scale-105 transition-all shadow-lg hover:shadow-[#d4af37]/50 w-full sm:w-auto flex justify-center"
            >
              <span className="relative z-10 flex items-center gap-2">
                Comenzar Ahora
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#f5f8ff] to-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              href="/registro"
              className="group relative px-6 md:px-8 py-3 md:py-4 bg-white/5 backdrop-blur-md border-2 border-[#d4af37] rounded-full font-bold text-base md:text-lg text-white overflow-hidden transform hover:scale-105 transition-all w-full sm:w-auto flex justify-center"
            >
              <span className="relative z-10">Crear Cuenta</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 to-[#c19b2f]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mt-16 md:mt-20 max-w-3xl mx-auto w-full">
            {[
              { value: '10K+', label: 'Estudiantes' },
              { value: '500+', label: 'Profesores' },
              { value: '50+', label: 'Instituciones' },
            ].map((stat, index) => (
              <div
                key={index}
                className="p-4 md:p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all transform hover:scale-105"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f5f8ff] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>

      {/* Features Section */}
      <section className="relative z-10 py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full text-[#d4af37] text-sm font-semibold mb-4">
            SERVICIOS
          </span>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Tecnología de Vanguardia
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Soluciones integrales para cada rol en el ecosistema educativo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            title="Para Alumnos"
            desc="Biblioteca digital inteligente con IA, seguimiento de progreso en tiempo real y gamificación del aprendizaje."
            icon="book"
            gradient="from-blue-500 to-purple-600"
          />
          <FeatureCard
            title="Para Profesores"
            desc="Dashboard analytics avanzado, asignación inteligente de contenido y herramientas de evaluación automatizada."
            icon="chart"
            gradient="from-[#d4af37] to-[#f5f8ff]"
          />
          <FeatureCard
            title="Para Escuelas"
            desc="Sistema de gestión integral, reportes en tiempo real y administración centralizada de toda la institución."
            icon="building"
            gradient="from-green-500 to-teal-600"
          />
        </div>

        {/* Tech Features */}
        <div className="mt-20 md:mt-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <h3 className="font-playfair text-3xl md:text-4xl font-bold text-center lg:text-left">
              Impulsado por{' '}
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f5f8ff] bg-clip-text text-transparent">
                Inteligencia Artificial
              </span>
            </h3>
            <div className="space-y-6">
              {[
                {
                  title: 'Recomendaciones Personalizadas',
                  desc: 'IA que adapta el contenido según el nivel y preferencias del estudiante',
                },
                {
                  title: 'Análisis Predictivo',
                  desc: 'Identifica áreas de mejora antes de que se conviertan en problemas',
                },
                {
                  title: 'Evaluación Automatizada',
                  desc: 'Calificación inteligente con feedback instantáneo y detallado',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#c19b2f] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                    <p className="text-white/60 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative order-1 lg:order-2 max-w-md mx-auto w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-3xl blur-3xl"></div>
            <div className="relative p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl">
              <div className="aspect-square bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 to-transparent animate-pulse"></div>
                <svg className="w-32 h-32 text-[#d4af37] relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 via-transparent to-[#d4af37]/20 blur-3xl"></div>
          <div className="relative p-12 bg-white/5 backdrop-blur-md border border-[#d4af37]/30 rounded-3xl">
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              ¿Listo para Transformar{' '}
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f5f8ff] bg-clip-text text-transparent">
                la Educación
              </span>
              ?
            </h2>
            <p className="text-white/70 text-base md:text-lg mb-8 max-w-2xl mx-auto">
              Únete a miles de instituciones que ya están revolucionando el aprendizaje con nuestra plataforma
            </p>
            <Link
              href="/registro"
              className="inline-flex items-center justify-center gap-2 px-6 md:px-10 py-3 md:py-4 bg-gradient-to-r from-[#d4af37] to-[#c19b2f] rounded-full font-bold text-base md:text-lg text-[#0a0a0a] transform hover:scale-105 transition-all shadow-lg hover:shadow-[#d4af37]/50 w-full sm:w-auto"
            >
              Empezar Gratis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-md py-8 md:py-12 text-center mt-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#f5f8ff] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#0a0a0a]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
              </svg>
            </div>
            <span className="font-playfair text-2xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f5f8ff] bg-clip-text text-transparent">
              PROYECTO LECTOR
            </span>
          </div>
          <p className="text-white/50">© 2026 Proyecto Lector. Todos los derechos reservados.</p>
          <div className="flex justify-center gap-6 mt-6">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-white/50 hover:text-[#d4af37] transition-colors"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
  gradient,
}: {
  title: string;
  desc: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="group relative p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity`}></div>

      <div className="relative">
        <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-6 transform group-hover:rotate-12 transition-transform shadow-lg`}>
          {icon === 'book' && (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          )}
          {icon === 'chart' && (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          )}

        </div>
        <h3 className="font-playfair text-2xl font-bold mb-3 text-white group-hover:text-[#d4af37] transition-colors">
          {title}
        </h3>
        <p className="text-white/70 leading-relaxed">{desc}</p>

        {/* Arrow icon */}
        <div className="mt-6 flex items-center gap-2 text-[#d4af37] opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-2">
          <span className="text-sm font-semibold">Explorar</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </div>
  );
}