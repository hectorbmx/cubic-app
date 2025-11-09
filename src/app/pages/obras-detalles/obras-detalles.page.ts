// import { Component, OnInit, inject } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import {
//   IonHeader,
//   IonToolbar,
//   IonTitle,
//   IonContent,
//   IonButtons,
//   IonBackButton,
//   IonButton,
//   IonIcon,
//   IonSegment,
//   IonSegmentButton,
//   IonLabel
// } from '@ionic/angular/standalone';

// @Component({
//   selector: 'app-obras-detalles',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     IonHeader,
//     IonToolbar,
//     IonTitle,
//     IonContent,
//     IonButtons,
//     IonBackButton,
//     IonButton,
//     IonIcon,
//     IonSegment,
//     IonSegmentButton,
//     IonLabel
//   ],
//   templateUrl: './obras-detalles.page.html',
//   styleUrls: ['./obras-detalles.page.scss'],
// })
// export class ObrasDetallesPage implements OnInit {
//   private route = inject(ActivatedRoute);
  
//   obraId!: number;
//   clienteId!: number;
//   selectedTab: string = 'informacion';

//   ngOnInit() {
//     this.obraId = Number(this.route.snapshot.paramMap.get('obraId'));
//     this.clienteId = Number(this.route.snapshot.paramMap.get('clienteId'));
    
//     console.log('Obra ID:', this.obraId);
//     console.log('Cliente ID:', this.clienteId);
//   }
// }
//de aqui para arriba funciona con los datos mockeados
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { ApiService } from '../../core/services/api';
import { FileHandlerService } from '../../core/services/file-handler';

@Component({
  selector: 'app-obras-detalles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
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
  selectedTab: string = 'informacion';
  
  obra: any = null;
  loading = false;
  error = '';

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
      console.log('Obra detalle:', this.obra);
    } catch (err: any) {
      this.error = 'Error al cargar detalles de la obra';
      console.error('Error loading obra detalle:', err);
    } finally {
      this.loading = false;
    }
  }

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
      'planning': 'Planning',
      'in_progress': 'En Progreso',
      'completed': 'Completada',
      'paused': 'Pausada',
      'cancelled': 'Cancelada'
    };
    return labels[estado] || estado;
  }
}