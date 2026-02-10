import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-user-profile-button',
  standalone: true,
  imports: [IonButton, IonIcon],
  template: `
    <ion-button
      fill="clear"
      size="small"
      class="profile-btn"
      (click)="goToProfile()"
      aria-label="Perfil de usuario"
    >
      <ion-icon name="person-circle-outline" class="profile-icon"></ion-icon>
    </ion-button>
  `,
  styles: [`
    .profile-btn {
      --padding-start: 6px;
      --padding-end: 6px;
    }

    .profile-icon {
      font-size: 28px;
    }
  `]
})
export class UserProfileButtonComponent {

  constructor(private router: Router) {
    addIcons({ personCircleOutline });
  }

  goToProfile() {
    this.router.navigateByUrl('/usuario-profile');
  }
}
