import { Component, OnInit,ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/api';
import { ObraSectionModalComponent } from './obra-section-modal.component';
import { IonSelect } from '@ionic/angular/standalone';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons,
  IonButton,
  IonIcon,
  
  IonSelectOption,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, 
  statsChartOutline,
  calendarOutline,
  videocamOutline,
  cameraOutline,
  triangleOutline,
  documentTextOutline, chevronDownOutline } from 'ionicons/icons';

@Component({
  selector: 'app-usuario-obras',
  templateUrl: './usuario-obras.page.html',
  styleUrls: ['./usuario-obras.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
    CommonModule, 
    FormsModule
  ]
})
export class UsuarioObrasPage implements OnInit {
   @ViewChild('selectObra') selectObra!: IonSelect;
  obras: any[] = [];
  obraIdSeleccionada: number | null = null;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private apiService: ApiService
  ) {
    addIcons({chevronBackOutline,chevronDownOutline,statsChartOutline,calendarOutline,videocamOutline,cameraOutline,triangleOutline,documentTextOutline});
  }

  ngOnInit(): void {
      this.modalCtrl.getTop().then(modal => {
    if (modal) {
      console.log('[OBRAS] Hay un modal abierto, cerrándolo...');
      modal.dismiss();
    }
  });
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      console.error('[OBRAS] No hay user en storage');
      return;
    }

    let clienteId: number | null = null;
    try {
      const user = JSON.parse(userRaw);
      clienteId = Number(user.clientId ?? user.client_id ?? null);
    } catch (e) {
      console.error('[OBRAS] Error parseando user', e);
    }

    if (!clienteId) {
      console.error('[OBRAS] No hay cliente_id válido');
      return;
    }

    // Cargar obras
    this.apiService.getObrasByCliente(clienteId).subscribe({
      next: (res: any) => {
        // Extraer array de datos
        let listaFinal = [];
        if (res?.data && Array.isArray(res.data)) {
          listaFinal = res.data;
        } else if (Array.isArray(res)) {
          listaFinal = res;
        } else {
          listaFinal = [res];
        }

        // Normalizar IDs a números
        this.obras = listaFinal.map((o: any) => ({
          ...o,
          id: Number(o.id)
        }));

        console.log('[OBRAS] Obras cargadas:', this.obras);

        // Establecer valor inicial
        if (this.obras.length > 0) {
          const savedId = localStorage.getItem('obra_id');
          
          if (savedId) {
            const savedIdNum = Number(savedId);
            const encontrada = this.obras.find(o => o.id === savedIdNum);
            if (encontrada) {
              this.obraIdSeleccionada = savedIdNum;
            }
          }
          
          // Si no hay selección, tomar la primera
          if (!this.obraIdSeleccionada) {
            this.obraIdSeleccionada = this.obras[0].id;
            localStorage.setItem('obra_id', String(this.obras[0].id));
          }
          
          console.log('[OBRAS] Obra seleccionada:', this.obraIdSeleccionada);
        }
      },
      error: (err) => console.error('[OBRAS] Error:', err)
    });
  }

  goBack() {
    this.router.navigate(['/usuario']);
  }

  onObraChange() {
    console.log('[OBRAS] Cambio a:', this.obraIdSeleccionada);
    if (this.obraIdSeleccionada) {
      localStorage.setItem('obra_id', String(this.obraIdSeleccionada));
    }
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

async openSection(section: 'info' | 'timeline' | 'camaras' | 'fotos' | 'planos' | 'informes') {
  // 1) Asegurar obraId SIEMPRE
  let obraId = this.obraIdSeleccionada;

  // Si por cualquier razón está null, toma la primera obra cargada
  if (!obraId && this.obras.length > 0) {
    obraId = Number(this.obras[0].id);
    this.obraIdSeleccionada = obraId;
    localStorage.setItem('obra_id', String(obraId));
    console.log('[OBRAS] obraId autoseleccionada para abrir sección:', obraId);
  }

  if (!obraId) {
    console.warn('[OBRAS] No hay obra seleccionada y no hay obras cargadas.');
    return;
  }

  // 2) Abrir modal de sección
  const modal = await this.modalCtrl.create({
    component: ObraSectionModalComponent,
    breakpoints: [0, 0.5, 0.9],
    initialBreakpoint: 0.9,
    componentProps: {
      obraId,
      section
    }
  });

  await modal.present();
}

   getObraNombre(): string {
    if (!this.obraIdSeleccionada) return 'Selecciona una obra';
    
    const obra = this.obras.find(o => o.id === this.obraIdSeleccionada);
    return obra?.name || obra?.nombre || `Obra #${this.obraIdSeleccionada}`;
  }

  async abrirSelect() {
    console.log('[OBRAS] Click en selector, intentando abrir...');
    if (this.selectObra) {
      await this.selectObra.open();
    }
  }
  

}