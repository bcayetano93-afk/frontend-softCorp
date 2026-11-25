import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { HistorialEquipo } from '../model/historial';

// HU12: historial de equipos
@Injectable({ providedIn: 'root' })
export class HistorialService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/v1/equipos`;

  // GET /api/v1/equipos/{codigo}/historial
  historial(codigoEquipo: string): Observable<HistorialEquipo> {
    // encodeURIComponent: el código va dentro de la URL
    return this.http.get<HistorialEquipo>(`${this.url}/${encodeURIComponent(codigoEquipo)}/historial`);
  }
}