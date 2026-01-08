import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'auth_role';
const USER_KEY = 'user';

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

export const authGuard: CanMatchFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem(TOKEN_KEY);
  const role = localStorage.getItem(ROLE_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  const ok = !!token && !!role && isValidStoredUser(userRaw);

  if (ok) return true;

  // Limpia basura/corrupción para evitar loops
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);

  router.navigateByUrl('/login', { replaceUrl: true });
  return false;
};

export const guestGuard: CanMatchFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem(TOKEN_KEY);
  const roleRaw = localStorage.getItem(ROLE_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  const ok = !!token && !!roleRaw && isValidStoredUser(userRaw);

  // No autenticado => permitir entrar a login/register
  if (!ok) {
    // Limpia basura/corrupción
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    return true;
  }

  // Autenticado => redirigir consistentemente
  const role = normalizeRole(roleRaw);
  const redirectUrl = role === 'superadmin' ? '/tabs/tab1' : '/usuario/home';

  router.navigateByUrl(redirectUrl, { replaceUrl: true });
  return false;
};
