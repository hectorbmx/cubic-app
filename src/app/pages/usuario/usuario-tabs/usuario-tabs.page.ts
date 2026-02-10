import { Component, inject } from '@angular/core';
// import { AuthService } from '../../core/services/auth.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonModule } from '@angular/common';

import { AlertController } from '@ionic/angular';
import { IonLabel,IonIcon,IonTabButton,IonTabBar,IonRouterOutlet,IonTabs,IonTitle,IonAlert} from '@ionic/angular/standalone';
@Component({
  selector: 'app-usuario-tabs',
  templateUrl: './usuario-tabs.page.html',
  styleUrls: ['./usuario-tabs.page.scss'],
 imports: [CommonModule,
    IonLabel,IonIcon,IonTabButton,IonTabBar,IonRouterOutlet,IonTabs,IonTitle,IonAlert
  ],
  
})
export class UsuarioTabsPage {
  private auth = inject(AuthService);
  private alertCtrl = inject(AlertController);

  constructor() {}
  logoutOpen = false;
  logoutButtons = [
    { text: 'Cancelar', role: 'cancel' },
    { text: 'Salir', role: 'destructive', handler: () => this.auth.logout() },
  ];

async logout(ev?: Event) {
  ev?.preventDefault();
  ev?.stopPropagation();

  console.log('[TABS] logout tap - start');

  try {
    console.log('[TABS] creating alert...');
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Deseas cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Salir', role: 'destructive', handler: () => this.auth.logout() },
      ],
    });

    console.log('[TABS] presenting alert...');
    await alert.present();
    console.log('[TABS] alert presented');
  } catch (e) {
    console.error('[TABS] alert error', e);
  }
}
  openLogoutConfirm(ev?: Event) {
    ev?.preventDefault();
    ev?.stopPropagation();
    console.log('[TABS] logout tap (ion-alert)');
    this.logoutOpen = true;
  }

}
