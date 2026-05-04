import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service'; // Ajusta la ruta
import { effect } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/api';
import { ObraSectionModalComponent } from './obra-section-modal.component';
import { IonSelect } from '@ionic/angular/standalone';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { UserProfileButtonComponent } from 'src/app/components/user-menu/user-profile-button/user-profile-button.component';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastController } from '@ionic/angular';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
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
  exitOutline,
  cameraOutline,
  triangleOutline,
  documentTextOutline,
  chevronDownOutline,
  clipboardOutline,
  peopleCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-usuario-obras',
  templateUrl: './usuario-obras.page.html',
  styleUrls: ['./usuario-obras.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonRefresher,
    IonRefresherContent,
    IonToolbar,
    UserProfileButtonComponent,
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
  loadingObras = false;

  obras: any[] = [];
  obrasFiltradas: any[] = [];
  clientes: any[] = [];
  tieneCamaras: boolean | null = null;
  obraIdSeleccionada: number | null = null;
  clienteIdSeleccionado: number | null = null;

  constructor(
    private authService: AuthService, // <--- Inyectar
    private router: Router,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
      private toastCtrl: ToastController,

  )
  
  {
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.syncDataWithAuth(user);
      }
    });
    addIcons({
      chevronBackOutline,
      exitOutline,
      statsChartOutline,
      calendarOutline,
      videocamOutline,
      cameraOutline,
      triangleOutline,
      documentTextOutline,
      peopleCircleOutline,
      clipboardOutline,
      chevronDownOutline
    });
  }

  ngOnInit(): void {
    this.modalCtrl.getTop().then(modal => modal?.dismiss());
    // this.modalCtrl.getTop().then(modal => modal?.dismiss());
    // this.initFromStorageOrApi();
      this.checkCamaras();

  }
// Nueva función para sincronizar el estado del componente con el Signal
  private syncDataWithAuth(user: any) {
    this.clientes = user.clientes || [];
    this.obras = user.obras || [];
    
    // Mantener el cliente seleccionado o tomar el activo del user
    this.clienteIdSeleccionado = Number(user.client_id);
    
    this.filtrarObrasPorCliente();
    this.restaurarOSugerirObraSeleccionada();
    this.isLoading = false;
  }
  private initFromStorageOrApi(): void {
    const userRaw = localStorage.getItem('user');

    if (!userRaw) {
      this.isLoading = false;
      return;
    }

    let user: any;

    try {
      user = JSON.parse(userRaw);
    } catch (e) {
      console.error('[OBRAS] Error parseando user', e);
      this.isLoading = false;
      return;
    }

    const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];
    const isUserRole = roles.includes('user');

    const isSuperAdmin =
      roles.includes('superadmin') ||
      roles.includes('super-admin') ||
      roles.includes('superAdmin') ||
      roles.includes('admin');

    this.clientes = Array.isArray(user?.clientes)
      ? user.clientes.map((c: any) => ({
          ...c,
          id: Number(c.id)
        }))
      : [];

    const obrasDesdeMe = Array.isArray(user?.obras) ? user.obras : [];

    if (obrasDesdeMe.length > 0) {
      this.obras = obrasDesdeMe.map((o: any) => ({
        ...o,
        id: Number(o.id),
        client_id: o.client_id ? Number(o.client_id) : null
      }));

      console.log('[OBRAS] Obras cargadas desde /me:', this.obras);

      this.initSelectors(user);
      this.isLoading = false;
      return;
    }

    if (isUserRole) {
      console.warn('[OBRAS] Usuario con rol "user" sin obras asignadas en /me');
      this.obras = [];
      this.obrasFiltradas = [];
      this.obraIdSeleccionada = null;
      this.clienteIdSeleccionado = null;
      localStorage.removeItem('obra_id');
      this.isLoading = false;
      return;
    }

    if (!isSuperAdmin) {
      console.warn('[OBRAS] Rol sin permiso para consultar obras por cliente');
      this.obras = [];
      this.obrasFiltradas = [];
      this.obraIdSeleccionada = null;
      this.clienteIdSeleccionado = null;
      localStorage.removeItem('obra_id');
      this.isLoading = false;
      return;
    }

    // Admin / superadmin sin obras en /me:
    // si hay clientes, cargamos obras del cliente seleccionado
    this.initSelectors(user, false);
    this.isLoading = false;
  }
checkCamaras() {
  const obraId = this.obraIdSeleccionada;
  if (!obraId) return;

  this.apiService.getObra(obraId).subscribe({
    next: (res: any) => {
      const obra = res?.obra ?? res?.data ?? res?.data?.obra ?? res?.obras ?? res;
      const camaras: any[] = obra?.camaras ?? [];
      const cam = camaras.find((c: any) => c.has_live && c.url)
               ?? camaras.find((c: any) => c.has_photo && (c.photo_url || c.photo_path));
      this.tieneCamaras = !!cam;
    },
    error: () => { this.tieneCamaras = false; }
  });
}
  private initSelectors(user: any, tryLoadIfNeeded: boolean = true): void {
    const clientesCount = this.clientes.length;

    if (clientesCount === 1) {
      this.clienteIdSeleccionado = this.clientes[0].id;
    } else if (clientesCount > 1) {
      const clientePreferido =
        user?.clientId ??
        user?.client_id ??
        user?.cliente_activo_id ??
        this.clientes[0]?.id ??
        null;

      this.clienteIdSeleccionado = clientePreferido ? Number(clientePreferido) : null;
    } else {
      this.clienteIdSeleccionado = null;
    }

    if (this.obras.length > 0) {
      this.filtrarObrasPorCliente();
      this.restaurarOSugerirObraSeleccionada();
      return;
    }

    if (tryLoadIfNeeded && this.clienteIdSeleccionado) {
      this.cargarObrasPorCliente(this.clienteIdSeleccionado);
    }
  }

  private filtrarObrasPorCliente(): void {
    if (!this.clienteIdSeleccionado) {
      this.obrasFiltradas = [...this.obras];
      return;
    }

    this.obrasFiltradas = (this.obras || []).filter(
      (obra) => Number(obra.client_id) === Number(this.clienteIdSeleccionado)
    );

    console.log('[OBRAS] Obras filtradas:', this.obrasFiltradas);
  }

  private restaurarOSugerirObraSeleccionada(): void {
    const savedId = localStorage.getItem('obra_id');
    let obraValida: any = null;

    if (savedId) {
      const savedIdNum = Number(savedId);
      obraValida = this.obrasFiltradas.find(o => o.id === savedIdNum) ?? null;
    }

    if (obraValida) {
      this.obraIdSeleccionada = obraValida.id;
    } else if (this.obrasFiltradas.length > 0) {
      this.obraIdSeleccionada = this.obrasFiltradas[0].id;
      localStorage.setItem('obra_id', String(this.obraIdSeleccionada));
    } else {
      this.obraIdSeleccionada = null;
      localStorage.removeItem('obra_id');
    }

    console.log('[OBRAS] Obra seleccionada:', this.obraIdSeleccionada);
  }
onClienteChange(): void {
  const user = this.authService.user();
  if (user && this.clienteIdSeleccionado) {
    // Actualizamos el Signal global
    this.authService.user.set({
      ...user,
      client_id: Number(this.clienteIdSeleccionado),
      clientId: Number(this.clienteIdSeleccionado)
    });
    
    // El 'effect' del constructor detectará esto y ejecutará filtrarObrasPorCliente()
  }
}


  onObraChange(): void {
    console.log('[OBRAS] Cambio a obra:', this.obraIdSeleccionada);

    if (this.obraIdSeleccionada) {
      localStorage.setItem('obra_id', String(this.obraIdSeleccionada));
    } else {
      localStorage.removeItem('obra_id');
    }
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  trackByCliente(index: number, item: any) {
    return item.id;
  }

  goBack() {
    this.router.navigate(['/usuario']);
  }

  async openSection(section: 'info' | 'timeline' | 'camaras' | 'fotos' | 'planos' | 'informes' | 'directorio') {
    let obraId = this.obraIdSeleccionada;

    if (!obraId && this.obrasFiltradas.length > 0) {
      obraId = Number(this.obrasFiltradas[0].id);
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

    const obra = this.obrasFiltradas.find(o => o.id === this.obraIdSeleccionada)
      ?? this.obras.find(o => o.id === this.obraIdSeleccionada);

    return obra?.name || obra?.nombre || `Obra #${this.obraIdSeleccionada}`;
  }

  async abrirSelect() {
    console.log('[OBRAS] Click en selector, intentando abrir...');
    if (this.selectObra) {
      await this.selectObra.open();
    }
  }

  private getClienteId(): number | null {
    if (this.clienteIdSeleccionado) {
      return Number(this.clienteIdSeleccionado);
    }

    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      console.error('[OBRAS] No hay user en storage');
      return null;
    }

    try {
      const user = JSON.parse(userRaw);
      const clienteId = Number(
        user.clientId ??
        user.client_id ??
        user.cliente_activo_id ??
        null
      );
      return clienteId || null;
    } catch (e) {
      console.error('[OBRAS] Error parseando user', e);
      return null;
    }
  }

  private cargarObrasPorCliente(clienteId: number, onFinish?: () => void) {
    if (!clienteId) {
      console.error('[OBRAS] No hay cliente_id válido');
      this.obras = [];
      this.obrasFiltradas = [];
      this.obraIdSeleccionada = null;
      onFinish?.();
      return;
    }

    this.loadingObras = true;

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
          client_id: o.client_id ? Number(o.client_id) : Number(clienteId)
        }));

        this.clienteIdSeleccionado = Number(clienteId);

        console.log('[OBRAS] Obras cargadas por cliente:', this.obras);

        this.filtrarObrasPorCliente();
        this.restaurarOSugerirObraSeleccionada();

        this.loadingObras = false;
        onFinish?.();
      },
      error: (err) => {
        console.error('[OBRAS] Error cargando obras por cliente:', err);
        this.obras = [];
        this.obrasFiltradas = [];
        this.obraIdSeleccionada = null;
        this.loadingObras = false;
        onFinish?.();
      }
    });
  }

  private cargarObras(onFinish?: () => void) {
    const clienteId = this.getClienteId();

    if (!clienteId) {
      console.error('[OBRAS] No hay cliente_id válido');
      onFinish?.();
      return;
    }

    this.cargarObrasPorCliente(clienteId, onFinish);
  }

  private refrescarMe(onFinish?: () => void) {
    this.apiService.me().subscribe({
      next: (me: any) => {
        localStorage.setItem('user', JSON.stringify(me));

        const roles: string[] = Array.isArray(me?.roles) ? me.roles : [];
        const isUserRole = roles.includes('user');

        this.clientes = Array.isArray(me?.clientes)
          ? me.clientes.map((c: any) => ({
              ...c,
              id: Number(c.id)
            }))
          : [];

        if (isUserRole) {
          const obrasAsignadas = Array.isArray(me?.obras) ? me.obras : [];

          this.obras = obrasAsignadas.map((o: any) => ({
            ...o,
            id: Number(o.id),
            client_id: o.client_id ? Number(o.client_id) : null
          }));

          this.initSelectors(me, false);

          console.log('[OBRAS] Refrescado desde /me:', this.obras);
          onFinish?.();
          return;
        }

        // admin/superadmin
        this.initSelectors(me, false);
        onFinish?.();
      },
      error: (err) => {
        console.error('[OBRAS] Error refrescando /me', err);
        onFinish?.();
      }
    });
  }
  

  doRefresh(event: any) {
    this.refrescarMe(() => {
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

      const clienteId = this.getClienteId();

      if (!clienteId) {
        event?.target?.complete();
        return;
      }

      this.cargarObrasPorCliente(clienteId, () => event?.target?.complete());
    });
  }
  async openCamaras() {
  let obraId = this.obraIdSeleccionada;

  if (!obraId && this.obrasFiltradas.length > 0) {
    obraId = Number(this.obrasFiltradas[0].id);
    this.obraIdSeleccionada = obraId;
    localStorage.setItem('obra_id', String(obraId));
  }

  if (!obraId) return;

  // Carga la obra con detalle (igual que el modal)
  this.apiService.getObra(obraId).subscribe({
    next: async (res: any) => {
      const obra = res?.obra ?? res?.data ?? res?.data?.obra ?? res?.obras ?? res;
      const camaras: any[] = obra?.camaras ?? [];

      if (camaras.length === 0) {
        const toast = await this.toastCtrl.create({
          message: 'No cameras are registered for this project..',
          duration: 2000,
          position: 'bottom',
          color: 'warning',        // ← amarillo
          icon: 'warning-outline' 
        });
        await toast.present();
        return;
      }

      const cam = camaras.find((c: any) => c.has_live && c.url)
                ?? camaras.find((c: any) => c.has_photo && (c.photo_url || c.photo_path));

      if (!cam) {
        const toast = await this.toastCtrl.create({
          message: 'No hay contenido disponible en las cámaras.',
          duration: 2000,
          position: 'bottom'
        });
        await toast.present();
        return;
      }

      if (cam.has_live && cam.url) {
        await Browser.open({ url: cam.url });
        return;
      }

      if (cam.has_photo) {
        const url = cam.photo_url || cam.photo_path;
        await Browser.open({ url });
      }
    },
    error: async () => {
      const toast = await this.toastCtrl.create({
        message: 'Error al cargar las cámaras.',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
    }
  });
}
}