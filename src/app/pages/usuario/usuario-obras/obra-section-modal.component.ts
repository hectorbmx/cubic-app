import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Browser } from '@capacitor/browser';
import {
  IonContent,
  IonHeader,IonIcon,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
    IonModal,

  ModalController
} from '@ionic/angular/standalone';

import { ApiService } from 'src/app/core/services/api';

type ObraSection = 'info' | 'timeline' | 'camaras' | 'fotos' | 'planos' | 'informes' | 'directorio';

@Component({
  selector: 'app-obra-section-modal',
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
  IonList,
  IonItem,
  IonLabel,
  IonModal
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
    <div *ngIf="loading" class="loading-text">Loading...</div>

    <ng-container *ngIf="!loading && obra">
      <!-- INFO GENERAL -->
<ng-container *ngIf="section === 'info'">
  <div class="section-stack">

    <!-- Card: Info -->
    <div class="card-surface info-card">
      <div class="obra-image" *ngIf="obra.cover_image">
        <img [src]="fileUrl(obra.cover_image)" alt="Obra" />
        <div class="image-overlay"></div>
      </div>

      <div class="info-list">
        <div class="info-item">
          <div class="label">Work Code</div>
          <div class="value">{{ obra.codigo ?? '—' }}</div>
        </div>

        <div class="info-item">
          <div class="label">Client</div>
          <div class="value">{{ obra.cliente?.nombre ?? '—' }}</div>
        </div>

        <div class="info-item">
          <div class="label">Description</div>
          <div class="value description">{{ obra.descripcion ?? '—' }}</div>
        </div>

        <div class="info-item">
          <div class="label">Address</div>
          <div class="value">{{ obra.direccion ?? '—' }}</div>
        </div>

        <div class="info-item">
          <div class="label">Budget</div>
          <div class="value">{{ formatMoney(obra.presupuesto, obra.moneda ?? 'MXN') }}</div>
        </div>
      </div>
    </div>

    <!-- Card: Personas -->
    <div class="card-surface info-card">
      <!-- Título de la sección -->
      <div class="section-header">
        <h3 class="section-title">TEAM</h3>
      </div>

      <div class="info-list">
        <ng-container *ngIf="(obra?.personas?.length ?? 0) > 0; else noPersonas">
          <div class="info-item person-item" *ngFor="let p of obra.personas; let i = index">
            <div class="person-content">
              <div class="label"> {{ p.rol }}</div>
              <div class="value">{{ p.nombre ?? p.role ?? p.puesto ?? 'Sin rol asignado' }}</div>
            </div>
            <div class="person-actions">
              <a
                class="action-btn"
                *ngIf="p.celular || p.telefono || p.phone"
                [href]="'tel:' + (p.celular ?? p.telefono ?? p.phone)"
              >
                <ion-icon name="call-outline"></ion-icon>
              </a>
              <a
                class="action-btn"
                *ngIf="p.email"
                [href]="'mailto:' + p.email"
              >
                <ion-icon name="mail-outline"></ion-icon>
              </a>
            </div>
          </div>
        </ng-container>

        <ng-template #noPersonas>
          <div class="info-item">
            <div class="label">People</div>
            <div class="value">No registered users</div>
          </div>
        </ng-template>
      </div>
    </div>

  </div>
</ng-container>

<!-- TIMELINE -->
<ng-container *ngIf="section === 'timeline'">
  <div class="timeline-wrap" *ngIf="(obra?.detalles?.length ?? 0) > 0; else noTimeline">

    <div class="timeline-list">
      <div class="tl-row" *ngFor="let d of obra.detalles; let last = last">
        <div class="tl-rail" [class.tl-rail-last]="last"></div>

        <div class="tl-body">
          <div class="tl-main-row">
            <div class="tl-h-main">{{ d.titulo ?? 'Evento' }}</div>
            <div class="tl-progress-badge" *ngIf="d.progress_pct != null || d.progress != null">
              {{ d.progress_pct ?? d.progress }}%
            </div>
          </div>

          <div class="tl-type" *ngIf="d.type">
            {{ d.type }}
          </div>

          <div class="tl-date">
            {{ formatDateOnly(d.fecha) }}
          </div>

          <div class="tl-desc" *ngIf="d.descripcion">
            {{ d.descripcion }}
          </div>
        </div>
      </div>
    </div>
<div class="progress-footer" *ngIf="obra?.progreso != null">

  <!-- TÍTULO -->
  <div class="progress-title">
    General Progress
  </div>

  <!-- PORCENTAJE -->
  <div class="progress-number">{{ obra.progreso ?? 0 }}%</div>

  <!-- BARRA -->
  <div class="progress-bar">
    <div class="progress-fill" [style.width.%]="obra.progreso ?? 0"></div>
  </div>

</div>

  </div>

  <ng-template #noTimeline>
    <div class="empty-state">No events registered.</div>
  </ng-template>
</ng-container>

<!-- CAMARAS -->
<ng-container *ngIf="section === 'camaras'">

  <div class="camaras-grid" *ngIf="(obra?.camaras?.length ?? 0) > 0; else noCamaras">

    <div class="camara-card" *ngFor="let cam of obra.camaras">

      <!-- PREVIEW FOTO -->
      <div
        class="camara-preview camara-photo-preview"
        *ngIf="cam.has_photo && (cam.photo_url || cam.photo_path)"
        (click)="openPhotoPreview(cam)"
      >
        <img
            [src]="fileUrl(cam.photo_url || cam.photo_path)"
            [alt]="cam.nombre ?? 'Foto de cámara'"
            loading="lazy"
          />
      </div>

      <!-- PREVIEW LIVE -->
      <div
        class="camara-preview live-preview"
        *ngIf="cam.has_live && cam.url"
        (click)="openLiveCamera(cam)"
      >
        <div class="live-placeholder">
          <ion-icon name="videocam-outline"></ion-icon>
          <span>Ver cámara en vivo</span>
        </div>
      </div>

      <div class="camara-info">
        <div class="camara-name">{{ cam.nombre ?? 'Cámara' }}</div>

        <div class="camara-location">
          {{ cam.ubicacion ?? 'Location not defined' }}
        </div>

        <div class="camara-meta" *ngIf="cam.photo_taken_at">
          Foto: {{ cam.photo_taken_at | date:'dd/MM/yyyy HH:mm' }}
        </div>

        <div class="camara-meta" *ngIf="cam.photo_notes">
          {{ cam.photo_notes }}
        </div>

        <div class="camara-status" [class.on]="cam.activa">
          {{ cam.activa ? 'Active' : 'Inactiva' }}
        </div>

        <div class="camara-actions">
          <ion-button
            size="small"
            fill="solid"
            *ngIf="cam.has_live"
            (click)="openLiveCamera(cam)"
          >
            <ion-icon name="videocam-outline" slot="start"></ion-icon>
            Live
          </ion-button>

          <ion-button
            size="small"
            fill="outline"
            *ngIf="cam.has_photo"
            (click)="openPhotoPreview(cam)"
          >
            <ion-icon name="image-outline" slot="start"></ion-icon>
            Foto
          </ion-button>
        </div>
      </div>
    </div>

  </div>

  <ng-template #noCamaras>
    <div class="empty-state">
      No registered cameras.
      No cameras are registered for this project.
    </div>
  </ng-template>

</ng-container>

<!-- MODAL FOTO -->
<ion-modal [isOpen]="isPhotoModalOpen" (didDismiss)="closePhotoPreview()">
  <ng-template>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ selectedCameraTitle || 'Foto' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closePhotoPreview()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding photo-modal-content">
      <img
        *ngIf="selectedPhotoUrl"
        [src]="selectedPhotoUrl"
        [alt]="selectedCameraTitle || 'Foto'"
        class="full-photo"
      />

      <div class="photo-extra" *ngIf="selectedPhotoTakenAt || selectedPhotoNotes">
        <div *ngIf="selectedPhotoTakenAt">
          <strong>Fecha:</strong> {{ selectedPhotoTakenAt | date:'dd/MM/yyyy HH:mm' }}
        </div>

        <div *ngIf="selectedPhotoNotes">
          <strong>Notas:</strong> {{ selectedPhotoNotes }}
        </div>
      </div>
    </ion-content>
  </ng-template>
</ion-modal>
<!-- FOTOS -->
<ng-container *ngIf="section === 'fotos'">

  <div class="photos-grid" *ngIf="(obra?.fotos?.length ?? 0) > 0; else noFotos">
    <button class="photo-tile" type="button" *ngFor="let f of obra.fotos" (click)="openPhoto(f)">
      <img
        [src]="fileUrl(f.thumbnail ?? f.url)"
        alt="Foto"
        loading="lazy"
        class="img-small"
      />
    </button>
  </div>

  <ng-template #noFotos>
    <div class="empty-state">There are no photos registered for this site.</div>
  </ng-template>

  <!-- Preview -->
  <div class="photo-preview" *ngIf="photoOpen" (click)="closePhoto()">
    <div class="photo-preview-card" (click)="$event.stopPropagation()">
      <img [src]="fileUrl(photoOpen.url)" alt="Foto" />

      <div class="photo-meta">
        <div class="photo-desc">{{ photoOpen.descripcion ?? 'Sin descripción' }}</div>
        <div class="photo-date">{{ photoOpen.fecha ?? '—' }}</div>
      </div>

      <button class="photo-close" type="button" (click)="closePhoto()">Close</button>
    </div>
  </div>
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
        Show
      </button>
    </div>
  </div>

  <ng-template #noPlanos>
    <div class="empty-state">No drawings are registered for this project.</div>
  </ng-template>

</ng-container>

<!-- INFORMES -->
<ng-container *ngIf="section === 'informes'">

  <div class="informes-wrap" *ngIf="(obra?.informes?.length ?? 0) > 0; else noInformes">
    
    <div class="informes-list">
      <div class="inf-row" *ngFor="let i of obra.informes; let last = last">
        <!-- rail (línea vertical por item) -->
        <div class="inf-rail" [class.inf-rail-last]="last"></div>

        <!-- contenido -->
        <div class="inf-body">
          <div class="inf-content">
            <div class="inf-h-title">
              <span class="inf-h-main">{{ i.titulo ?? ('Informe semana ' + (i.semana ?? '—')) }}</span>
            </div>

            <div class="inf-date">
              <span *ngIf="i.semana != null">Semana {{ i.semana }}</span>
              <span *ngIf="i.fecha_inicio || i.fecha_fin">
                <ng-container *ngIf="i.semana != null"> · </ng-container>
                {{ i.fecha_inicio ?? '—' }} <span *ngIf="i.fecha_fin">→ {{ i.fecha_fin }}</span>
              </span>
            </div>

            <div class="inf-desc" *ngIf="i.resumen">
              {{ i.resumen }}
            </div>
          </div>

          <button
            class="inf-btn"
            type="button"
            (click)="openExternal(fileUrl(i.archivo_path))">
            Show
          </button>
        </div>
      </div>
    </div>

  </div>

  <ng-template #noInformes>
    <div class="empty-state">No reports are registered for this project.</div>
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
.persona-actions {
      display: flex;
      align-items: center;
      gap: 14px; /* separación entre íconos */
    }

    .persona-actions .action {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      background: rgba(255, 193, 7, 0.12);
      border: 1px solid rgba(255, 193, 7, 0.35);

      color: #FFC107;
      text-decoration: none;

      transition: all 0.2s ease;
    }

    .persona-actions .action ion-icon {
      font-size: 18px;
      color: #FFC107;
    }

    .persona-actions .action:active {
      transform: scale(0.92);
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
      color: #f3ef01;
      font-size: 16px;
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
  .progress-title {
  font-size: 14px;
  font-weight: 600;
  color: #c4c400; // gris claro elegante (no blanco puro)
  text-align: center;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: 0.9;
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
.img-small {
  width: 150px;   /* o el tamaño que quieras */
  height: auto;   /* mantiene la proporción */
}
.photos-grid {
    display: grid;
    /* Esto crea columnas de mínimo 150px que se ajustan solas */
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); 
    gap: 12px;
    padding: 16px;
}

.photo-tile {
    width: 100%;
    aspect-ratio: 1 / 1; /* Esto obliga a que el contenedor sea siempre cuadrado */
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: #f0f0f0; /* Fondo por si la imagen tarda en cargar */
    padding: 0;
}

.photo-tile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center; /* Prueba también: top, bottom, left, right */
    display: block;
}
    @media (max-width: 1024px) {
    .photo-tile img {
        object-fit: contain;
        background: #2a3f5f; /* Fondo que combine con tu diseño */
    }
}
    /* Para el tile de renders específicamente */
.photo-tile.render-tile {
    aspect-ratio: auto; /* Permite que tome su altura natural */
}

.photo-tile.render-tile img {
    object-fit: contain; /* Muestra la imagen completa sin cortar */
    height: auto;
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

.timeline-wrap {
  padding: 10px 14px 16px;
}

.timeline-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 10px 0 14px;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;

  ion-icon {
    font-size: 18px;
  }

  span {
    font-size: 14px;
    opacity: 0.95;
  }
}

.tl-row {
  display: flex;
  gap: 16px;
  position: relative;
  margin-bottom: 20px;
}

/* El riel (línea amarilla lateral) */
.tl-rail {
  width: 4px;
  background: #ffc400; /* Color amarillo del diseño */
  border-radius: 2px;
  flex-shrink: 0;
  margin-bottom: -20px; /* Para que conecte visualmente con el siguiente */
}

.tl-rail-last {
  height: 30px; /* El último riel no se extiende */
  margin-bottom: 0;
}

/* Cuerpo del contenido */
.tl-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ESTA ES LA CLAVE: Distribuye Título y Porcentaje */
.tl-main-row {
  display: flex;
  justify-content: space-between; 
  align-items: flex-start;
}

.tl-h-main {
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  text-transform: uppercase;
}

.tl-progress-badge {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff; /* O el color que prefieras para el % */
}

/* Estilo para el tipo y la fecha abajo */
.tl-type {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 2px;
}

.tl-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5); /* Color grisáceo para la fecha */
  margin-top: 2px;
}
.tl-progress {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 800;
  color: #f5c400;
}

/* Footer con % + barra final */
.progress-footer {
  margin-top: 14px;
  display: grid;
  gap: 10px;
  justify-items: center;
}

.progress-number {
  color: #f5c400;
  font-size: 18px;
  font-weight: 800;
}

.progress-bar {
  width: 88%;
  height: 18px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: #ffffff;
  width: 0%;
}
/* Título de sección */
.section-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
  .section-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center; /* Centra el contenido */
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #FDC100;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  align:center;
}
  /* Espacio entre cards */
.section-stack {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Espacio entre las tarjetas */
}

/* O si prefieres usar margin */
.card-surface.info-card {
  margin-bottom: 20px;
}

.card-surface.info-card:last-child {
  margin-bottom: 0; /* Elimina el margen del último elemento */
}

/* Item de persona con iconos a la derecha */
.person-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.person-content {
  flex: 1;
  min-width: 0; /* Permite truncamiento si es necesario */
}

.person-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0; /* Evita que los iconos se compriman */
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #FDC100;
  text-decoration: none;
  transition: all 0.2s;
}

.action-btn:hover,
.action-btn:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}


/* =========================
   INFORMES
========================= */
// =============================
// INFORMES (estilo timeline)
// =============================
.informes-wrap {
  padding: 16px;
}

.informes-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.inf-row {
  position: relative;
  display: flex;
  gap: 12px;
  padding-bottom: 24px;

  &:last-child {
    padding-bottom: 0;
  }
}

// Rail (línea vertical amarilla)
.inf-rail {
  width: 4px;
  background: #f4b942;
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 4px;

  &.inf-rail-last {
    height: 40px;
  }
}

// Contenido del informe
.inf-body {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.inf-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inf-h-title {
  .inf-h-main {
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.3;
    text-transform: uppercase;
  }
}

.inf-date {
  color: #a0aec0;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
}

.inf-desc {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  margin-top: 4px;
}

.inf-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #f4b942;
  color: #f4b942;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-start;

  &:hover {
    background: rgba(244, 185, 66, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }
}

.empty-state {
  color: #a0aec0;
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
}
.action-btn ion-icon {
  font-size: 20px;
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
      info: 'GENERAL INFO',
      timeline: 'TIMELINE',
      camaras: 'CAMERAS',
      fotos: 'PHOTOS',
      planos: 'DRAWINGS',
      informes: 'REPORTS',
      directorio: 'DIRECTORY'
    };
    return map[this.section] ?? 'Detalle';
  }

  constructor(
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private sanitizer: DomSanitizer
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
getSafeUrl(url: string): SafeResourceUrl {
  let finalUrl = url;
  
  // Si detectamos que empieza con <iframe, extraemos solo el contenido de src=""
  if (url && url.includes('<iframe')) {
    const match = url.match(/src=["']([^"']+)["']/);
    if (match && match[1]) {
      finalUrl = match[1];
    }
  }
  
  return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
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
isPhotoModalOpen = false;
selectedPhotoUrl: string | null = null;
selectedCameraTitle: string | null = null;
selectedPhotoTakenAt: string | null = null;
selectedPhotoNotes: string | null = null;

openPhotoPreview(cam: any): void {
  const photo = cam?.photo_url || cam?.photo_path || null;
  if (!photo) return;

  this.selectedPhotoUrl = this.fileUrl(photo);
  this.selectedCameraTitle = cam.nombre || 'Foto';
  this.selectedPhotoTakenAt = cam.photo_taken_at || null;
  this.selectedPhotoNotes = cam.photo_notes || null;
  this.isPhotoModalOpen = true;
}

closePhotoPreview(): void {
  this.isPhotoModalOpen = false;
  this.selectedPhotoUrl = null;
  this.selectedCameraTitle = null;
  this.selectedPhotoTakenAt = null;
  this.selectedPhotoNotes = null;
}

async openLiveCamera(cam: any): Promise<void> {
  if (!cam?.url) return;

  try {
    await Browser.open({
      url: cam.url
    });
  } catch (error) {
    console.error('Error abriendo cámara en vivo:', error);
  }
}
closePhoto() {
  this.photoOpen = null;
}
// fileUrl(path: string) {
//   if (!path) return '';
//   if (path.startsWith('http')) return path;

//   // environment.apiUrl = http://127.0.0.1:8000/api/v1
//   const apiUrl = this.getApiBaseUrl();
//   return `${apiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
// }
fileUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  const base = this.getApiBaseUrl(); // https://tudominio.com (sin /api/v1)

  // Normaliza slashes
  const p = path.trim();

  // Caso A: ya viene como /storage/...
  if (p.startsWith('/storage/')) return `${base}${p}`;

  // Caso B: ya viene como storage/...
  if (p.startsWith('storage/')) return `${base}/${p}`;

  // Caso C: viene como obras/8/cover/... (legacy) => public storage
  const clean = p.replace(/^\/+/, '');
  return `${base}/storage/${clean}`;
}

formatDateOnly(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString.replace(' ', 'T'));

  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
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
get lastProgress(): number | null {
  const detalles = this.obra?.detalles ?? [];
  for (let i = detalles.length - 1; i >= 0; i--) {
    const p = detalles[i]?.progress;
    if (p !== null && p !== undefined && p !== '') {
      const n = Number(p);
      if (!Number.isNaN(n)) return Math.max(0, Math.min(100, n));
    }
  }
  return null;
}


}