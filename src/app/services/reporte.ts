import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { EquipoComplicado, SolucionadasPorDia } from '../model/reporte';

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


  // HU11: GET /reportes/solucionadas-por-dia?desde=yyyy-MM-dd&hasta=yyyy-MM-dd
  solucionadasPorDia(desde: string, hasta: string): Observable<SolucionadasPorDia[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<SolucionadasPorDia[]>(`${this.url}/solucionadas-por-dia`, { params });
  }
}