import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Incidencia, TecnicoDisponibilidad } from '../../../model/incidencia';
import { IncidenciaService } from '../../../services/incidencia';
import { SessionService } from '../../../services/session';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';

@Component({
  selector: 'app-chart-incidencias',
  imports: [NgApexchartsModule],
  templateUrl: './chart-incidencias.html',
  styleUrl: './chart-incidencias.scss',
})
export class ChartIncidencias implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private soporteService = inject(SoporteTecnicoService);
  private sessionService = inject(SessionService);

  incidencias = signal<Incidencia[]>([]);
  tecnicos = signal<TecnicoDisponibilidad[]>([]);

  // Gráfico 1: DONUT (distinto a pie y bar)
  donutChart = computed(() => {
    const lista = this.soporteService.combinarConEstadoLocal(this.incidencias());
    const sinAsignar = lista.filter((i) => i.estado === 'PENDIENTE' && i.idTecnico === null).length;
    const esperaRepuesto = lista.filter(
      (i) => i.estado === 'PENDIENTE' && this.soporteService.tieneRepuestoPendiente(i.idIncidencia),
    ).length;
    const enAtencion = lista.filter(
      (i) => i.estado === 'PENDIENTE' && i.idTecnico !== null && !this.soporteService.tieneRepuestoPendiente(i.idIncidencia),
    ).length;
    const solucionadas = lista.filter((i) => i.estado === 'SOLUCIONADO').length;

    return {
      series: [sinAsignar, enAtencion, esperaRepuesto, solucionadas] as ApexNonAxisChartSeries,
      chart: { type: 'donut', height: 320 } as ApexChart,
      labels: ['Sin asignar', 'En atención', 'Espera repuesto', 'Solucionadas'],
      colors: ['#f26b3a', '#f59e0b', '#6366f1', '#12a389'],
      title: { text: 'Estado Operativo de Incidencias', align: 'center' } as ApexTitleSubtitle,
      legend: { position: 'bottom' } as ApexLegend,
    };
  });

  // Gráfico 2: AREA (distinto a pie y bar)
  areaChart = computed(() => {
    const lista = this.soporteService.combinarConEstadoLocal(this.incidencias());
    const porFecha = new Map<string, { registradas: number; solucionadas: number }>();

    for (const inc of lista) {
      const fecha = (inc.fechaRegistro || '').slice(0, 10) || 'Hoy';
      const actual = porFecha.get(fecha) ?? { registradas: 0, solucionadas: 0 };
      actual.registradas += 1;
      if (inc.estado === 'SOLUCIONADO') {
        actual.solucionadas += 1;
      }
      porFecha.set(fecha, actual);
    }

    const categorias = Array.from(porFecha.keys()).sort();
    return {
      series: [
        { name: 'Registradas', data: categorias.map((f) => porFecha.get(f)!.registradas) },
        { name: 'Solucionadas', data: categorias.map((f) => porFecha.get(f)!.solucionadas) },
      ] as ApexAxisChartSeries,
      chart: { type: 'area', height: 320, toolbar: { show: false } } as ApexChart,
      xaxis: { categories: categorias } as ApexXAxis,
      stroke: { curve: 'smooth', width: 2 } as ApexStroke,
      fill: { type: 'gradient', gradient: { opacityFrom: 0.45, opacityTo: 0.05 } } as ApexFill,
      colors: ['#0f2a47', '#12a389'],
      dataLabels: { enabled: false } as ApexDataLabels,
      title: { text: 'Flujo Diario: Registradas vs. Solucionadas', align: 'center' } as ApexTitleSubtitle,
    };
  });

  // Gráfico 3: RADIALBAR (distinto a pie y bar)
  radialChart = computed(() => {
    const listaTecnicos = this.tecnicos();
    if (listaTecnicos.length > 0) {
      const porcentajes = listaTecnicos.map((t) =>
        t.limite > 0 ? Math.min(100, Math.round((t.carga / t.limite) * 100)) : 0,
      );
      return {
        series: porcentajes as ApexNonAxisChartSeries,
        chart: { type: 'radialBar', height: 320 } as ApexChart,
        labels: listaTecnicos.map((t) => t.nombre),
        colors: ['#0f2a47', '#f26b3a', '#12a389', '#6366f1'],
        plotOptions: {
          radialBar: {
            dataLabels: {
              total: { show: true, label: 'Técnicos', formatter: () => `${listaTecnicos.length}` },
            },
          },
        } as ApexPlotOptions,
        title: { text: '% Ocupación vs. Límite de Técnicos', align: 'center' } as ApexTitleSubtitle,
      };
    }

    // Fallback para roles TECNICO y SISTEMAS (sin acceso a /api/v1/tecnicos/disponibilidad)
    const lista = this.soporteService.combinarConEstadoLocal(this.incidencias());
    const total = Math.max(1, lista.length);
    const conTecnico = Math.round((lista.filter((i) => i.idTecnico !== null).length / total) * 100);
    const trasladados = Math.round(
      (lista.filter((i) => this.soporteService.estaTrasladado(i.idIncidencia)).length / total) * 100,
    );
    const resueltas = Math.round((lista.filter((i) => i.estado === 'SOLUCIONADO').length / total) * 100);

    return {
      series: [conTecnico, trasladados, resueltas] as ApexNonAxisChartSeries,
      chart: { type: 'radialBar', height: 320 } as ApexChart,
      labels: ['Asignadas (%)', 'En Soporte (%)', 'Resueltas (%)'],
      colors: ['#0f2a47', '#f26b3a', '#12a389'],
      plotOptions: {
        radialBar: {
          dataLabels: {
            total: { show: true, label: 'Incidencias', formatter: () => `${lista.length}` },
          },
        },
      } as ApexPlotOptions,
      title: { text: 'Indicadores de Atención Técnica (%)', align: 'center' } as ApexTitleSubtitle,
    };
  });

  ngOnInit(): void {
    this.incidenciaService.listar().subscribe({
      next: (data) => this.incidencias.set(data),
      error: () => {},
    });

    if (this.sessionService.getInfoSession()?.rol === 'JEFE') {
      this.incidenciaService.disponibilidadTecnicos().subscribe({
        next: (data) => this.tecnicos.set(data),
        error: () => this.tecnicos.set([]),
      });
    }
  }
}
