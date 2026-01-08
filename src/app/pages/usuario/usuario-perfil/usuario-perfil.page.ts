import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar ,IonTitle} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
@Component({
  selector: 'app-usuario-perfil',
  templateUrl: './usuario-perfil.page.html',
  styleUrls: ['./usuario-perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule,IonTitle]
})
export class UsuarioPerfilPage implements OnInit {

  constructor(
     private alertCtrl: AlertController,
  private auth: AuthService
  ) { }

  ngOnInit() {

  }
async confirmLogout(ev: Event) {
  ev.preventDefault();
  ev.stopPropagation();

  const alert = await this.alertCtrl.create({
    header: 'Cerrar sesión',
    message: '¿Deseas salir de la aplicación?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Salir',
        role: 'destructive',
        handler: async () => {
          await this.auth.logout();
          // opcional: redirigir a login si no lo hace tu guard
          // this.router.navigate(['/login']);
        }
      }
    ]
  });

  await alert.present();
}
}
