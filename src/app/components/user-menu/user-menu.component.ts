import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonAvatar, IonButton, IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, IonPopover, IonList, IonItem, IonLabel, IonAvatar],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // abrir/cerrar popover
  isOpen = false;

    // @ViewChild('menuPopover', { static: false }) popover?: IonPopover;

  user() { return this.auth.user(); }
    goToProfile() {
    this.router.navigate(['/user-perfil']); // ajusta la ruta si tu path es otro
  }


  async goPerfil() {
    console.log('[UserMenu] goPerfil');
    this.isOpen = false;
    this.router.navigateByUrl('/tabs/user-perfil'); // luego lo cambiamos a /tabs/perfil
  }

  async cambiarFoto() {
    this.isOpen = false;
    // TODO: aquí luego abrimos modal para elegir foto (mock)
    console.log('[UserMenu] cambiarFoto (mock)');
  }

  async logout() {
    this.isOpen = false;
    await this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
