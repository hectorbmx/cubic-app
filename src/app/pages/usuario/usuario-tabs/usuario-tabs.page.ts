import { Component, inject } from '@angular/core';
// import { AuthService } from '../../core/services/auth.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { AlertController } from '@ionic/angular';
import { IonLabel,IonIcon,IonTabButton,IonTabBar,IonRouterOutlet,IonTabs,IonTitle} from '@ionic/angular/standalone';
@Component({
  selector: 'app-usuario-tabs',
  templateUrl: './usuario-tabs.page.html',
  styleUrls: ['./usuario-tabs.page.scss'],
 imports: [
    IonLabel,IonIcon,IonTabButton,IonTabBar,IonRouterOutlet,IonTabs,IonTitle
  ],
  
})
export class UsuarioTabsPage {
  private auth = inject(AuthService);
  private alertCtrl = inject(AlertController);

  constructor() {}

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salir',
          role: 'destructive',
          handler: async () => {
            await this.auth.logout();
          },
        },
      ],
    });

    await alert.present();
  }
}
