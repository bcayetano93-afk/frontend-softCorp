import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { EquipoComplicado } from '../model/reporte';

// Reportes del jefe del área (sprint 4)
@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/v1/reportes`;

  // HU10: GET /reportes/equipos-complicados?situacion=...&idTecnico=...
  // Solo se agregan los parámetros que tienen valor
  equiposComplicados(situacion: string, idTecnico: number | null): Observable<EquipoComplicado[]> {
    let params = new HttpParams();
    if (situacion !== 'TODOS') params = params.set('situacion', situacion);
    if (idTecnico) params = params.set('idTecnico', idTecnico);
    return this.http.get<EquipoComplicado[]>(`${this.url}/equipos-complicados`, { params });
  }
}