
// de aqui para arriba funciona con mock
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
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
    
    // await this.preloadClientObras();
    
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
          permissions: response.user.permissions
        });
      } catch (error) {
        console.error('Token inválido, limpiando sesión');
        this.logout();
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.user();
  }
  
}