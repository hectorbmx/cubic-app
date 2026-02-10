import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

// export const routes: Routes = [
//   {
//     path: 'tabs',
//     component: TabsPage,
//     children: [
//       {
//         path: 'tab1',
//         loadComponent: () =>
//           import('../tab1/tab1.page').then((m) => m.Tab1Page),
//       },
//       {
//         path: 'tab2',
//         loadComponent: () =>
//           import('../tab2/tab2.page').then((m) => m.Tab2Page),
//       },
//       {
//         path: 'tab3',
//         loadComponent: () =>
//           import('../pages/user-perfil/user-perfil.page').then((m) => m.UserPerfilPage),
//       },

//       // Default dentro de tabs (redirect relativo)
//       {
//         path: '',
//         redirectTo: 'tab1',
//         pathMatch: 'full',
//       },
//     ],
//   },

//   // Default global a tabs
//   {
//     path: '',
//     redirectTo: '/tabs/tab1',
//     pathMatch: 'full',
//   },
// ];

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: 'tab1', loadComponent: () => import('../tab1/tab1.page').then(m => m.Tab1Page) },
      { path: 'tab2', loadComponent: () => import('../tab2/tab2.page').then(m => m.Tab2Page) },
      { path: 'tab3', loadComponent: () => import('../pages/user-perfil/user-perfil.page').then(m => m.UserPerfilPage) },

      { path: '', redirectTo: 'tab1', pathMatch: 'full' },
    ],
  },
];
