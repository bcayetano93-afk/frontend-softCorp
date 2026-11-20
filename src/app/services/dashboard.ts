import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ChartItem, ChartSerieEstado, DashboardResumen } from '../model/dashboard';

// Consultas agregadas para el dashboard y los 5 gráficos del backend.
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/v1/dashboard`;

  resumen(): Observable<DashboardResumen> {
    return this.http.get<DashboardResumen>(`${this.url}/resumen`);
  }

  evolucionDiaria(): Observable<ChartSerieEstado[]> {
    return this.http.get<ChartSerieEstado[]>(`${this.url}/evolucion-diaria`);
  }

  incidenciasPorArea(): Observable<ChartSerieEstado[]> {
    return this.http.get<ChartSerieEstado[]>(`${this.url}/incidencias-por-area`);
  }

  rendimientoTecnicos(): Observable<ChartSerieEstado[]> {
    return this.http.get<ChartSerieEstado[]>(`${this.url}/rendimiento-tecnicos`);
  }

  fallasPorCategoria(): Observable<ChartItem[]> {
    return this.http.get<ChartItem[]>(`${this.url}/fallas-por-categoria`);
  }

  repuestosPorEstado(): Observable<ChartItem[]> {
    return this.http.get<ChartItem[]>(`${this.url}/repuestos-por-estado`);
  }
}
