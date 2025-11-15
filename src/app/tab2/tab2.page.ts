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
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { Obra } from 'src/app/models/obra';

type Status = 'planning' | 'in_progress' | 'completed';

// type Obra = {
//   id: number;
//   clienteId: number;
//   clienteNombre: string;
//   nombre: string;
//   estado: string;
//   progreso: number;
// };

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
  private auth = inject(AuthService);

  search = '';
  statusSelected: string = 'all';
  obras: Obra[] = [];
  loading = false;
  error = '';

  activeClientId: number | null = null;
  activeClientName: string | null = null;
  

  ngOnInit() {
    // this.activeClientId   = this.auth.activeClientId();
    
    // this.activeClientName = this.auth.activeClientName();
    this.loadObras();
  }

async loadObras() {
  this.loading = true;
  this.error = '';

  try {
    console.log('🔵 loadObras iniciado');
    console.log('🔵 Usuario:', this.auth.user());
    console.log('🔵 Token:', localStorage.getItem('auth_token'));
    
    const res = await firstValueFrom(this.apiService.getObras());
    console.log('✅ Respuesta completa:', res);
    console.log('✅ res.obras:', res.obras);
    
    this.obras = res.obras || [];
    console.log('✅ Obras asignadas:', this.obras);
    
  } catch (err: any) {
    console.error('❌ Error completo:', err);
    console.error('❌ Error response:', err.error);
    this.error = 'Error al cargar obras';
  } finally {
    this.loading = false;
  }
}
//
  get filteredObras() {
    const q = this.search.trim().toLowerCase();
    return this.obras
      .filter(o => this.statusSelected === 'all' ? true : o.estado === this.statusSelected)
      .filter(o => !q ? true : o.nombre.toLowerCase().includes(q) || (o.clienteNombre ?? '').toLowerCase().includes(q))
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