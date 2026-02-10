import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,IonIcon
} from '@ionic/angular/standalone';
import { AuthService, User } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/api'; // AJUSTA la ruta si cambia
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-usuario-profile',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,IonIcon],
  templateUrl: './usuario-profile.page.html',
  styleUrls: ['./usuario-profile.page.scss'],
})
export class UsuarioProfilePage implements OnInit {

  me: User | null = null;

  constructor(
    private auth: AuthService,
    private apiService: ApiService
  ) {}

  async ngOnInit(): Promise<void> {
    // 1) Pintar inmediato con lo que ya tienes en memoria/localStorage
    this.me = this.auth.user();

    // 2) (Opcional recomendado) refrescar desde backend para asegurar datos actuales
    try {
      const response: any = await firstValueFrom(this.apiService.me());

      // response es plano, igual que en tu AuthService.loadUser()
      this.me = {
        ...(this.me ?? {}),
        id: response.id,
        name: response.name,
        email: response.email,
        // phone: response.phone,
        roles: response.roles,
        permissions: response.permissions,
        clientes: response.clientes,
        client_id: response.client_id ?? null,
        clientId: response.clientId ?? null,
        client_name: response.client_name ?? null,
        clientName: response.clientName ?? null,
      };

      // Si quieres mantener consistencia global:
      this.auth.user.set(this.me);
      localStorage.setItem('user', JSON.stringify(this.me));
    } catch (e) {
      // Si falla, te quedas con el cache; no rompes la vista
      console.error('[PROFILE] /me failed, using cached user', e);
    }
  }
}
