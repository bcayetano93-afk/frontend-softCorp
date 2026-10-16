import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Incidencia, IncidenciaRequest, TecnicoDisponibilidad } from '../model/incidencia';

// Peticiones al backend sobre incidencias.
// El token se agrega solo gracias al authInterceptor.
@Injectable({ providedIn: 'root' })
export class IncidenciaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/v1`;

  listar(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(`${this.url}/incidencias`);
  }

  registrar(incidencia: IncidenciaRequest): Observable<Incidencia> {
    return this.http.post<Incidencia>(`${this.url}/incidencias`, incidencia);
  }

  asignar(idIncidencia: number, idTecnico: number): Observable<Incidencia> {
    return this.http.put<Incidencia>(`${this.url}/incidencias/${idIncidencia}/asignar`, { idTecnico });
  }

  disponibilidadTecnicos(): Observable<TecnicoDisponibilidad[]> {
    return this.http.get<TecnicoDisponibilidad[]>(`${this.url}/tecnicos/disponibilidad`);
  }
}
