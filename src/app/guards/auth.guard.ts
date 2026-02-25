// src/app/guards/auth.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

// ─── Rôles système Keycloak à ignorer ───────────────────────────────────────
const ROLES_SYSTEME = [
  'offline_access', 'uma_authorization', 'manage-account',
  'manage-account-links', 'view-profile', 'default-roles-gerai',
  'default-roles-master', 'create-realm', 'broker'
];

// ─── Guard de redirection selon le rôle (sur la route racine '') ─────────────
// Redirige l'utilisateur vers son dashboard selon son rôle Keycloak
export const roleRedirectGuard: CanActivateFn = async () => {
  const keycloak = inject(KeycloakService);
  const router   = inject(Router);

  const isLogged = await keycloak.isLoggedIn();

  // Pas connecté → login Keycloak
  if (!isLogged) {
    await keycloak.login({ redirectUri: window.location.origin });
    return false;
  }

  const roles = keycloak.getUserRoles()
    .filter(r => !ROLES_SYSTEME.includes(r));

  console.log('🔐 Rôles métier détectés:', roles);

  // Redirection selon le rôle
  if (roles.includes('chef')) {
    router.navigate(['/chef/dashboard']);
    return false;
  }

  if (roles.includes('employe')) {
    router.navigate(['/employe/dashboard']);
    return false;
  }

  if (roles.includes('rh')) {
    router.navigate(['/rh/dashboard']);
    return false;
  }

  if (roles.includes('admin')) {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  // Aucun rôle connu
  router.navigate(['/access-denied']);
  return false;
};

// ─── Guard de protection par rôle (sur les routes enfants) ──────────────────
// Bloque l'accès si l'utilisateur n'a pas le rôle requis
export const requireRoleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const keycloak = inject(KeycloakService);
  const router   = inject(Router);

  const isLogged = await keycloak.isLoggedIn();

  if (!isLogged) {
    await keycloak.login({ redirectUri: window.location.origin });
    return false;
  }

  // Lire les rôles requis depuis data: { roles: ['chef'] }
  const requiredRoles: string[] = route.data?.['roles'] ?? [];

  // Pas de restriction → accès libre
  if (requiredRoles.length === 0) return true;

  const userRoles = keycloak.getUserRoles();
  const hasRole   = requiredRoles.some(role => userRoles.includes(role));

  if (!hasRole) {
    console.warn(`⛔ Accès refusé. Rôle requis: ${requiredRoles}, rôles user: ${userRoles}`);
    router.navigate(['/access-denied']);
    return false;
  }

  return true;
};