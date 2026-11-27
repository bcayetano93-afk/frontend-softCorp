import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ModuloRequest, ModuloResponse } from '../model/rol';

// Consulta de módulos activos del sistema (patrón SIGCON sobre /api/v1/modulo)
@Injectable({ providedIn: 'root' })
export class ModuloService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/v1/modulo`;

  list(filter: Partial<ModuloRequest> = {}): Observable<ModuloResponse[]> {
    return this.http.post<ModuloResponse[]>(`${this.url}/list`, filter);
  }

  find(idMod: number): Observable<ModuloResponse> {
    return this.http.post<ModuloResponse>(`${this.url}/find`, { idMod });
  }
}
