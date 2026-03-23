import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  CanActivateChildFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

const ROLE_CHEF = ['chef'];
const ROLE_EMPLOYE = ['employe', 'employé'];
const ROLE_ADMIN = ['admin', 'admin_rh'];

const ROLES_SYSTEME = new Set([
  'offline_access', 'uma_authorization', 'manage-account',
  'manage-account-links', 'view-profile', 'default-roles-gerai',
  'default-roles-master', 'create-realm', 'broker'
]);

function normaliserRole(role: string): string {
  return role.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getTousLesRoles(grantedRoles: AuthGuardData['grantedRoles']): string[] {
  const realmRoles = grantedRoles.realmRoles ?? [];
  const clientRoles = Object.values(grantedRoles.resourceRoles ?? {}).flat() as string[];
  const tous = [...new Set([...realmRoles, ...clientRoles])].filter(r => !ROLES_SYSTEME.has(r));
  console.log('[GerAI Guard] Rôles extraits:', tous);
  return tous;
}

function hasAnyRole(userRoles: string[], variants: string[]): boolean {
  return userRoles.some(ur => variants.some(v => normaliserRole(ur) === normaliserRole(v)));
}

// ────────────────────────────────────────────────────────────
// Guard 1 : REDIRECTION INITIALE
// ────────────────────────────────────────────────────────────
const roleRedirectLogic = async (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;
  const router = inject(Router);

  if (!authenticated) {
    console.warn('[GerAI Guard] Non authentifié');
    return false;
  }

  const roles = getTousLesRoles(grantedRoles);

  if (hasAnyRole(roles, ROLE_CHEF)) return router.parseUrl('/chef/dashboard');
  if (hasAnyRole(roles, ROLE_EMPLOYE)) return router.parseUrl('/employe/dashboard');
  if (hasAnyRole(roles, ROLE_ADMIN)) return router.parseUrl('/chef/dashboard');

  return router.parseUrl('/access-denied');
};

export const roleRedirectGuard: CanActivateFn =
  createAuthGuard<CanActivateFn>(roleRedirectLogic);

// ────────────────────────────────────────────────────────────
// Guard 2 : PROTECTION DES ROUTES
// ────────────────────────────────────────────────────────────
const requireRoleLogic = async (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;
  const router = inject(Router);

  if (!authenticated) return router.parseUrl('/access-denied');

  const rolesRequis: string[] = route.data?.['roles'] ?? [];
  if (rolesRequis.length === 0) return true;

  const userRoles = getTousLesRoles(grantedRoles);

  const aAcces = rolesRequis.some(requis =>
    userRoles.some(ur => normaliserRole(ur) === normaliserRole(requis))
  );

  if (!aAcces) {
    console.warn(`[GerAI Guard] ⛔ Accès refusé. Requis: [${rolesRequis}] | Possédés: [${userRoles}]`);
    return router.parseUrl('/access-denied');
  }

  return true;
};

export const requireRoleGuard: CanActivateChildFn =
  createAuthGuard<CanActivateChildFn>(requireRoleLogic);