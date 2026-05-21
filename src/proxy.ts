import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas protegidas y los roles permitidos para cada una
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin':    ['administrador'],
  '/escuela':  ['director'],
  '/profesor': ['maestro'],
  '/alumno':   ['alumno'],
  '/tutor':    ['padre'],
};

// Rutas que NO requieren autenticación
const PUBLIC_ROUTES = ['/login', '/registro', '/', '/forgot-password', '/reset-password'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar rutas públicas y assets de Next.js
  if (
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  // Sin token → redirigir a /login (sin parámetros para no exponer la ruta intentada)
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Con token → verificar que la ruta coincide con el rol del usuario
  // Decodificamos el payload del JWT sin verificar firma (solo para leer el rol)
  // La verificación real de firma ocurre en el backend en cada petición de datos
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString('utf-8')
    );

    // El campo del rol puede ser 'tipoPersona' o 'role', según tu backend
    const tipoPersona: string = (
      payload.tipoPersona ??
      payload.tipo_persona ??
      payload.role ??
      ''
    ).toLowerCase().trim();

    // Verificar que el usuario tiene permiso para la ruta solicitada
    for (const [routePrefix, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
      if (pathname.startsWith(routePrefix)) {
        if (!allowedRoles.includes(tipoPersona)) {
          // Redirigir a su propia ruta según su rol, o a /login si no reconocemos el rol
          const homeForRole = getRoleHome(tipoPersona);
          return NextResponse.redirect(new URL(homeForRole, request.url));
        }
        break;
      }
    }
  } catch {
    // Token malformado → redirigir a login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

function getRoleHome(tipoPersona: string): string {
  switch (tipoPersona) {
    case 'administrador': return '/admin';
    case 'director':      return '/escuela';
    case 'maestro':       return '/profesor';
    case 'padre':         return '/tutor';
    case 'alumno':        return '/alumno/store';
    default:              return '/login';
  }
}

// Aplicar el middleware a todas las rutas (excepto _next y archivos estáticos)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
