// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   IonHeader,
//   IonToolbar,
//   IonTitle,
//   IonContent,
//   IonButton,
//   IonIcon,
//   IonSearchbar
// } from '@ionic/angular/standalone';
// import { UserMenuComponent } from '../components/user-menu/user-menu.component';
// import { Router } from '@angular/router';

// type Status = 'Planning' | 'In Progress' | 'Completed';

// type Obra = {
//   id: number;
//   clienteId: number;
//   nombre: string;
//   estado: Status;
//   progreso: number;
// };

// type Cliente = {
//   id: number;
//   nombre: string;
// };

// @Component({
//   selector: 'app-tab2',
//   standalone: true,
//   imports: [
//     CommonModule,
//     IonHeader,
//     IonToolbar,
//     IonTitle,
//     IonContent,
//     IonButton,
//     IonIcon,
//     IonSearchbar,
//     UserMenuComponent
//   ],
//   templateUrl: 'tab2.page.html',
//   styleUrls: ['tab2.page.scss']
// })
// export class Tab2Page {
//   search = '';
//   statusSelected: Status | 'all' = 'all';

//   clientes: Cliente[] = [
//     { id: 1, nombre: 'Nanuseria' },
//     { id: 2, nombre: 'Inmobiliaria del Sol' },
//     { id: 3, nombre: 'Constareña' },
//     { id: 4, nombre: 'Inmobiraciona' },
//   ];

//   todasLasObras: Obra[] = [
//     // Cliente 1 - Nanuseria
//     { id: 101, clienteId: 1, nombre: 'Construcción Hotel Blue', estado: 'In Progress', progreso: 70 },
//     { id: 102, clienteId: 1, nombre: 'Ampliación B', estado: 'Planning', progreso: 70 },
//     { id: 103, clienteId: 1, nombre: 'Proyecto Z', estado: 'Completed', progreso: 100 },
//     { id: 104, clienteId: 1, nombre: 'Residencial Los Pinos', estado: 'In Progress', progreso: 45 },
//     { id: 105, clienteId: 1, nombre: 'Torre Corporativa Norte', estado: 'Planning', progreso: 15 },

//     // Cliente 2 - Inmobiliaria del Sol
//     { id: 201, clienteId: 2, nombre: 'Condominio Primavera', estado: 'In Progress', progreso: 85 },
//     { id: 202, clienteId: 2, nombre: 'Plaza Comercial Andares II', estado: 'In Progress', progreso: 60 },
//     { id: 203, clienteId: 2, nombre: 'Fraccionamiento Bosques', estado: 'Planning', progreso: 25 },
//     { id: 204, clienteId: 2, nombre: 'Oficinas Tech Park', estado: 'Completed', progreso: 100 },
//     { id: 205, clienteId: 2, nombre: 'Edificio Residencial Centro', estado: 'In Progress', progreso: 40 },

//     // Cliente 3 - Constareña
//     { id: 301, clienteId: 3, nombre: 'Puente Vehicular Sur', estado: 'In Progress', progreso: 55 },
//     { id: 302, clienteId: 3, nombre: 'Escuela Primaria Nueva', estado: 'Planning', progreso: 30 },
//     { id: 303, clienteId: 3, nombre: 'Hospital Regional', estado: 'In Progress', progreso: 75 },
//     { id: 304, clienteId: 3, nombre: 'Parque Industrial Norte', estado: 'Completed', progreso: 100 },
//     { id: 305, clienteId: 3, nombre: 'Rehabilitación Vialidades', estado: 'In Progress', progreso: 65 },

//     // Cliente 4 - Inmobiraciona
//     { id: 401, clienteId: 4, nombre: 'Desarrollo Mixto Midtown', estado: 'In Progress', progreso: 50 },
//     { id: 402, clienteId: 4, nombre: 'Lofts Urbanos', estado: 'Planning', progreso: 20 },
//     { id: 403, clienteId: 4, nombre: 'Boutique Hotel Centro', estado: 'In Progress', progreso: 80 },
//   ];

//   constructor(private router: Router) {}

//   get filteredObras() {
//     const q = this.search.trim().toLowerCase();
//     return this.todasLasObras
//       .filter(o => this.statusSelected === 'all' ? true : o.estado === this.statusSelected)
//       .filter(o => !q ? true : o.nombre.toLowerCase().includes(q));
//   }

//   setStatus(status: Status | 'all') {
//     this.statusSelected = status;
//   }

//   onSearchChange(event: any) {
//     this.search = event.detail.value || '';
//   }

//   getStatusColor(estado: Status): string {
//     const colors = {
//       'Planning': '#6BA4D8',
//       'In Progress': '#E8B44F',
//       'Completed': '#6BBF6B'
//     };
//     return colors[estado];
//   }

//   getClienteName(clienteId: number): string {
//     return this.clientes.find(c => c.id === clienteId)?.nombre || 'Cliente Desconocido';
//   }

//   goObraDetalle(obraId: number, clienteId: number) {
//     console.log('Navegando a detalle de obra:', obraId);
//     this.router.navigate(['/tabs/tab1/obras', clienteId, 'detalle', obraId]);
//   }
// }
//de aqui para arriva fuciona con los datos mockeados
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

type Status = 'planning' | 'in_progress' | 'completed';

type Obra = {
  id: number;
  clienteId: number;
  clienteNombre: string;
  nombre: string;
  estado: string;
  progreso: number;
};

@Component({
  selector: 'app-tab2',
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
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  search = '';
  statusSelected: string = 'all';
  obras: Obra[] = [];
  loading = false;
  error = '';

  ngOnInit() {
    this.loadObras();
  }

  async loadObras() {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.apiService.getObras().toPromise();
      this.obras = response.obras;
    } catch (err: any) {
      this.error = 'Error al cargar obras';
      console.error('Error loading obras:', err);
    } finally {
      this.loading = false;
    }
  }

  get filteredObras() {
    const q = this.search.trim().toLowerCase();
    return this.obras
      .filter(o => this.statusSelected === 'all' ? true : o.estado === this.statusSelected)
      .filter(o => !q ? true : o.nombre.toLowerCase().includes(q) || o.clienteNombre.toLowerCase().includes(q));
  }

  setStatus(status: string) {
    this.statusSelected = status;
  }

  onSearchChange(event: any) {
    this.search = event.detail.value || '';
  }

  getStatusColor(estado: string): string {
    const colors: { [key: string]: string } = {
      'planning': '#6BA4D8',
      'in_progress': '#E8B44F',
      'completed': '#6BBF6B',
      'paused': '#95a5a6',
      'cancelled': '#e74c3c'
    };
    return colors[estado] || '#999';
  }

  getStatusLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'planning': 'Planning',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'paused': 'Pausada',
      'cancelled': 'Cancelada'
    };
    return labels[estado] || estado;
  }

  goObraDetalle(obraId: number, clienteId: number) {
    console.log('Navegando a detalle de obra:', obraId);
    this.router.navigate(['/tabs/tab1/obras', clienteId, 'detalle', obraId]);
  }
}