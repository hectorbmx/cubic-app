// import { Injectable, signal } from '@angular/core';
// import { Preferences } from '@capacitor/preferences';


// type UserRole = 'super_admin' | 'cliente' | null;

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private _isLoggedIn = signal<boolean>(false);
//   private _role = signal<UserRole>(null);
//   private _user = signal<any>(null);

//   isLoggedIn = this._isLoggedIn.asReadonly();
//   role = this._role.asReadonly();
//   user = this._user.asReadonly();

//   private TOKEN_KEY = 'auth_token';
//   private ROLE_KEY = 'auth_role';
//   private USER_KEY = 'auth_user';

//   constructor() {
//     console.log('[AuthService] constructor');
//   }

//   async bootstrap(): Promise<void> {
//     console.log('[AuthService] bootstrap: restoring session from Preferences...');
//     const token = (await Preferences.get({ key: this.TOKEN_KEY })).value;
//     const role = (await Preferences.get({ key: this.ROLE_KEY })).value as UserRole;
//     const userJson = (await Preferences.get({ key: this.USER_KEY })).value;
//     this._isLoggedIn.set(!!token);
//     this._role.set(role ?? null);
//     this._user.set(userJson ? JSON.parse(userJson) : null);
//     console.log('[AuthService] bootstrap:', { token: !!token, role, user: this._user() });
//   }

//   // Guarda sesión
//   private async setSession(token: string, role: UserRole, user: any) {
//     await Preferences.set({ key: this.TOKEN_KEY, value: token });
//     await Preferences.set({ key: this.ROLE_KEY, value: role ?? '' });
//     await Preferences.set({ key: this.USER_KEY, value: JSON.stringify(user ?? {}) });
//     this._isLoggedIn.set(true);
//     this._role.set(role);
//     this._user.set(user);
//     console.log('[AuthService] setSession', { tokenProvided: !!token, role, user });
//   }

//   // Mock: valida contra assets/mock/users.json (fetch)
//   async loginWithMock(email: string, password: string): Promise<{ ok: boolean; message?: string; role?: UserRole; user?: any }> {
//     console.log('[AuthService] loginWithMock ->', { email });
//     try {
//       const res = await fetch('/assets/mock/users.json', { cache: 'no-store' });
//       if (!res.ok) {
//         console.error('[AuthService] fallo al cargar mock users.json', res.status);
//         return { ok: false, message: 'No se pudo cargar datos mock' };
//       }
//       const json = await res.json();
//       const users: any[] = json.users ?? [];
//       const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
//       console.log('[AuthService] users.json cargado, usuarios:', users.length, 'match:', !!found);
//       if (!found) return { ok: false, message: 'Credenciales inválidas' };

//       // genera token falso y guarda
//       await this.setSession('token_mock_' + Date.now(), found.role, found);
//       return { ok: true, role: found.role, user: found };
//     } catch (err) {
//       console.error('[AuthService] error en loginWithMock', err);
//       return { ok: false, message: 'Error interno' };
//     }
//   }

//   async logout(): Promise<void> {
//     console.log('[AuthService] logout');
//     await Preferences.remove({ key: this.TOKEN_KEY });
//     await Preferences.remove({ key: this.ROLE_KEY });
//     await Preferences.remove({ key: this.USER_KEY });
//     this._isLoggedIn.set(false);
//     this._role.set(null);
//     this._user.set(null);
//   }
// }
// de aqui para arriba funciona con mock
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';

export type User = {
  id: number;
  name: string;
  email: string;
  photoURL?: string;
  roles?: string[];
  permissions?: string[];
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = signal<User | null>(null);

  constructor(private apiService: ApiService) {
    this.loadUser();
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.apiService.login(email, password)
      );

      // Guardar token
      localStorage.setItem('auth_token', response.token);
      
      // Guardar usuario
      this.user.set({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        roles: response.user.roles,
        permissions: response.user.permissions
      });

      // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(this.user()));
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.error?.message || 'Error al iniciar sesión');
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.apiService.logout());
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar todo
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      this.user.set(null);
    }
  }

  async loadUser(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      // try {
        this.user.set(JSON.parse(savedUser));
        
        // Verificar token con el backend
      //   const response = await firstValueFrom(this.apiService.me());
      //   this.user.set({
      //     id: response.user.id,
      //     name: response.user.name,
      //     email: response.user.email,
      //     roles: response.user.roles,
      //     permissions: response.user.permissions
      //   });
      // } catch (error) {
      //   console.error('Token inválido, limpiando sesión');
      //   this.logout();
      // }
    // }
  }
}
}
  // isAuthenticated(): boolean {
  //   return !!this.user();
  // }
// }