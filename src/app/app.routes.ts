import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
    {
    path: 'register',
    loadComponent: () => import('./pages/user-register/user-register.page').then( m => m.UserRegisterPage)
  },
  { path: '**', redirectTo: 'login' },

  

];
