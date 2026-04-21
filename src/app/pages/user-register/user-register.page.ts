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
  if (!this.email || !this.password || !this.passwordConfirm) {
    this.showToast('Please complete all fields', 'warning');
    return;
  }

  if (this.password !== this.passwordConfirm) {
    this.showToast('Passwords do not match', 'warning');
    return;
  }

  if (this.password.length < 8) {
    this.showToast('Password must be at least 8 characters long', 'warning');
    return;
  }

  const loading = await this.loadingCtrl.create({
    message: 'Verifying invitation...',
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

    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    await this.showSuccessAlert(response.token);

  } catch (err: any) {
    await loading.dismiss();
    const errorMsg = err.error?.message || 'Registration error';
    this.error = errorMsg;
    this.showToast(errorMsg, 'danger');
  } finally {
    this.loading = false;
  }
}
 async showSuccessAlert(token: string) {
  const alert = await this.alertCtrl.create({
    header: 'Registration successful!',
    message: 'Do you want to log in now?',
    buttons: [
      {
        text: 'Later',
        role: 'cancel',
        handler: () => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          this.router.navigateByUrl('/login', { replaceUrl: true });
        }
      },
      {
        text: 'Log in now',
        handler: async () => {
          try {
            // ⚠️ Asegurar que el token esté (por si acaso)
            localStorage.setItem('auth_token', token);

            // Ejecutar loadUser y validar resultado
            const ok = await this.authService.loadUser();

            if (ok) {
              this.router.navigateByUrl('/usuario/obras', { replaceUrl: true });
            } else {
              console.error('Auto-login falló');
              this.showToast('Could not start session automatically', 'danger');
              this.router.navigateByUrl('/login', { replaceUrl: true });
            }

          } catch (error) {
            console.error('Error en auto-login:', error);
            this.showToast('Unexpected error during login', 'danger');
            this.router.navigateByUrl('/login', { replaceUrl: true });
          }
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