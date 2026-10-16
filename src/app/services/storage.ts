import { Injectable } from '@angular/core';

// Guarda y lee datos en el localStorage del navegador
// (se mantienen aunque se cierre el navegador)
@Injectable({ providedIn: 'root' })
export class StorageService {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
