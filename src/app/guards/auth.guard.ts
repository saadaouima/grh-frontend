import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import Keycloak from 'keycloak-js';

const ROLES_SYSTEME = [
  'offline_access', 'uma_authorization', 'manage-account',
  'manage-account-links', 'view-profile', 'default-roles-gerai',
  'default-roles-master', 'create-realm', 'broker'
];

// ✅ Normalise un rôle : minuscules + supprime les accents
function normaliserRole(role: string): string {
  return role
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ✅ Variantes acceptées pour chaque rôle métier
const ROLE_CHEF = ['chef', 'CHEF', 'Chef'];
const ROLE_EMPLOYE = ['employe', 'EMPLOYE', 'Employe', 'employé', 'EMPLOYÉ', 'Employé'];
const ROLE_ADMIN = ['admin', 'ADMIN', 'Admin', 'admin_rh', 'ADMIN_RH'];

function getRoles(keycloak: Keycloak): string[] {
  return ((keycloak.tokenParsed?.['roles'] as string[]) ?? [])
    .filter(r => !ROLES_SYSTEME.includes(r));
}

function hasRole(userRoles: string[], variants: string[]): boolean {
  // ✅ Compare en normalisant les deux côtés
  return userRoles.some(userRole =>
    variants.some(variant =>
      normaliserRole(userRole) === normaliserRole(variant)
    )
  );
}

// ── Guard de redirection selon le rôle ──────────────
export const roleRedirectGuard: CanActivateFn = (): UrlTree | boolean => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);

  if (!keycloak.authenticated) {
    keycloak.login({ redirectUri: window.location.origin });
    return false;
  }

  const roles = getRoles(keycloak);
  console.log('🔐 Rôles détectés:', roles);
  console.log('🔐 Rôles normalisés:', roles.map(normaliserRole));

  if (hasRole(roles, ROLE_CHEF)) return router.createUrlTree(['/chef/dashboard']);
  if (hasRole(roles, ROLE_EMPLOYE)) return router.createUrlTree(['/employe/dashboard']);
  if (hasRole(roles, ROLE_ADMIN)) return router.createUrlTree(['/admin/dashboard']);

  console.warn('⚠️ Aucun rôle métier reconnu !', roles);
  return router.createUrlTree(['/access-denied']);
};

// ── Guard de protection par rôle ────────────────────
export const requireRoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot): UrlTree | boolean => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);

  if (!keycloak.authenticated) {
    keycloak.login({ redirectUri: window.location.origin });
    return false;
  }

  const requiredRoles: string[] = route.data?.['roles'] ?? [];
  if (requiredRoles.length === 0) return true;

  const userRoles = (keycloak.tokenParsed?.['roles'] as string[]) ?? [];

  // ✅ Compare en normalisant les deux côtés
  const hasAccess = requiredRoles.some(required =>
    userRoles.some(userRole =>
      normaliserRole(userRole) === normaliserRole(required)
    )
  );

  if (!hasAccess) {
    console.warn(`⛔ Accès refusé. Rôles requis: ${requiredRoles}, rôles user: ${userRoles}`);
    return router.createUrlTree(['/access-denied']);
  }

  return true;
};