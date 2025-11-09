import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'auth_role';

export const authGuard: CanMatchFn = async () => {
  const router = inject(Router);
  const token = (await Preferences.get({ key: TOKEN_KEY })).value;
  if (token) return true;
  router.navigateByUrl('/login', { replaceUrl: true });
  return false;
};

export const guestGuard: CanMatchFn = async () => {
  const router = inject(Router);
  const token = (await Preferences.get({ key: TOKEN_KEY })).value;
  if (!token) return true;
  const role = (await Preferences.get({ key: ROLE_KEY })).value as 'super_admin' | 'cliente' | null;
  router.navigateByUrl(role === 'super_admin' ? '/tabs/tab2' : '/tabs/tab3', { replaceUrl: true });
  return false;
};
