import { Component, inject,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonCheckbox,
  IonText,
  IonIcon,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonCheckbox,
    IonText,
    IonIcon
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private navCtrl = inject(NavController);

  email = '';
  password = '';
  remember = false;
  loading = false;
  error = '';
ngOnInit(): void {
  this.email = localStorage.getItem('last_email') || '';
}
  async submit() {
    if (!this.email || !this.password) {
      this.showToast('Please fill in all the fields.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'loggin in...',
    });
    await loading.present();

    this.loading = true;
    this.error = '';

    try {
      await this.auth.login(this.email, this.password);

      // ============================================================
      // 🔒 BLINDAJE: evitar que quede un obra_id viejo (ej. "3")
      // y que /usuario/home dispare /api/v1/obras/{id} no permitido
      // ============================================================
      const u: any = this.auth.user();
      const allowedIds: number[] = Array.isArray(u?.obra_ids)
        ? u.obra_ids.map((x: any) => Number(x))
        : [];

      const savedObraId = Number(localStorage.getItem('obra_id'));

      // Si hay obra_id guardada pero no pertenece a este usuario, limpiarla
      if (savedObraId && allowedIds.length && !allowedIds.includes(savedObraId)) {
        console.warn('[LOGIN] obra_id inválida detectada, limpiando:', savedObraId);
        localStorage.removeItem('obra_id');
      }

      // Opcional recomendado: si no hay obra_id, autoseleccionar la primera asignada
      if (!localStorage.getItem('obra_id') && allowedIds.length) {
        localStorage.setItem('obra_id', String(allowedIds[0]));
      }

      await loading.dismiss();
      this.showToast('¡Welcome!', 'success');

      const url = this.auth.getRedirectUrl();
      console.log('[LOGIN] Redirect ->', url, 'roles:', this.auth.user()?.roles);

      // Para Ionic Tabs es más estable
      this.navCtrl.navigateRoot(url);

    } catch (err: any) {
      await loading.dismiss();
      this.error = err.message || 'Login error';
      this.showToast(this.error, 'danger');
    } finally {
      this.loading = false;
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  goToRegister() {
    console.log('Navegando a la página de registro');
    this.router.navigate(['/register']);
  }

  goToPasswordReset(ev?: Event) {
    ev?.preventDefault();
    ev?.stopPropagation();

    console.log('[LOGIN] goToPasswordReset click');
    this.router.navigate(['/password-reset']);
  }
}
