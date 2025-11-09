// import { Component } from '@angular/core';
// import { 
//   IonHeader, IonToolbar, IonTitle, IonContent, 
//    IonButton, IonIcon, IonSearchbar 
// } from '@ionic/angular/standalone';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { UserMenuComponent } from '../components/user-menu/user-menu.component';
// import { Router } from '@angular/router';

// type Cliente = { id: number; nombre: string; email: string; obrasActivas: number; };

// @Component({
//   selector: 'app-tab1',
//   standalone: true,
//   imports: [
//     CommonModule, 
//     FormsModule,  
//     IonHeader, 
//     IonToolbar, 
//     IonTitle,
//     UserMenuComponent, 
//     IonContent, 
//     IonButton,
//     IonIcon, 
//     IonSearchbar,
//   ],
//   templateUrl: 'tab1.page.html',
//   styleUrls: ['tab1.page.scss']
// })
// export class Tab1Page {
//   search = '';
//   clientes: Cliente[] = [
//     { id: 1, nombre: 'Nanuseria', email: 'contacto@nanuseria.com', obrasActivas: 5 },
//     { id: 2, nombre: 'Inmobiliaria del Sol', email: 'contacto@inmosol.com', obrasActivas: 5 },
//     { id: 3, nombre: 'Constareña', email: 'info@constarena.com', obrasActivas: 5 },
//     { id: 4, nombre: 'Inmobiraciona', email: 'ventas@inmobiraciona.com', obrasActivas: 3 },
//   ];

//   constructor(private router: Router) {
//         console.log('Tab1Page constructor - clientes:', this.clientes);

//   }
//   onSearchChange(event: any) {
//     this.search = event.detail.value || '';
//   }
//   goObras(clienteId: number) {
//     // console.log('=== CLICK DETECTADO ===');
//     console.log('Cliente ID:', clienteId);
//     // alert('Click en cliente: ' + clienteId); // <- Prueba con alert
//     this.router.navigate(['/tabs/tab1/obras', clienteId]);
//   }
//     testClick() {
//     console.log('TEST CLICK FUNCIONÓ');
//     alert('Click funciona!');
//   }
//     get filteredClientes() {
//     if (!this.search.trim()) {
//       return this.clientes;
//     }
//     const query = this.search.toLowerCase();
//     return this.clientes.filter(c => 
//       c.nombre.toLowerCase().includes(query) ||
//       c.email.toLowerCase().includes(query)
//     );
//   }
// }
//de aqui para arriba funciona con los datos mockeados
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSpinner
} from '@ionic/angular/standalone';
import { UserMenuComponent } from '../components/user-menu/user-menu.component';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api';

type Cliente = { 
  id: number; 
  nombre: string; 
  email: string; 
  obrasActivas: number; 
};

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonSpinner,
    UserMenuComponent
  ],
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  search = '';
  clientes: Cliente[] = [];
  loading = false;
  error = '';

  ngOnInit() {
    this.loadClientes();
  }

  async loadClientes() {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.apiService.getClientes().toPromise();
      this.clientes = response.clientes;
    } catch (err: any) {
      this.error = 'Error al cargar clientes';
      console.error('Error loading clientes:', err);
    } finally {
      this.loading = false;
    }
  }

  get filteredClientes() {
    if (!this.search.trim()) {
      return this.clientes;
    }
    const query = this.search.toLowerCase();
    return this.clientes.filter(c =>
      c.nombre.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  }

  onSearchChange(event: any) {
    this.search = event.detail.value || '';
  }

  goObras(clienteId: number) {
    console.log('Navegando a obras del cliente:', clienteId);
    this.router.navigate(['/tabs/tab1/obras', clienteId]);
  }
}