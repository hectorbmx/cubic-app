import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY  = 'auth_role';
const USER_KEY  = 'user';

function normalizeRole(role?: string | null): string | null {
  if (!role) return null;
  return String(role).trim().toLowerCase().replace(/[_-]/g, '');
}

function isValidStoredUser(userRaw: string | null): boolean {
  if (!userRaw) return false;
  try {
    const u = JSON.parse(userRaw);
    return u && typeof u === 'object' && u.id != null;
  } catch {
    return false;
  }
}

function clearAuthStorage(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
}

export const authGuard: CanMatchFn = (): boolean | UrlTree => {
  const router = inject(Router);

  const token = localStorage.getItem(TOKEN_KEY);
  const role  = localStorage.getItem(ROLE_KEY);
  const user  = localStorage.getItem(USER_KEY);

  const ok = !!token && !!role && isValidStoredUser(user);
  if (ok) return true;

  clearAuthStorage();
  return router.parseUrl('/login');
};

export const guestGuard: CanMatchFn = (): boolean | UrlTree => {
  const router = inject(Router);

  const token = localStorage.getItem(TOKEN_KEY);
  const roleRaw = localStorage.getItem(ROLE_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  const ok = !!token && !!roleRaw && isValidStoredUser(userRaw);

  // Invitado: puede entrar a /login, /register, etc.
  if (!ok) {
    clearAuthStorage();
    return true;
  }

  // Autenticado: redirigir según rol
  const role = normalizeRole(roleRaw);
  const redirectUrl = role === 'superadmin' ? '/tabs/tab1' : '/usuario/home';
  return router.parseUrl(redirectUrl);
};
