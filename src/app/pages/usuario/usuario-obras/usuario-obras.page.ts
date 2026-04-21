import { Component, OnInit,ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/api';
import { ObraSectionModalComponent } from './obra-section-modal.component';
import { IonSelect } from '@ionic/angular/standalone';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { UserProfileButtonComponent } from 'src/app/components/user-menu/user-profile-button/user-profile-button.component';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,IonRefresher,IonRefresherContent,
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
  videocamOutline,exitOutline,
  cameraOutline,
  triangleOutline,
  documentTextOutline, chevronDownOutline, clipboardOutline, peopleCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-usuario-obras',
  templateUrl: './usuario-obras.page.html',
  styleUrls: ['./usuario-obras.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, IonRefresher,IonRefresherContent,
    IonToolbar, UserProfileButtonComponent,
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
  isLoading = true;
   obras: any[] = [];
  obraIdSeleccionada: number | null = null;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) {
    addIcons({chevronBackOutline,exitOutline,statsChartOutline,calendarOutline,videocamOutline,cameraOutline,triangleOutline,documentTextOutline,peopleCircleOutline,clipboardOutline,chevronDownOutline});
  }

  
// ngOnInit(): void {
//   this.modalCtrl.getTop().then(modal => {
//     if (modal) {
//       console.log('[OBRAS] Hay un modal abierto, cerrándolo...');
//       modal.dismiss();
//     }
//   });

//   const userRaw = localStorage.getItem('user');
//   if (!userRaw) {
//     console.error('[OBRAS] No hay user en storage');
//     return;
//   }

//   let user: any = null;
//   try {
//     user = JSON.parse(userRaw);
//   } catch (e) {
//     console.error('[OBRAS] Error parseando user', e);
//     return;
//   }

//   const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];
//   const isUserRole = roles.includes('user'); // residente

//   // ✅ SI ES "user": usar SOLO obras asignadas que ya vienen en /me
//   if (isUserRole) {
//     const obrasAsignadas = Array.isArray(user?.obras) ? user.obras : [];

//     // Normalizar IDs
//     this.obras = obrasAsignadas.map((o: any) => ({
//       ...o,
//       id: Number(o.id),
//       client_id: Number(o.client_id),
//     }));

//     console.log('[OBRAS] Obras asignadas (desde /me):', this.obras);

//     // Selección inicial (misma lógica que ya tenías)
//     if (this.obras.length > 0) {
//       const savedId = localStorage.getItem('obra_id');

//       if (savedId) {
//         const savedIdNum = Number(savedId);
//         const encontrada = this.obras.find(o => o.id === savedIdNum);
//         if (encontrada) this.obraIdSeleccionada = savedIdNum;
//       }

//       if (!this.obraIdSeleccionada) {
//         this.obraIdSeleccionada = this.obras[0].id;
//         localStorage.setItem('obra_id', String(this.obras[0].id));
//       }

//       console.log('[OBRAS] Obra seleccionada:', this.obraIdSeleccionada);
//     }

//     return; // 👈 importante: no caer al endpoint por cliente
//   }

//   // ✅ SI NO ES "user" (admin/superadmin): aquí puedes seguir usando el endpoint por cliente si aplica
//   const clienteId = Number(user.clientId ?? user.client_id ?? null);
//   if (!clienteId) {
//     console.error('[OBRAS] No hay cliente_id válido');
//     return;
//   }

//   this.apiService.getObrasByCliente(clienteId).subscribe({
//     next: (res: any) => {
//       let listaFinal: any[] = [];
//       if (res?.data && Array.isArray(res.data)) {
//         listaFinal = res.data;
//       } else if (Array.isArray(res)) {
//         listaFinal = res;
//       } else {
//         listaFinal = [res];
//       }

//       this.obras = listaFinal.map((o: any) => ({
//         ...o,
//         id: Number(o.id),
//       }));

//       console.log('[OBRAS] Obras cargadas (por cliente):', this.obras);

//       if (this.obras.length > 0) {
//         const savedId = localStorage.getItem('obra_id');

//         if (savedId) {
//           const savedIdNum = Number(savedId);
//           const encontrada = this.obras.find(o => o.id === savedIdNum);
//           if (encontrada) this.obraIdSeleccionada = savedIdNum;
//         }

//         if (!this.obraIdSeleccionada) {
//           this.obraIdSeleccionada = this.obras[0].id;
//           localStorage.setItem('obra_id', String(this.obras[0].id));
//         }

//         console.log('[OBRAS] Obra seleccionada:', this.obraIdSeleccionada);
//       }
//     },
//     error: (err) => console.error('[OBRAS] Error:', err),
//   });
// }
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
    this.isLoading = false;
    return;
  }

  let user: any = null;
  try {
    user = JSON.parse(userRaw);
  } catch (e) {
    console.error('[OBRAS] Error parseando user', e);
    this.isLoading = false;
    return;
  }

  const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];
  const isUserRole = roles.includes('user');

  // Ajusta estos nombres según tus roles reales
  const isSuperAdmin =
    roles.includes('super-admin') ||
    roles.includes('superAdmin') ||
    roles.includes('admin');

  // 1) SIEMPRE revisar primero las obras que vienen desde /me
  const obrasDesdeMe = Array.isArray(user?.obras) ? user.obras : [];

  if (obrasDesdeMe.length > 0) {
    this.obras = obrasDesdeMe.map((o: any) => ({
      ...o,
      id: Number(o.id),
      client_id: o.client_id ? Number(o.client_id) : null,
    }));

    console.log('[OBRAS] Obras cargadas desde /me:', this.obras);

    const savedId = localStorage.getItem('obra_id');
    if (savedId) {
      const savedIdNum = Number(savedId);
      const encontrada = this.obras.find(o => o.id === savedIdNum);
      if (encontrada) {
        this.obraIdSeleccionada = savedIdNum;
      }
    }

    if (!this.obraIdSeleccionada && this.obras.length > 0) {
      this.obraIdSeleccionada = this.obras[0].id;
      localStorage.setItem('obra_id', String(this.obras[0].id));
    }

    console.log('[OBRAS] Obra seleccionada:', this.obraIdSeleccionada);
    this.isLoading = false;
    return;
  }

  // 2) Si es usuario normal y NO trae obras asignadas en /me, no debe ver ninguna
  if (isUserRole) {
    console.warn('[OBRAS] Usuario con rol "user" sin obras asignadas en /me');
    this.obras = [];
    this.obraIdSeleccionada = null;
    localStorage.removeItem('obra_id');
    this.isLoading = false;
    return;
  }

  // 3) Solo super admin / admin pueden hacer fallback por cliente
  if (!isSuperAdmin) {
    console.warn('[OBRAS] Rol sin permiso para consultar obras por cliente');
    this.obras = [];
    this.obraIdSeleccionada = null;
    localStorage.removeItem('obra_id');
    this.isLoading = false;
    return;
  }

  const clienteIdRaw =
    user?.clientId ??
    user?.client_id ??
    user?.cliente_activo_id ??
    null;

  const clienteId = clienteIdRaw ? Number(clienteIdRaw) : null;

  if (!clienteId) {
    console.warn('[OBRAS] No hay obras en /me ni cliente_id válido');
    this.obras = [];
    this.obraIdSeleccionada = null;
    localStorage.removeItem('obra_id');
    this.isLoading = false;
    return;
  }

  this.apiService.getObrasByCliente(clienteId).subscribe({
    next: (res: any) => {
      let listaFinal: any[] = [];

      if (res?.data && Array.isArray(res.data)) {
        listaFinal = res.data;
      } else if (Array.isArray(res)) {
        listaFinal = res;
      } else if (res) {
        listaFinal = [res];
      }

      this.obras = listaFinal.map((o: any) => ({
        ...o,
        id: Number(o.id),
      }));

      console.log('[OBRAS] Obras cargadas por cliente:', this.obras);

      const savedId = localStorage.getItem('obra_id');
      if (savedId) {
        const savedIdNum = Number(savedId);
        const encontrada = this.obras.find(o => o.id === savedIdNum);
        if (encontrada) {
          this.obraIdSeleccionada = savedIdNum;
        }
      }

      if (!this.obraIdSeleccionada && this.obras.length > 0) {
        this.obraIdSeleccionada = this.obras[0].id;
        localStorage.setItem('obra_id', String(this.obras[0].id));
      }

      console.log('[OBRAS] Obra seleccionada:', this.obraIdSeleccionada);
      this.isLoading = false;
    },
    error: (err) => {
      console.error('[OBRAS] Error:', err);
      this.isLoading = false;
    },
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

async openSection(section: 'info' | 'timeline' | 'camaras' | 'fotos' | 'planos' | 'informes' | 'directorio') {
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

const modal = await this.modalCtrl.create({
  component: ObraSectionModalComponent,
  cssClass: 'obra-fullscreen-modal',
  breakpoints: [1],
  initialBreakpoint: 1,
  handle: false,
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
  
private getClienteId(): number | null {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) {
    console.error('[OBRAS] No hay user en storage');
    return null;
  }

  try {
    const user = JSON.parse(userRaw);
    const clienteId = Number(user.clientId ?? user.client_id ?? null);
    return clienteId || null;
  } catch (e) {
    console.error('[OBRAS] Error parseando user', e);
    return null;
  }
}

private cargarObras(onFinish?: () => void) {
  const clienteId = this.getClienteId();

  if (!clienteId) {
    console.error('[OBRAS] No hay cliente_id válido');
    onFinish?.();
    return;
  }

  this.apiService.getObrasByCliente(clienteId).subscribe({
    next: (res: any) => {
      let listaFinal: any[] = [];
      if (res?.data && Array.isArray(res.data)) {
        listaFinal = res.data;
      } else if (Array.isArray(res)) {
        listaFinal = res;
      } else {
        listaFinal = [res];
      }

      this.obras = listaFinal.map((o: any) => ({
        ...o,
        id: Number(o.id)
      }));

      console.log('[OBRAS] Obras cargadas:', this.obras);

      if (this.obras.length > 0) {
        const savedId = localStorage.getItem('obra_id');

        if (savedId) {
          const savedIdNum = Number(savedId);
          const encontrada = this.obras.find(o => o.id === savedIdNum);
          if (encontrada) {
            this.obraIdSeleccionada = savedIdNum;
          }
        }

        if (!this.obraIdSeleccionada) {
          this.obraIdSeleccionada = this.obras[0].id;
          localStorage.setItem('obra_id', String(this.obras[0].id));
        }

        console.log('[OBRAS] Obra seleccionada:', this.obraIdSeleccionada);
      }

      onFinish?.();
    },
    error: (err) => {
      console.error('[OBRAS] Error:', err);
      onFinish?.();
    }
  });
}
private refrescarMe(onFinish?: () => void) {
  this.apiService.me().subscribe({
    next: (me: any) => {
      // Actualiza user en storage manteniendo compatibilidad
      localStorage.setItem('user', JSON.stringify(me));

      // Si es rol user: tomar obras asignadas desde /me
      const roles: string[] = Array.isArray(me?.roles) ? me.roles : [];
      const isUserRole = roles.includes('user');

      if (isUserRole) {
        const obrasAsignadas = Array.isArray(me?.obras) ? me.obras : [];

        this.obras = obrasAsignadas.map((o: any) => ({
          ...o,
          id: Number(o.id),
          client_id: Number(o.client_id),
        }));

        // Mantener selección
        if (this.obras.length > 0) {
          const savedId = localStorage.getItem('obra_id');

          if (savedId) {
            const savedIdNum = Number(savedId);
            const encontrada = this.obras.find(o => o.id === savedIdNum);
            if (encontrada) this.obraIdSeleccionada = savedIdNum;
          }

          if (!this.obraIdSeleccionada) {
            this.obraIdSeleccionada = this.obras[0].id;
            localStorage.setItem('obra_id', String(this.obras[0].id));
          }
        } else {
          // Si ya no tiene obras asignadas, limpiar selección
          this.obraIdSeleccionada = null;
          localStorage.removeItem('obra_id');
        }

        console.log('[OBRAS] Refrescado desde /me:', this.obras);
        onFinish?.();
        return;
      }

      // Si NO es user, dejamos que el refresher use el endpoint por cliente
      onFinish?.();
    },
    error: (err) => {
      console.error('[OBRAS] Error refrescando /me', err);
      onFinish?.();
    },
  });
}
doRefresh(event: any) {
  // Siempre refrescamos /me primero para tener data fresca en storage
  this.refrescarMe(() => {
    // Luego, si no es rol user, refrescamos por cliente
    const userRaw = localStorage.getItem('user');
    let user: any = null;

    try {
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch {
      user = null;
    }

    const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];
    const isUserRole = roles.includes('user');

    if (isUserRole) {
      event?.target?.complete();
      return;
    }

    // admin/superadmin: refrescar listado por cliente
    this.cargarObras(() => event?.target?.complete());
  });
}

}