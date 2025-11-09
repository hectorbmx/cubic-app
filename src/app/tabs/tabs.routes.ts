import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../pages/user-perfil/user-perfil.page').then((m) => m.UserPerfilPage),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
      {
      path: 'tab1/obras/:clienteId',
        loadComponent: () =>
          import('../pages/obras-cliente/obras-cliente.page').then(m => m.ObrasClientePage)
      },
       {
        path: 'tab1/obras/:clienteId/detalle/:obraId',  // <- NUEVA RUTA
        loadComponent: () =>
          import('../pages/obras-detalles/obras-detalles.page').then(m => m.ObrasDetallesPage)
      },
          {
        path: 'user-perfil',
        loadComponent: () => import('../pages/user-perfil/user-perfil.page').then( m => m.UserPerfilPage)
      },

    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
