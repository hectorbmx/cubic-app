import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {

  constructor() { }

  /**
   * Abre un archivo (PDF, imagen, etc) en el navegador
   */
  async openFile(url: string, fileName?: string) {
    try {
      // Si la URL es relativa, no la abras
      if (!url.startsWith('http')) {
        console.error('URL inválida:', url);
        throw new Error('URL inválida');
      }

      // En web, abre en nueva pestaña
      if (Capacitor.getPlatform() === 'web') {
        window.open(url, '_blank');
      } else {
        // En móvil, usa Capacitor Browser
        await Browser.open({ url });
      }
    } catch (error) {
      console.error('Error al abrir archivo:', error);
      throw error;
    }
  }

  /**
   * Descarga un archivo
   */
  async downloadFile(url: string, fileName: string) {
    try {
      if (!url.startsWith('http')) {
        throw new Error('URL inválida');
      }

      // En web, crea un link temporal y simula click
      if (Capacitor.getPlatform() === 'web') {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // En móvil, abre en el navegador (el usuario puede descargar desde ahí)
        await Browser.open({ url });
      }
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw error;
    }
  }
}