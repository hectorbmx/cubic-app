import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
// import { ApiService } from 'src/app/core/services/api';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api';
import { AuthService } from '../../core/services/auth.service';

export interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_path?: string | null;
  roles: string | null;
  position: string |  null;
}

@Component({
  selector: 'app-user-perfil',
  standalone: true,
  imports: [IonItem, 
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon
  ],
  templateUrl: './user-perfil.page.html',
  styleUrls: ['./user-perfil.page.scss'],
})
export class UserPerfilPage implements OnInit {
  private apiService = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  user: User | null = null;
  loading = false;
  error: string | null = null;

  constructor( ) {}

  ngOnInit() {
    this.loadUser();
  }
    isOpen = false;
private loadUser() {

  const baseBackendUrl = 'http://localhost:8000'; //aqui editar por la url de prod cuando se mande al serv

  this.loading = true;
  this.error = null;

  this.apiService.me().subscribe({
    next: (res: any) => {
      console.log('RAW /me response:', res);

      // si el backend regresa { data: { ...user... } }
      const userData = res.data ?? res;
      console.log('Parsed userData:', userData);

      this.user = {
        id: userData.id,
        name: userData.name,
        first_name: userData.firstname ?? '',
        last_name: userData.lastName ?? '',
        email: userData.email,
        phone: userData.phone,
        avatar_path: userData.photoUrl ? `${baseBackendUrl}${userData.photoUrl}` :null,
        // avatar_path: userData.photoUrl ?? null,
        roles: userData.roles ?? [], // 👈 ESTA LÍNEA
        position: userData.position ?? '',
      };

      console.log('User asignado:', this.user);

      this.loading = false;
    },
    error: (err) => {
      console.error('Error en /me:', err);
      this.error = 'No se pudo cargar el perfil';
      this.loading = false;
    }
  });
}
async logout() {
    this.isOpen = false;
    await this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
