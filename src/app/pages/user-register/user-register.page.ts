import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { ApiService } from '../../core/services/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonIcon
  ],
  templateUrl: './user-register.page.html',
  styleUrls: ['./user-register.page.scss'],
})
export class UserRegisterPage {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  email = '';
  password = '';
  passwordConfirm = '';
  loading = false;
  error = '';

  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  async register() {
    // Validaciones básicas
    if (!this.email || !this.password || !this.passwordConfirm) {
      this.showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    if (this.password !== this.passwordConfirm) {
      this.showToast('Las contraseñas no coinciden', 'warning');
      return;
    }

    if (this.password.length < 8) {
      this.showToast('La contraseña debe tener al menos 8 caracteres', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Verificando invitación...',
    });
    await loading.present();

    this.loading = true;
    this.error = '';

    try {
      const response = await this.apiService.register(
        this.email,
        this.password,
        this.passwordConfirm
      ).toPromise();

      await loading.dismiss();
      
      // Guardar token automáticamente
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Mostrar alerta de éxito
      this.showSuccessAlert(response.token);
      
    } catch (err: any) {
      await loading.dismiss();
      const errorMsg = err.error?.message || 'Error al registrarse';
      this.error = errorMsg;
      this.showToast(errorMsg, 'danger');
    } finally {
      this.loading = false;
    }
  }

  async showSuccessAlert(token: string) {
    const alert = await this.alertCtrl.create({
      header: '¡Registro exitoso!',
      message: '¿Deseas iniciar sesión ahora?',
      buttons: [
        {
          text: 'Después',
          role: 'cancel',
          handler: () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            this.router.navigateByUrl('/login');
          }
        },
        {
          text: 'Iniciar sesión',
          handler: async () => {
            // Auto-login: el token ya está guardado
            await this.authService.loadUser();
            this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
          }
        }
      ]
    });

    await alert.present();
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
}