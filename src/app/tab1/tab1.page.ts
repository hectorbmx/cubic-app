
import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule ,DOCUMENT} from '@angular/common';
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

  private lastScrollTop = 0;
  private hiding = false;

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