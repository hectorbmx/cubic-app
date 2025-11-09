// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   IonHeader, 
//   IonToolbar, 
//   IonTitle, 
//   IonButtons, 
//   IonButton, 
//   IonIcon,
//   IonContent,
//   IonSearchbar,
//   IonBackButton
// } from '@ionic/angular/standalone';
// import { ActivatedRoute, Router } from '@angular/router';

// type Status = 'Planning' | 'In Progress' | 'Completed';

// type Obra = {
//   id: number; 
//   clienteId: number; 
//   nombre: string;
//   estado: Status; 
//   progreso: number;
// };

// @Component({
//   selector: 'app-obras-cliente',
//   standalone: true,
//   imports: [
//     CommonModule, 
//     IonHeader, 
//     IonToolbar, 
//     IonTitle, 
//     IonButtons, 
//     IonButton, 
//     IonIcon, 
//     IonContent,
//     IonSearchbar,
//     IonBackButton
//   ],
//   templateUrl: './obras-cliente.page.html',
//   styleUrls: ['./obras-cliente.page.scss'],
// })
// export class ObrasClientePage implements OnInit {
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);

//   clienteId!: number;
//   search = '';
//   statusSelected: Status | 'all' = 'all';

//   // Datos mock de todas las obras
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

//   obras: Obra[] = [];

//   ngOnInit() {
//     this.clienteId = Number(this.route.snapshot.paramMap.get('clienteId'));
//     console.log('Cliente ID recibido:', this.clienteId);
    
//     // Filtrar obras por cliente
//     this.obras = this.todasLasObras.filter(o => o.clienteId === this.clienteId);
//     console.log('Obras del cliente:', this.obras);
//   }

//   get filteredObras() {
//     const q = this.search.trim().toLowerCase();
//     return this.obras
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

// goObraDetalle(obraId: number) {
//   console.log('Navegando a detalle de obra:', obraId);
//   this.router.navigate(['/tabs/tab1/obras', this.clienteId, 'detalle', obraId]);
// }
// }
//de aqui para arriva fuciona con los datos mockeados
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon,
  IonContent,
  IonSearchbar,
  IonBackButton,
  IonSpinner
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api';

type Status = 'planning' | 'in_progress' | 'completed';

type Obra = {
  id: number; 
  clienteId: number; 
  nombre: string;
  estado: string; 
  progreso: number;
};

@Component({
  selector: 'app-obras-cliente',
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonContent,
    IonSearchbar,
    IonBackButton,
    IonSpinner
  ],
  templateUrl: './obras-cliente.page.html',
  styleUrls: ['./obras-cliente.page.scss'],
})
export class ObrasClientePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  clienteId!: number;
  clienteNombre: string = '';
  search = '';
  statusSelected: string = 'all';
  obras: Obra[] = [];
  loading = false;
  error = '';

  ngOnInit() {
    this.clienteId = Number(this.route.snapshot.paramMap.get('clienteId'));
    console.log('Cliente ID recibido:', this.clienteId);
    this.loadObrasCliente();
  }

  async loadObrasCliente() {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.apiService.getCliente(this.clienteId).toPromise();
      this.clienteNombre = response.cliente.nombre;
      this.obras = response.cliente.obras.map((obra: any) => ({
        id: obra.id,
        clienteId: this.clienteId,
        nombre: obra.nombre,
        estado: obra.estado,
        progreso: obra.progreso
      }));
      console.log('Obras del cliente:', this.obras);
    } catch (err: any) {
      this.error = 'Error al cargar obras del cliente';
      console.error('Error loading obras:', err);
    } finally {
      this.loading = false;
    }
  }

  get filteredObras() {
    const q = this.search.trim().toLowerCase();
    return this.obras
      .filter(o => this.statusSelected === 'all' ? true : o.estado === this.statusSelected)
      .filter(o => !q ? true : o.nombre.toLowerCase().includes(q));
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

  goObraDetalle(obraId: number) {
    console.log('Navegando a detalle de obra:', obraId);
    this.router.navigate(['/tabs/tab1/obras', this.clienteId, 'detalle', obraId]);
  }
}