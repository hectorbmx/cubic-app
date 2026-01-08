import { Injectable, signal } from '@angular/core';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { ApiService } from './api';
import { Obra } from 'src/app/models/obra';
import { NavController } from '@ionic/angular';

export type User = {
  id: number;
  name: string;
  email: string;
  photoURL?: string;
  roles?: string[];
  permissions?: string[];
  clientes?: Array<{ id: number; name: string; email: string }>;
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

  private readonly TOKEN_KEY = 'auth_token';
  private readonly ROLE_KEY = 'auth_role';
  private readonly USER_KEY = 'user';
  private readonly CLIENTE_ID_KEY = 'cliente_id';

  constructor(
    private apiService: ApiService,
    private navCtrl: NavController
  ) {
    // No bloquea el arranque: se ejecuta async
    void this.loadUser();
  }

  /**
   * Normaliza roles para evitar inconsistencias:
   * "super-admin", "super_admin", "SUPERADMIN" -> "superadmin"
   */
  private normalizeRole(role?: string | null): string | null {
    if (!role) return null;
    const cleaned = String(role).trim().toLowerCase();
    return cleaned.replace(/[_-]/g, '');
  }

  private getPrimaryRole(roles?: string[] | null): string | null {
    if (!roles || roles.length === 0) return null;
    return roles[0] ?? null;
  }

  isSuperAdmin(): boolean {
    const roles = this.user()?.roles ?? [];
    return roles.some(r => this.normalizeRole(r) === 'superadmin');
  }

  isAuthenticated(): boolean {
    return !!this.user() && !!localStorage.getItem(this.TOKEN_KEY);
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.apiService.login(email, password));

      // Token
      localStorage.setItem(this.TOKEN_KEY, response.token);

      // Roles
      const rolesFromApi: string[] = response.user?.roles ?? [];
      const primaryRoleRaw = this.getPrimaryRole(rolesFromApi);
      const primaryRoleNormalized = this.normalizeRole(primaryRoleRaw) ?? 'cliente';
      localStorage.setItem(this.ROLE_KEY, primaryRoleNormalized);

      // Guardar usuario base
      const userToStore: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        roles: rolesFromApi,
        permissions: response.user.permissions,
        clientes: response.user.clientes || [],
        client_id: response.user.client_id ?? null,
        clientId: response.user.clientId ?? null,
        client_name: response.user.client_name ?? null,
        clientName: response.user.clientName ?? null,
      };

      this.user.set(userToStore);

      // Si tiene clientes, establecer el primero como activo
      const firstClient: { id: number; name: string } | undefined = response.user.clientes?.[0];
      if (firstClient) {
        this.user.set({
          ...this.user()!,
          client_id: firstClient.id,
          clientId: firstClient.id,
          client_name: firstClient.name,
          clientName: firstClient.name,
        });
      }

      // cliente_id: prioriza cualquier campo posible
      const clienteId =
        response.user?.cliente_activo_id ??
        response.user?.clientId ??
        response.user?.client_id ??
        response.user?.clienteId ??
        null;

      if (clienteId) {
        localStorage.setItem(this.CLIENTE_ID_KEY, String(clienteId));
      }

      // Persistir user final
      localStorage.setItem(this.USER_KEY, JSON.stringify(this.user()));

    } catch (error: any) {
      console.error('[AUTH] Login error:', error);
      throw new Error(error?.error?.message || 'Error al iniciar sesión');
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.apiService.logout().pipe(
          timeout(3000),
          catchError(() => of(null))
        )
      );
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
    } finally {
      // Limpiar todo
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.ROLE_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.CLIENTE_ID_KEY);

      this.user.set(null);

      // Mejor que window.location (evita hard reload innecesario)
      // pero si tú quieres hard reload, puedes volver a usar window.location.href.
      this.navCtrl.navigateRoot('/login');
    }
  }

  async loadUser(): Promise<void> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const savedUser = localStorage.getItem(this.USER_KEY);

    if (!token || !savedUser) return;

    // Cargar desde storage (puede estar corrupto)
    try {
      this.user.set(JSON.parse(savedUser));
    } catch (e) {
      console.warn('[AUTH] user corrupto en storage. Limpiando sesión.');
      await this.logout();
      return;
    }

    try {
      const response = await firstValueFrom(this.apiService.me());

      const freshUser = response?.user;
      if (!freshUser || freshUser.id == null) {
        console.warn('[AUTH] /me sin user válido. Respuesta:', response);
        return;
      }

      // Mantén roles/permissions del backend si vienen
      const rolesFromApi: string[] = freshUser.roles ?? this.user()?.roles ?? [];
      const primaryRoleNormalized =
        this.normalizeRole(this.getPrimaryRole(rolesFromApi)) ?? localStorage.getItem(this.ROLE_KEY) ?? 'cliente';

      localStorage.setItem(this.ROLE_KEY, primaryRoleNormalized);

      this.user.set({
        id: freshUser.id,
        name: freshUser.name,
        email: freshUser.email,
        roles: rolesFromApi,
        permissions: freshUser.permissions ?? this.user()?.permissions,
        clientes: this.user()?.clientes ?? [],
        client_id: this.user()?.client_id ?? null,
        clientId: this.user()?.clientId ?? null,
        client_name: this.user()?.client_name ?? null,
        clientName: this.user()?.clientName ?? null,
      });

      localStorage.setItem(this.USER_KEY, JSON.stringify(this.user()));
    } catch (error: any) {
      console.error('[AUTH] Error al verificar /me', error);

      if (error?.status === 401 || error?.status === 419) {
        console.warn('[AUTH] Token inválido/expirado, limpiando sesión');
        await this.logout();
      } else {
        console.warn('[AUTH] No se pudo verificar token; conservamos sesión por posible error de red');
      }
    }
  }
}
