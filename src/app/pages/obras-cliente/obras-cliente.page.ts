import { CommonModule,DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonAccordion,
  IonAccordionGroup,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
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
  imports: [IonCard, IonLabel, IonItem, IonAccordion, IonAccordionGroup, 
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
  private lastScrollTop = 0;
  private hiding = false;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

    constructor(@Inject(DOCUMENT) private document: Document) {}
    onScroll(ev: CustomEvent) {
    const scrollTop = (ev.detail as any).scrollTop || 0;

    if (scrollTop <= 0) {
      // hasta arriba → mostrar menú
      this.setTabBarHidden(false);
      this.lastScrollTop = 0;
      return;
    }

    // si la diferencia es muy pequeña, ignoramos (para que no parpadee)
    const diff = scrollTop - this.lastScrollTop;
    if (Math.abs(diff) < 5) {
      return;
    }

    if (diff > 0) {
      // bajando → ocultar
      this.setTabBarHidden(true);
    } else {
      // subiendo → mostrar
      this.setTabBarHidden(false);
    }

    this.lastScrollTop = scrollTop;
  }
private setTabBarHidden(hidden: boolean) {
    if (this.hiding === hidden) return; // ya está en ese estado

    const tabBar = this.document.querySelector('ion-tab-bar') as HTMLElement | null;
    if (!tabBar) return;

    tabBar.style.transition = 'transform 200ms ease';
    tabBar.style.transform = hidden ? 'translateY(100%)' : 'translateY(0)';
    this.hiding = hidden;
  }

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
  getObrasPorEstado(status: 'all' | 'planning' | 'in_progress' | 'completed') {
  if (!this.filteredObras) return [];

  if (status === 'all') {
    return this.filteredObras;
  }

  return this.filteredObras.filter(obra => obra.estado === status);
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