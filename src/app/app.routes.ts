import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Landing
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Public
  {
    path: 'login',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./pages/user-register/user-register.page').then(m => m.UserRegisterPage),
  },

  // Protected - Usuario
  {
    path: 'usuario',
    canMatch: [authGuard],
    loadChildren: () =>
      import('./pages/usuario/usuario-tabs/usuario-tabs.routes').then(m => m.routes),
  },

  // Protected - Superadmin (Tabs principales)
  {
    path: 'tabs',
    canMatch: [authGuard],
    loadChildren: () =>
      import('./tabs/tabs.routes').then(m => m.routes),
  },

  // Wildcard:
  // - si NO está logueado -> lo mandará a /login y guestGuard lo dejará pasar
  // - si SÍ está logueado -> guestGuard lo redirigirá a su landing correcto
  { path: '**', redirectTo: 'login' },
];
