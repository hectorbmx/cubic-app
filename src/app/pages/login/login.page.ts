import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
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
    IonHeader,
    IonToolbar,
    IonTitle,
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
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  email = '';
  password = '';
  remember = false;
  loading = false;
  error = '';

  private normalizeRole(role?: string | null): string | null {
    if (!role) return null;
    return String(role).trim().toLowerCase().replace(/[_-]/g, '');
  }

  private isSuperAdminByRoles(roles: string[]): boolean {
    return roles.some(r => this.normalizeRole(r) === 'superadmin');
  }

  async submit() {
    if (!this.email || !this.password) {
      await this.showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
    });
    await loading.present();

    this.loading = true;
    this.error = '';

    try {
      await this.auth.login(this.email, this.password);

      const roles: string[] = this.auth.user()?.roles ?? [];
      const isSuperadmin = this.isSuperAdminByRoles(roles);

      console.log('[LOGIN] Roles:', roles);
      console.log('[LOGIN] isSuperadmin:', isSuperadmin);

      await loading.dismiss();
      await this.showToast('¡Bienvenido!', 'success');

      if (isSuperadmin) {
        console.log('[LOGIN] Navegando a /tabs/tab1');
        await this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
      } else {
        console.log('[LOGIN] Navegando a /usuario/home');
        await this.router.navigateByUrl('/usuario/home', { replaceUrl: true });
      }
    } catch (err: any) {
      console.error('[LOGIN] Error:', err);
      await loading.dismiss();
      this.error = err?.message || 'Error al iniciar sesión';
      await this.showToast(this.error, 'danger');
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
    console.log('[LOGIN] Navegando a /register');
    this.router.navigate(['/register']);
  }
}