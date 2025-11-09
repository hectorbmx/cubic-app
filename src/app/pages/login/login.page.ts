// import { Component, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonContent, IonInput, IonButton, IonItem, IonIcon, IonCard, IonCardContent, IonCheckbox, IonText } from '@ionic/angular/standalone';
// import { Router } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonContent, IonInput, IonButton, IonItem, IonIcon, IonCard, IonCardContent, IonCheckbox, IonText],
//   templateUrl: './login.page.html',
//   styleUrls: ['./login.page.scss'],
// })
// export class LoginPage {
//   private auth = inject(AuthService);
//   private router = inject(Router);

//   email = '';
//   password = '';
//   remember = true;
//   loading = false;
//   error = '';

//   constructor() {
//     console.log('[LoginPage] constructor');
//   }
 
//   async submit() {
//     console.log('[LoginPage] submit clicked', { email: this.email });
//     this.loading = true;
//     this.error = '';
//     try {
//       const result = await this.auth.loginWithMock(this.email.trim(), this.password);
//       console.log('[LoginPage] login result', result);
//       if (!result.ok) {
//         this.error = result.message ?? 'Login failed';
//         return;
//       }
//       // navegar según el rol guardado
//       const role = result.role;
//       const target = role === 'super_admin' ? '/tabs/tab2' : '/tabs/tab3';
//       console.log('[LoginPage] redirigiendo a', target);
//       this.router.navigateByUrl(target, { replaceUrl: true });
//     } catch (e) {
//       console.error('[LoginPage] submit error', e);
//       this.error = 'Error inesperado';
//     } finally {
//       this.loading = false;
//     }
//   }
// }
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  // IonCard,
  // IonCardContent,
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
    // IonCard,
    // IonCardContent,
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

  async submit() {
    if (!this.email || !this.password) {
      this.showToast('Por favor completa todos los campos', 'warning');
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
      await loading.dismiss();
      this.showToast('¡Bienvenido!', 'success');
      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    } catch (err: any) {
      await loading.dismiss();
      this.error = err.message || 'Error al iniciar sesión';
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
}