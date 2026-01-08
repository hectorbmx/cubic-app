import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./usuario-tabs.page').then((m) => m.UsuarioTabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../usuario-home/usuario-home.page').then((m) => m.UsuarioHomePage),
      },
      {
        path: 'obras',
        loadComponent: () =>
          import('../usuario-obras/usuario-obras.page').then((m) => m.UsuarioObrasPage),
      },

      // PERFIL (si lo vas a usar como tab real)
      {
        path: 'perfil',
        loadComponent: () =>
          import('../usuario-perfil/usuario-perfil.page').then((m) => m.UsuarioPerfilPage),
      },

      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },

  // Fallback interno del scope /usuario
  { path: '**', redirectTo: 'home' },
];
