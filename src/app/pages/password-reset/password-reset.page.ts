import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons';
import { ApiService } from 'src/app/core/services/api';

@Component({
  standalone: true,
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class PasswordResetPage {
  email = '';
  loading = false;

  constructor(
    private toastCtrl: ToastController,
    private router: Router,
    private api: ApiService
  ) {
    addIcons({ mailOutline });
  }

async submit() {
  const email = (this.email || '').trim().toLowerCase();

  // 1️⃣ Validación primero
  if (!email) {
    await this.presentToast('Enter your email address.', 'warning');
    return;
  }

  this.loading = true;

  try {
    // 2️⃣ Llamada real al backend
    await this.api.forgotPassword(email).toPromise();

    // 3️⃣ Mensaje de éxito (anti-enumeración)
    await this.presentToast(
      'If the email exists, we’ll send you a code to reset your password.',
      'success'
    );
  } catch (err) {
    // 4️⃣ Error real del backend
    await this.presentToast(
      'We couldn’t process your request. Please try again.',
      'danger'
    );
  } finally {
    this.loading = false;
  }
}


  goBack(ev?: Event) {
    ev?.preventDefault();
    ev?.stopPropagation();
    this.router.navigate(['/login']);
  }

  private async presentToast(
    message: string,
    color: 'success' | 'warning' | 'danger' ='warning'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
