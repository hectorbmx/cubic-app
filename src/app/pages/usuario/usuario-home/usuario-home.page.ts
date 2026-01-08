import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonIcon } from '@ionic/angular/standalone';
import { ApiService } from 'src/app/core/services/api';
import { addIcons } from 'ionicons';
import { callOutline, mailOutline } from 'ionicons/icons';

@Component({
  selector: 'app-usuario-home',
  templateUrl: './usuario-home.page.html',
  styleUrls: ['./usuario-home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonIcon]
})
export class UsuarioHomePage implements OnInit {

  loading = true;

  obraId: number | null = null;
  obra: any = null;

  // Lo que necesitamos para el directorio
  personas: any[] = [];
  private lastObraId: string | null = null;

  constructor(private apiService: ApiService) {
     addIcons({
    callOutline,
    mailOutline
  });
  }

   ngOnInit() {
    // Web: si cambias obra_id en otra pestaña, recarga aquí
    window.addEventListener('storage', (e) => {
      if (e.key === 'obra_id') {
        this.loadDirectorio();
      }
    });

    // Carga inicial
    this.loadDirectorio();
  }

  ionViewWillEnter() {
    // Ionic tabs: cada vez que entras a Directorio
    // (si obra_id cambió mientras estabas en Obras, aquí lo detectas)
    this.loadDirectorio();
  }

  private loadDirectorio() {
    const savedObraId = localStorage.getItem('obra_id');

    // Evita llamadas duplicadas si no cambió
    if (savedObraId && this.lastObraId === savedObraId && this.personas.length) {
      return;
    }
    this.lastObraId = savedObraId;

    this.obraId = savedObraId ? Number(savedObraId) : null;

    if (!this.obraId) {
      this.loading = false;
      this.obra = null;
      this.personas = [];
      return;
    }

    this.loading = true;

    this.apiService.getObra(this.obraId).subscribe({
      next: (res: any) => {
        const obra = res?.obra ?? res?.data ?? res?.data?.obra ?? res;
        this.obra = obra;
        this.personas = Array.isArray(obra?.personas) ? obra.personas : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('[HOME] Error cargando directorio', err);
        this.loading = false;
        this.obra = null;
        this.personas = [];
      }
    });
  }

}
