import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl md:text-3xl font-playfair font-bold text-[#0a1628] mb-6 text-center">Registro</h1>
                <form method="POST" className="space-y-4">
                    <div>
                        <label className="block text-[#1e3a6e] mb-1">Nombre Completo</label>
                        <input type="text" className="w-full border border-[#c8d8f0] rounded-lg p-2 focus:outline-none focus:border-[#d4af37]" />
                    </div>
                    <div>
                        <label className="block text-[#1e3a6e] mb-1">Correo Electrónico</label>
                        <input type="email" className="w-full border border-[#c8d8f0] rounded-lg p-2 focus:outline-none focus:border-[#d4af37]" />
                    </div>
                    <div>
                        <label className="block text-[#1e3a6e] mb-1">Contraseña</label>
                        <input type="password" className="w-full border border-[#c8d8f0] rounded-lg p-2 focus:outline-none focus:border-[#d4af37]" />
                    </div>
                    <button className="w-full bg-[#d4af37] text-white py-2 rounded-lg hover:bg-[#b5902b] transition-colors font-bold">
                        Registrarse
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-[#1e3a6e]">¿Ya tienes cuenta? <Link href="/login" className="text-[#d4af37] font-bold hover:underline">Inicia Sesión</Link></p>
                </div>
            </div>
        </div>
    );
}