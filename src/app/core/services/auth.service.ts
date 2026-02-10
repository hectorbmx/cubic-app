
// de aqui para arriba funciona con mock
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { Obra } from 'src/app/models/obra';
import { NavController } from '@ionic/angular';

export type User = {
  id: number;
  name: string;
  email: string;
  photoURL?: string;
  roles?: string[];
  phone?: string[];
  permissions?: string[];
  clientes?: Array<{ id: number; name: string; email: string }>; // ← NUEVO

  // cliente activo del usuario
  client_id?: number | null;
  clientId?: number | null;
  client_name?: string | null;
  clientName?: string | null;
   obras?: Array<{
    id: number;
    client_id: number;
    name?: string;
    code?: string;
    status?: string;
    role?: string | null;
  }>;
  obra_ids?: number[];
};


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = signal<User | null>(null);
  obrasCliente = signal<Obra[] | null>(null);
 
  constructor(
    private apiService: ApiService,
     private navCtrl: NavController
    ) {
    this.loadUser();
  }

async login(email: string, password: string): Promise<void> {
  try {
    const response = await firstValueFrom(
      this.apiService.login(email, password)
    );

    // Guardar token
    localStorage.setItem('auth_token', response.token);
    // Guardar rol primario normalizado para guards
const roles: string[] = response.user?.roles ?? [];
const roleRaw = roles[0] ?? null;
const roleNormalized = roleRaw
  ? String(roleRaw).trim().toLowerCase().replace(/[_-]/g, '')
  : 'cliente';

localStorage.setItem('auth_role', roleNormalized);

    
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
    
    // await this.preloadClientObras();
    
    // Guardar en localStorage
    localStorage.setItem('user', JSON.stringify(this.user()));
    
    const me: any = await firstValueFrom(this.apiService.me());
  this.user.set({
      ...(this.user() ?? {}),
      id: me.id,
      name: me.name,
      email: me.email,
      phone: me.phone,
      roles: me.roles,
      permissions: me.permissions,
      clientes: me.clientes,
      client_id: me.client_id ?? null,
      clientId: me.clientId ?? null,
      client_name: me.client_name ?? null,
      clientName: me.clientName ?? null,

      // 🔥 claves para tu caso
      obras: me.obras ?? [],
      obra_ids: (me.obra_ids ?? []).map((x: any) => Number(x)),
    });
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
      localStorage.removeItem('auth_role'); // importante
      localStorage.removeItem('user');

      this.user.set(null);

      // REDIRECCIÓN CLAVE
      await this.navCtrl.navigateRoot('/login');
    }
  }

  async loadUser(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        this.user.set(JSON.parse(savedUser));
        
        // Verificar token con el backend
     const response: any = await firstValueFrom(this.apiService.me());

// response es plano (no response.user)
this.user.set({
  ...(this.user() ?? {}),
  id: response.id,
  name: response.name,
  email: response.email,
  phone:response.phone,
  roles: response.roles,
  permissions: response.permissions,
  clientes: response.clientes,
  client_id: response.client_id ?? null,
  clientId: response.clientId ?? null,
  client_name: response.client_name ?? null,
  clientName: response.clientName ?? null,
});

localStorage.setItem('user', JSON.stringify(this.user()));
      } catch (error) {
        console.error('Token inválido, limpiando sesión');
        this.logout();
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.user();
  }
  private normalizeRole(role?: string | null): string | null {
  if (!role) return null;
  return String(role).trim().toLowerCase().replace(/[_-]/g, '');
}

isSuperAdminByRoles(roles?: string[] | null): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some(r => this.normalizeRole(r) === 'superadmin');
}

getRedirectUrl(): string {
  const roles = this.user()?.roles ?? [];
  return this.isSuperAdminByRoles(roles) ? '/tabs/tab1' : '/usuario/obras';
}

}