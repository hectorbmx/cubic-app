import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController
} from '@ionic/angular/standalone';
import { UserMenuComponent } from 'src/app/components/user-menu/user-menu.component';
import { ApiService } from '../../core/services/api';
import { FileHandlerService } from '../../core/services/file-handler';

@Component({
  selector: 'app-obras-detalles',
  standalone: true,
  imports: [
    IonCardHeader, 
    IonCard, 
    UserMenuComponent,
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonItem,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner
  ],
  templateUrl: './obras-detalles.page.html',
  styleUrls: ['./obras-detalles.page.scss'],
})
export class ObrasDetallesPage implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private fileHandler = inject(FileHandlerService);
  private toastCtrl = inject(ToastController);
  
  obraId!: number;
  clienteId!: number;
  
  obra: any = null;
  loading = false;
  error = '';

  // Control de secciones expandidas/colapsadas
  expandedSections: { [key: string]: boolean } = {
    informacion: true,  // Por defecto abierta
    equipo: false,
    materiales: false,
    hitos: false,
    camaras: false,
    planos: false,
    contratos: false,
    informes: false,
    fotos: false
  };

  ngOnInit() {
    this.obraId = Number(this.route.snapshot.paramMap.get('obraId'));
    this.clienteId = Number(this.route.snapshot.paramMap.get('clienteId'));
    
    console.log('Obra ID:', this.obraId);
    console.log('Cliente ID:', this.clienteId);
    
    this.loadObraDetalle();
  }

  async loadObraDetalle() {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.apiService.getObra(this.obraId).toPromise();
      this.obra = response.obra;
      
      // Limpiar URLs de fotos
      if (this.obra.fotos && this.obra.fotos.length > 0) {
        this.obra.fotos = this.obra.fotos.map((foto: any) => {
          return {
            ...foto,
            url: this.normalizePhotoUrl(foto.url),
            thumbnail: foto.thumbnail ? this.normalizePhotoUrl(foto.thumbnail) : null
          };
        });
      }
      
      console.log('Obra detalle:', this.obra);
    } catch (err: any) {
      this.error = 'Error al cargar detalles de la obra';
      console.error('Error loading obra detalle:', err);
    } finally {
      this.loading = false;
    }
  }

  // Método para normalizar URLs de fotos
  normalizePhotoUrl(url: string): string {
    if (!url) return '';
    
    // Si la URL tiene 'storagehttp://' o 'storagehttps://' está duplicada - limpiarla
    if (url.includes('storagehttp://') || url.includes('storagehttps://')) {
      const match = url.match(/storage(https?:\/\/.+)/);
      if (match) {
        url = match[1];
      }
    }
    
    // Si es una ruta relativa (empieza con /), agregar el baseURL del backend
    if (url.startsWith('/')) {
      // TODO: Mover esto a environment.ts
      const backendUrl = 'http://127.0.0.1:8000';
      return backendUrl + url;
    }
    
    // Si es una URL completa pero no tiene /storage/, agregarlo
    if ((url.startsWith('http://') || url.startsWith('https://')) && !url.includes('/storage/')) {
      if (url.includes('/fotos/')) {
        url = url.replace('/fotos/', '/storage/fotos/');
      }
    }
    
    return url;
  }

  // Toggle para expandir/colapsar secciones
  toggleSection(section: string) {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  // Formatear números con separadores de miles
  formatNumber(value: any): string {
    if (!value) return '0';
    return Number(value).toLocaleString('es-MX');
  }

  // Color del progreso según el porcentaje
  getProgressColor(progress: number): string {
    if (progress >= 75) return '#6BBF6B';  // Verde
    if (progress >= 50) return '#E8B44F';  // Amarillo
    if (progress >= 25) return '#6BA4D8';  // Azul
    return '#95a5a6';  // Gris
  }

  // Abrir archivos
  async openPlano(plano: any) {
    try {
      await this.fileHandler.openFile(plano.url, plano.nombre);
    } catch (error) {
      this.showToast('Error al abrir el plano', 'danger');
    }
  }

  async openContrato(contrato: any) {
    try {
      await this.fileHandler.openFile(contrato.url, contrato.nombre);
    } catch (error) {
      this.showToast('Error al abrir el contrato', 'danger');
    }
  }

  async openInforme(informe: any) {
    try {
      await this.fileHandler.openFile(informe.url, informe.nombre);
    } catch (error) {
      this.showToast('Error al abrir el informe', 'danger');
    }
  }

  async openFoto(foto: any) {
    try {
      await this.fileHandler.openFile(foto.url);
    } catch (error) {
      this.showToast('Error al abrir la foto', 'danger');
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
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
      'planning': 'Planificación',
      'in_progress': 'En Progreso',
      'completed': 'Completada',
      'paused': 'Pausada',
      'cancelled': 'Cancelada'
    };
    return labels[estado] || estado;
  }
}