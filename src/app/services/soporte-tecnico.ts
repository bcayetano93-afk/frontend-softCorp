import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  DiccionarioFallaRequest,
  FallaDiccionario,
  InformeTecnico,
  InformeTecnicoRequest,
  SolicitudRepuesto,
  SolicitudRepuestoRequest,
} from '../model/incidencia';

// Peticiones HTTP al backend para repuestos, informes técnicos y diccionario de fallas.
@Injectable({ providedIn: 'root' })
export class SoporteTecnicoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/v1`;

  // HU07: repuestos (listar por filtro, crear solicitud y actualizar estado)
  listarRepuestos(estado?: string, idIncidencia?: number): Observable<SolicitudRepuesto[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    if (idIncidencia !== undefined) {
      params = params.set('idIncidencia', String(idIncidencia));
    }
    return this.http.get<SolicitudRepuesto[]>(`${this.url}/repuestos`, { params });
  }

  solicitarRepuesto(request: SolicitudRepuestoRequest): Observable<SolicitudRepuesto> {
    return this.http.post<SolicitudRepuesto>(`${this.url}/repuestos`, request);
  }

  cambiarEstadoRepuesto(
    idSolicitud: number,
    estado: 'RECIBIDO' | 'RECHAZADO',
  ): Observable<SolicitudRepuesto> {
    return this.http.put<SolicitudRepuesto>(`${this.url}/repuestos/${idSolicitud}/estado`, { estado });
  }

  // HU08: informes técnicos
  listarInformes(): Observable<InformeTecnico[]> {
    return this.http.get<InformeTecnico[]>(`${this.url}/informes-tecnicos`);
  }

  registrarInformeTecnico(request: InformeTecnicoRequest): Observable<InformeTecnico> {
    return this.http.post<InformeTecnico>(`${this.url}/informes-tecnicos`, request);
  }

  // HU09: diccionario de fallas (búsqueda y CRUD)
  buscarFallas(keyword?: string, categoria?: string): Observable<FallaDiccionario[]> {
    let params = new HttpParams();
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (categoria) {
      params = params.set('categoria', categoria);
    }
    return this.http.get<FallaDiccionario[]>(`${this.url}/diccionario-fallas`, { params });
  }

  crearFalla(request: DiccionarioFallaRequest): Observable<FallaDiccionario> {
    return this.http.post<FallaDiccionario>(`${this.url}/diccionario-fallas`, request);
  }

  actualizarFalla(idFalla: number, request: DiccionarioFallaRequest): Observable<FallaDiccionario> {
    return this.http.put<FallaDiccionario>(`${this.url}/diccionario-fallas/${idFalla}`, request);
  }

  eliminarFalla(idFalla: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/diccionario-fallas/${idFalla}`);
  }
}
