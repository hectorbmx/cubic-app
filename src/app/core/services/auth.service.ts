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
// import { ApiService } from './api.service';
import { ApiService } from './api';
import { firstValueFrom } from 'rxjs';
import { Obra } from 'src/app/models/obra';


export type User = {
  id: number;
  name: string;
  email: string;
  photoURL?: string;
  roles?: string[];
  permissions?: string[];
  clientes?: Array<{ id: number; name: string; email: string }>; // ← NUEVO

  // cliente activo del usuario
  client_id?: number | null;
  clientId?: number | null;
  client_name?: string | null;
  clientName?: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = signal<User | null>(null);
  obrasCliente = signal<Obra[] | null>(null);
 
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
    
    // Guardar usuario con su lista de clientes
    this.user.set({
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      roles: response.user.roles,
      permissions: response.user.permissions,
      clientes: response.user.clientes || [],
      client_id: response.user.client_id,
      clientId: response.user.clientId,
      client_name: response.user.client_name,
      clientName: response.user.clientName,
    });
    
    // Si tiene clientes, establecer el primero como activo
    // const firstClient = response.user.clientes?.[0];
    const firstClient: { id: number; name: string } | undefined = response.user.clientes?.[0];

    if (firstClient) {
      // actualiza el usuario guardado para reflejar el cliente activo
      const current = this.user() ?? {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        roles: response.user.roles,
        permissions: response.user.permissions,
        clientes: response.user.clientes || [],
      };
      this.user.set({
        ...current,
        client_id: firstClient.id,
        clientId: firstClient.id,
        client_name: firstClient.name,
        clientName: firstClient.name,
      });
    }
    
    await this.preloadClientObras();
    
    // Guardar en localStorage
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
      try {
        this.user.set(JSON.parse(savedUser));
        
        // Verificar token con el backend
        const response = await firstValueFrom(this.apiService.me());
        this.user.set({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          roles: response.user.roles,
          permissions: response.user.permissions,
          client_id: response.user.client_id ?? response.user.clientId ?? null,
          clientId:  response.user.clientId  ?? response.user.client_id ?? null,
          client_name: response.user.client_name ?? response.user.clientName ?? null,
          clientName:  response.user.clientName  ?? response.user.client_name ?? null,
        });
        await this.preloadClientObras();
      } catch (error) {
        console.error('Token inválido, limpiando sesión');
        this.logout();
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.user();
  }
  isSuperAdmin(): boolean {
  const r = this.user()?.roles ?? [];
  return r.includes('superadmin'); // ajusta si tu backend usa otro nombre
  }

  activeClientId(): number | null {
    console.log('AuthService.activeClientId ->', this.user());
    const u = this.user();
    return (u?.clientId ?? u?.client_id ?? null) as number | null;
  }

  activeClientName(): string { 
    const u = this.user();
    return (u?.clientName ?? u?.client_name ?? '') || '';
  }
  private async preloadClientObras() {
    // Si es super admin, no precargamos (verá todas en Tab2)
    if (this.isSuperAdmin()) {
      this.obrasCliente.set(null);
      return;
    }

  const id = this.activeClientId();
  if (!id) {
    // usuario sin cliente asignado
    this.obrasCliente.set([]);
    return;
  }

  try {
    const res = await firstValueFrom(this.apiService.getObrasByCliente(id));
    // tu API devuelve { data: Obra[] }
    this.obrasCliente.set(res?.data ?? []);
  } catch (e) {
    console.error('Preload obrasCliente failed:', e);
    this.obrasCliente.set([]);
  }
}


}