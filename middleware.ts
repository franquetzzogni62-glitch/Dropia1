import { NextResponse, type NextRequest } from 'next/server';

/**
 * DROPIA LOGISTICS - Next.js 14+ Edge Middleware pour le Contrôle d'Accès basé sur les Rôles (RBAC)
 * 
 * Protection stricte des routes :
 * - /dashboard/merchant/*  => Uniquement 'merchant'
 * - /dashboard/agency/*    => Uniquement 'agency'
 * - /driver/*              => Uniquement 'driver'
 * - /admin/*               => Uniquement 'admin'
 */

export type UserRole = 'admin' | 'merchant' | 'agency' | 'driver';

// Mapping des routes d'accueil par défaut par rôle
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  admin: '/admin',
  merchant: '/dashboard/merchant',
  agency: '/dashboard/agency',
  driver: '/driver',
};

// Configuration des règles d'accès aux préfixes de routes
const ROUTE_ROLE_RULES: Array<{ prefix: string; requiredRole: UserRole }> = [
  { prefix: '/dashboard/merchant', requiredRole: 'merchant' },
  { prefix: '/dashboard/agency', requiredRole: 'agency' },
  { prefix: '/driver', requiredRole: 'driver' },
  { prefix: '/admin', requiredRole: 'admin' },
];

// Injection des en-têtes de sécurité HTTP de niveau Production
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Extraction du rôle et du jeton de session depuis les cookies
  const roleCookie = request.cookies.get('dropia_role')?.value as UserRole | undefined;
  const sessionCookie = request.cookies.get('__session')?.value;

  const isAuthenticated = Boolean(roleCookie && sessionCookie);

  // 2. Trouver si la route actuelle nécessite un rôle spécifique
  const matchedRule = ROUTE_ROLE_RULES.find((rule) =>
    pathname.startsWith(rule.prefix)
  );

  // 3. Gestion des routes protégées
  if (matchedRule) {
    // Si l'utilisateur n'est pas authentifié -> Redirection vers /login avec URL de rappel
    if (!isAuthenticated || !roleCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    // Si l'utilisateur est authentifié mais ne possède pas le rôle requis
    if (roleCookie !== matchedRule.requiredRole) {
      // Les administrateurs peuvent optionnellement inspecter les dashboards marchands/agences
      if (roleCookie === 'admin' && !pathname.startsWith('/admin')) {
        const response = NextResponse.next();
        response.headers.set('x-dropia-role', roleCookie);
        response.headers.set('x-dropia-impersonation', 'true');
        return applySecurityHeaders(response);
      }

      // Rediriger vers son propre espace de travail ou vers la page /unauthorized
      const targetDashboard = ROLE_DEFAULT_ROUTES[roleCookie] || '/unauthorized';
      const unauthorizedUrl = new URL(targetDashboard, request.url);
      unauthorizedUrl.searchParams.set('denied', '403');
      unauthorizedUrl.searchParams.set('attempted', pathname);
      return applySecurityHeaders(NextResponse.redirect(unauthorizedUrl));
    }

    // Autorisation accordée : propagation des en-têtes contextuels pour les Server Components
    const response = NextResponse.next();
    response.headers.set('x-dropia-role', roleCookie);
    response.headers.set('x-dropia-authenticated', 'true');
    return applySecurityHeaders(response);
  }

  // 4. Si l'utilisateur déjà connecté tente d'accéder à la page de connexion (/login)
  if (pathname === '/login' || pathname === '/register') {
    if (isAuthenticated && roleCookie && ROLE_DEFAULT_ROUTES[roleCookie]) {
      const defaultDashboard = ROLE_DEFAULT_ROUTES[roleCookie];
      return applySecurityHeaders(NextResponse.redirect(new URL(defaultDashboard, request.url)));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

/**
 * Matcher Next.js : filtre optimisé pour exclure les assets statiques et cibler les routes applicatives
 */
export const config = {
  matcher: [
    /*
     * Matcher toutes les routes de requêtes protégées :
     * - /dashboard/merchant/:path*
     * - /dashboard/agency/:path*
     * - /driver/:path*
     * - /admin/:path*
     * - /login
     */
    '/dashboard/merchant/:path*',
    '/dashboard/agency/:path*',
    '/driver/:path*',
    '/admin/:path*',
    '/login',
  ],
};
