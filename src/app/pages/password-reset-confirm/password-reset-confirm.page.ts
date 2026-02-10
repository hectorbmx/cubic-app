import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonContent,
  IonIcon,
  ToastController,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { lockClosedOutline, keyOutline } from 'ionicons/icons';

import { ApiService } from 'src/app/core/services/api'; // ajusta si tu path es diferente

@Component({
  standalone: true,
  selector: 'app-password-reset-confirm',
  templateUrl: './password-reset-confirm.page.html',
  styleUrls: ['./password-reset-confirm.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class PasswordResetConfirmPage implements OnInit {
  rid: string | null = null;

  code = '';
  password = '';
  password_confirmation = '';

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController,
    private api: ApiService
  ) {
    addIcons({ lockClosedOutline, keyOutline });
  }

  ngOnInit(): void {
    this.rid = this.route.snapshot.queryParamMap.get('rid');

    if (!this.rid) {
      this.presentToast('Invalid reset link. Please request a new code.', 'warning');
    }
  }

  async submit() {
    if (!this.rid) {
      await this.presentToast('Invalid reset link. Please request a new code.', 'warning');
      return;
    }

    const code = (this.code || '').trim();
    const password = (this.password || '').trim();
    const confirm = (this.password_confirmation || '').trim();

    if (!/^\d{6}$/.test(code)) {
      await this.presentToast('Enter the 6-digit code.', 'warning');
      return;
    }

    if (password.length < 8) {
      await this.presentToast('Password must be at least 8 characters.', 'warning');
      return;
    }

    if (password !== confirm) {
      await this.presentToast('Passwords do not match.', 'warning');
      return;
    }

    this.loading = true;
    try {
      // Endpoint: /api/v1/password/reset
     const res = await this.api.resetPassword({
        rid: this.rid,
        code,
        password,
        password_confirmation: confirm,
      }).toPromise();


      if (res?.ok) {
        await this.presentToast('Password updated successfully.', 'success');
        this.router.navigate(['/login']);
        return;
      }

      await this.presentToast('We couldn’t process your request. Please try again.', 'danger');
    } catch (err: any) {
      const msg =
        err?.error?.message ||
        'We couldn’t process your request. Please try again.';
      await this.presentToast(msg, 'danger');
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
    color: 'success' | 'warning' | 'danger' = 'warning'
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
