import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { Obra } from 'src/app/models/obra';
import { NavController } from '@ionic/angular';
import { computed } from '@angular/core';

export type User = {
  id: number;
  name: string;
  email: string;
  photoURL?: string;
  roles?: string[];
  phone?: string;
  permissions?: string[];
  clientes?: Array<{ id: number; name: string; email: string }>;
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

  private updateState(data: any) {
    if (!data) return;

    // Extraemos los valores para asegurar que TypeScript no se queje
    const clientes = data.clientes ?? [];
    const obras = data.obras ?? [];
    const firstClient = clientes[0];

    const newUser: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      roles: data.roles ?? [],
      permissions: data.permissions ?? [],
      clientes: clientes,
      // Prioridad: 1. Lo que mande el backend, 2. El primer cliente de la lista, 3. null
      client_id: data.client_id ?? data.clientId ?? (firstClient?.id || null),
      clientId: data.client_id ?? data.clientId ?? (firstClient?.id || null),
      client_name: data.client_name ?? data.clientName ?? (firstClient?.name || null),
      clientName: data.client_name ?? data.clientName ?? (firstClient?.name || null),
      obras: obras,
      obra_ids: (data.obra_ids ?? []).map((x: any) => Number(x)),
    };

    this.user.set(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Usamos la constante 'obras' directamente para evitar el error de 'undefined'
    if (obras.length === 0) {
      localStorage.removeItem('obra_id');
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.apiService.login(email, password));
      localStorage.setItem('auth_token', response.token);
      
      if (email?.includes('@')) {
        localStorage.setItem('last_login_email', email.trim());
      }

      const roles: string[] = response.user?.roles ?? [];
      const roleNormalized = this.normalizeRole(roles[0]) ?? 'cliente';
      localStorage.setItem('auth_role', roleNormalized);

      // Actualizamos con los datos del login
      this.updateState(response.user);

      // Refrescamos con /me para asegurar sincronización total
      const me = await firstValueFrom(this.apiService.me());
      this.updateState(me);

    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.error?.message || 'Error al iniciar sesión');
    }
  }

  async loadUser(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response: any = await firstValueFrom(this.apiService.me());
      this.updateState(response);
    } catch (error) {
      console.error('Sesión inválida');
      this.logout();
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.apiService.logout());
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_role');
      localStorage.removeItem('user');
      localStorage.removeItem('obra_id');
      this.user.set(null);
      await this.navCtrl.navigateRoot('/login');
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
    return '/usuario/obras';
  }
  
}