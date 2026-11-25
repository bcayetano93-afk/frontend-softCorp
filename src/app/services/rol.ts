import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { RolRequest, RolResponse } from '../model/rol';

@Injectable({ providedIn: 'root' })
export class RolService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/v1/rol`;

  list(filter: Partial<RolRequest> = {}): Observable<RolResponse[]> {
    return this.http.post<RolResponse[]>(`${this.url}/list`, filter);
  }

  find(idRol: number): Observable<RolResponse> {
    return this.http.post<RolResponse>(`${this.url}/find`, { idRol });
  }

  save(request: RolRequest): Observable<RolResponse> {
    return this.http.post<RolResponse>(`${this.url}/save`, request);
  }

  delete(idRol: number): Observable<RolResponse> {
    return this.http.delete<RolResponse>(`${this.url}/delete`, {
      body: { idRol },
    });
  }
}
