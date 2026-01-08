import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  ModalController
} from '@ionic/angular/standalone';

import { ApiService } from 'src/app/core/services/api';

type ObraSection = 'info' | 'timeline' | 'camaras' | 'fotos' | 'planos' | 'informes';

@Component({
  selector: 'app-obra-section-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent,
    IonList, IonItem, IonLabel
  ],
  template: `
  <ion-header class="custom-header">
    <ion-toolbar class="custom-toolbar">
      <ion-buttons slot="start">
        <ion-button (click)="close()" class="back-button">
          <span>← Back</span>
        </ion-button>
      </ion-buttons>

      <ion-title class="custom-title">{{ headerTitle }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="custom-content">
    <div *ngIf="loading" class="loading-text">Cargando...</div>

    <ng-container *ngIf="!loading && obra">
      <!-- INFO GENERAL -->
      <ng-container *ngIf="section === 'info'">
        <div class="info-card">
          <!-- Imagen de obra (opcional) -->
          <div class="obra-image" *ngIf="obra.imagen">
            <img [src]="obra.imagen" alt="Obra">
            <div class="image-overlay">
              <ion-label class="overlay-text">información general</ion-label>
            </div>
          </div>

          <!-- Lista de información -->
          <div class="info-list">
            <div class="info-item">
              <div class="label">Código</div>
              <div class="value">{{ obra.codigo ?? '—' }}</div>
            </div>

            <div class="info-item">
              <div class="label">Cliente</div>
              <div class="value">{{ obra.cliente?.nombre ?? '—' }}</div>
            </div>

            <div class="info-item">
              <div class="label">Descripción</div>
              <div class="value description">{{ obra.descripcion ?? '—' }}</div>
            </div>

            <div class="info-item">
              <div class="label">Dirección</div>
              <div class="value">{{ obra.direccion ?? '—' }}</div>
            </div>

            <div class="info-item">
              <div class="label">Presupuesto</div>
              <div class="value">{{ formatMoney(obra.presupuesto, obra.moneda ?? 'MXN') }}</div>
            </div>
          </div>
        </div>
      </ng-container>

    <!-- TIMELINE -->
<ng-container *ngIf="section === 'timeline'">
  <div class="timeline-card" *ngIf="(obra?.detalles?.length ?? 0) > 0; else noTimeline">
    <div class="tl-item" *ngFor="let d of obra.detalles">
      <div class="tl-dot"></div>

      <div class="tl-content">
        <div class="tl-title">{{ d.titulo ?? 'Evento' }}</div>
        <div class="tl-date">{{ formatDate(d.fecha) }}</div>

        <div class="tl-desc" *ngIf="d.descripcion">
          {{ d.descripcion }}
        </div>
      </div>
    </div>
  </div>

  <ng-template #noTimeline>
    <div class="empty-state">Sin eventos registrados.</div>
  </ng-template>
</ng-container>

<ng-container *ngIf="section === 'camaras'">

  <div class="camaras-grid" *ngIf="(obra?.camaras?.length ?? 0) > 0; else noCamaras">

    <div class="camara-card" *ngFor="let cam of obra.camaras">
      <div class="camara-preview">
        <!-- Snapshot / placeholder -->
        <img
          [src]="cam.url ?? 'assets/mock/camera-placeholder.jpg'"
          alt="Cámara"
        />
      </div>

      <div class="camara-info">
        <div class="camara-name">{{ cam.nombre ?? 'Cámara' }}</div>
        <div class="camara-location">
          {{ cam.ubicacion ?? 'Ubicación no definida' }}
        </div>

        <div class="camara-status" [class.on]="cam.activa">
          {{ cam.activa ? 'Activa' : 'Inactiva' }}
        </div>
      </div>
    </div>

  </div>

  <ng-template #noCamaras>
    <div class="empty-state">
      No hay cámaras registradas para esta obra.
    </div>
  </ng-template>

</ng-container>
<ng-container *ngIf="section === 'fotos'">

  <div class="photos-grid" *ngIf="(obra?.fotos?.length ?? 0) > 0; else noFotos">
    <button class="photo-tile" type="button" *ngFor="let f of obra.fotos" (click)="openPhoto(f)">
      <img
        [src]="fileUrl(f.thumbnail ?? f.url)"
        alt="Foto"
        loading="lazy"
      />
    </button>
  </div>

  <ng-template #noFotos>
    <div class="empty-state">No hay fotos registradas para esta obra.</div>
  </ng-template>

  <!-- Preview -->
  <div class="photo-preview" *ngIf="photoOpen" (click)="closePhoto()">
    <div class="photo-preview-card" (click)="$event.stopPropagation()">
      <img [src]="fileUrl(photoOpen.url)" alt="Foto" />

      <div class="photo-meta">
        <div class="photo-desc">{{ photoOpen.descripcion ?? 'Sin descripción' }}</div>
        <div class="photo-date">{{ photoOpen.fecha ?? '—' }}</div>
      </div>

      <button class="photo-close" type="button" (click)="closePhoto()">Cerrar</button>
    </div>
  </div>
  <ng-template #noFotos>
    <div class="empty-state">
      No hay fotos registradas para esta obra.
    </div>
  </ng-template>


</ng-container>
<!-- PLANOS -->
<ng-container *ngIf="section === 'planos'">

  <div class="planos-wrap" *ngIf="(obra?.planos?.length ?? 0) > 0; else noPlanos">
    <div class="plano-card" *ngFor="let p of obra.planos">
      <div class="plano-left">
        <div class="plano-title">
          {{ p.titulo ?? p.nombre ?? ('Plano #' + p.id) }}
        </div>

        <div class="plano-meta">
          <span>{{ p.fecha ?? '—' }}</span>
          <span *ngIf="p.tipo"> · {{ p.tipo }}</span>
        </div>

        <div class="plano-desc" *ngIf="p.descripcion">
          {{ p.descripcion }}
        </div>
      </div>

      <button
        class="plano-btn"
        type="button"
        (click)="openExternal(fileUrl(p.url ?? p.archivo ?? p.path))">
        Ver
      </button>
    </div>
  </div>

  <ng-template #noPlanos>
    <div class="empty-state">No hay planos registrados para esta obra.</div>
  </ng-template>

</ng-container>


<!-- OTRAS SECCIONES -->


  `,
  styles: [`
    /* Header personalizado */
    .custom-header {
      --background: #1a2332;
    }

    .custom-toolbar {
      --background: #1a2332;
      --color: #ffffff;
      --border-width: 0;
    }

    .custom-title {
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .back-button {
      --color: #d4af37;
      font-size: 14px;
    }

    .back-button span {
      color: #d4af37;
    }

    /* Content */
    .custom-content {
      --background: #1a2332;
      --padding-top: 20px;
      --padding-bottom: 20px;
      --padding-start: 16px;
      --padding-end: 16px;
    }

    /* Tarjeta de información */
    .info-card {
      background: #0a0f1a;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    /* Imagen de obra */
    .obra-image {
      position: relative;
      width: 100%;
      height: 180px;
      overflow: hidden;
    }

    .obra-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
      padding: 20px 16px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .overlay-text {
      color: #ffffff;
      font-size: 14px;
      font-weight: 400;
      text-align: center;
      letter-spacing: 0.5px;
    }

    /* Lista de información */
    .info-list {
      padding: 24px 20px;
    }

    .info-item {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .info-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .info-item .label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      font-weight: 400;
      margin-bottom: 6px;
      text-transform: capitalize;
    }

    .info-item .value {
      color: #ffffff;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;
    }

    .info-item .value.description {
      font-weight: 400;
      line-height: 1.5;
    }
      .timeline-card {
  background: #0b1a2c;
  border-radius: 16px;
  margin: 16px;
  padding: 14px 16px;
}

.tl-item {
  display: grid;
  grid-template-columns: 14px 1fr;
  gap: 12px;
  padding: 12px 0;
  position: relative;
}

.tl-item:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.tl-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #FFC107;
  margin-top: 4px;
}

.tl-content {
  display: flex;
  flex-direction: column;
}

.tl-title {
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.tl-date {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.tl-desc {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
}

.empty-state {
  margin: 16px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.75);
}
/* =========================
   CAMARAS
========================= */

.camaras-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin: 16px;
}

.camara-card {
  background: #0b1a2c;
  border-radius: 16px;
  overflow: hidden;
}

.camara-preview {
  height: 160px;
  background: #000;
}

.camara-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
}

.camara-info {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.camara-name {
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.camara-location {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.camara-status {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #e74c3c;
}

.camara-status.on {
  color: #2ecc71;
}
/* =========================
   FOTOS
========================= */

.photos-grid {
  margin: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.photo-tile {
  border: none;
  padding: 0;
  background: transparent;
  border-radius: 14px;
  overflow: hidden;
  height: 140px;
}

.photo-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: brightness(0.9);
}

/* Preview overlay */
.photo-preview {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 9999;
}

.photo-preview-card {
  width: 100%;
  max-width: 420px;
  background: #0b1a2c;
  border-radius: 16px;
  overflow: hidden;
}

.photo-preview-card img {
  width: 100%;
  height: 320px;
  object-fit: cover;
  display: block;
}

.photo-meta {
  padding: 12px 14px;
}

.photo-desc {
  color: white;
  font-weight: 700;
  font-size: 14px;
}

.photo-date {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.photo-close {
  width: 100%;
  border: none;
  padding: 12px 14px;
  background: rgba(255, 193, 7, 0.12);
  color: #FFC107;
  font-weight: 800;
}
/* PLANOS */
.planos-wrap {
  margin: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plano-card {
  background: #0b1a2c;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.plano-left {
  min-width: 0;
}

.plano-title {
  color: white;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plano-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.plano-desc {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.plano-btn {
  border: none;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 193, 7, 0.12);
  color: #FFC107;
  font-weight: 800;
  white-space: nowrap;
}


    /* Estados de carga y error */
    .loading-text,
    .error-text,
    .placeholder-text {
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      padding: 40px 20px;
      font-size: 14px;
    }

    /* Responsive */
    @media (min-width: 768px) {
      .info-card {
        max-width: 600px;
        margin: 0 auto;
      }
    }
  `]
})
export class ObraSectionModalComponent implements OnInit {
  @Input() obraId!: number;
  @Input() section!: ObraSection;

  loading = true;
  obra: any = null;

  get headerTitle(): string {
    const map: Record<ObraSection, string> = {
      info: 'Información general',
      timeline: 'Time line',
      camaras: 'Cámaras',
      fotos: 'Fotografías',
      planos: 'Planos',
      informes: 'Informes',
    };
    return map[this.section] ?? 'Detalle';
  }

  constructor(
    private modalCtrl: ModalController,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.apiService.getObra(this.obraId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          // Soporta varios formatos comunes del backend
          const obra =
            res?.obra ??
            res?.data ??
            res?.data?.obra ??
            res?.obras ??
            res;

          this.obra = obra;
          console.log('[MODAL] obra cargada:', this.obra);
        },
        error: (err) => {
          console.error('[MODAL] Error cargando obra', err);
          this.obra = null;
        }
      });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  formatMoney(value: any, currency: string) {
    const n = Number(value ?? 0);
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(n);
  }
  formatDate(value: any) {
  if (!value) return '—';
  const d = new Date(value);
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}
photoOpen: any = null;

openPhoto(f: any) {
  this.photoOpen = f;
}

closePhoto() {
  this.photoOpen = null;
}
fileUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  // environment.apiUrl = http://127.0.0.1:8000/api/v1
  const apiUrl = this.getApiBaseUrl();
  return `${apiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

private getApiBaseUrl(): string {
  // Quitamos /api/v1 del final
  return (this.apiService as any)
    ? this.apiService['apiUrl'].replace(/\/api\/v1\/?$/, '')
    : '';
}
openExternal(url: string) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

}