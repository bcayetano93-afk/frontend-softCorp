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
import {
  ChartItem,
  ChartSerieEstado,
  DashboardResumen,
  RendimientoTecnico,
} from '../../../model/dashboard';
import { DashboardService } from '../../../services/dashboard';

@Component({
  selector: 'app-chart-incidencias',
  imports: [NgApexchartsModule],
  templateUrl: './chart-incidencias.html',
  styleUrl: './chart-incidencias.scss',
})
export class ChartIncidencias implements OnInit {
  private dashboardService = inject(DashboardService);

  resumen = signal<DashboardResumen | null>(null);
  evolucion = signal<ChartSerieEstado[]>([]);
  porArea = signal<ChartSerieEstado[]>([]);
  rendimiento = signal<RendimientoTecnico[]>([]);
  fallasCategoria = signal<ChartItem[]>([]);
  repuestosEstado = signal<ChartItem[]>([]);
  errorCarga = signal<string | null>(null);

  // Gráfico 1: Area (evolución diaria)
  evolucionChart = computed(() => {
    const data = this.evolucion();
    return {
      hasData: data.length > 0,
      series: [
        { name: 'Registradas', data: data.map((d) => d.pendientes) },
        { name: 'Solucionadas', data: data.map((d) => d.solucionadas) },
      ] as ApexAxisChartSeries,
      chart: { type: 'area', height: 300, toolbar: { show: false } } as ApexChart,
      xaxis: { categories: data.map((d) => d.categoria) } as ApexXAxis,
      stroke: { curve: 'smooth', width: 2 } as ApexStroke,
      fill: { type: 'gradient', gradient: { opacityFrom: 0.45, opacityTo: 0.05 } } as ApexFill,
      colors: ['#0f2a47', '#12a389'],
      dataLabels: { enabled: false } as ApexDataLabels,
      title: { text: 'Evolución Diaria de Incidencias', align: 'center' } as ApexTitleSubtitle,
    };
  });

  // Gráfico 2: Radar (incidencias por área)
  areaChart = computed(() => {
    const data = this.porArea();
    return {
      hasData: data.length > 0,
      series: [
        { name: 'Pendientes', data: data.map((d) => d.pendientes) },
        { name: 'Solucionadas', data: data.map((d) => d.solucionadas) },
      ] as ApexAxisChartSeries,
      chart: { type: 'radar', height: 300, toolbar: { show: false } } as ApexChart,
      xaxis: { categories: data.map((d) => d.categoria) } as ApexXAxis,
      colors: ['#f26b3a', '#12a389'],
      stroke: { width: 2 } as ApexStroke,
      fill: { opacity: 0.25 } as ApexFill,
      title: { text: 'Incidencias por Área', align: 'center' } as ApexTitleSubtitle,
    };
  });

  // Gráfico 3: Heatmap (rendimiento por técnico)
  tecnicosChart = computed(() => {
    const data = this.rendimiento();
    return {
      hasData: data.length > 0,
      series: [
        {
          name: 'Pendientes',
          data: data.map((d) => ({ x: d.tecnico, y: d.pendientes })),
        },
        {
          name: 'Solucionadas',
          data: data.map((d) => ({ x: d.tecnico, y: d.solucionadas })),
        },
        {
          name: 'Límite atención',
          data: data.map((d) => ({ x: d.tecnico, y: d.limiteAtencion })),
        },
      ] as ApexAxisChartSeries,
      chart: { type: 'heatmap', height: 300, toolbar: { show: false } } as ApexChart,
      xaxis: { type: 'category' } as ApexXAxis,
      plotOptions: {
        heatmap: {
          radius: 6,
          enableShades: true,
          shadeIntensity: 0.55,
        },
      } as ApexPlotOptions,
      colors: ['#f59e0b', '#12a389', '#0f2a47'],
      dataLabels: { enabled: true } as ApexDataLabels,
      title: { text: 'Rendimiento por Técnico', align: 'center' } as ApexTitleSubtitle,
    };
  });

  // Gráfico 4: Donut (fallas por categoría)
  fallasChart = computed(() => {
    const data = this.fallasCategoria();
    return {
      hasData: data.length > 0,
      series: data.map((d) => d.cantidad) as ApexNonAxisChartSeries,
      chart: { type: 'donut', height: 300 } as ApexChart,
      labels: data.map((d) => d.etiqueta),
      colors: ['#0f2a47', '#f26b3a', '#12a389', '#6366f1', '#f59e0b', '#64748b'],
      legend: { position: 'bottom' } as ApexLegend,
      title: { text: 'Fallas Documentadas por Categoría', align: 'center' } as ApexTitleSubtitle,
    };
  });

  // Gráfico 5: Polar Area (repuestos por estado)
  repuestosChart = computed(() => {
    const data = this.repuestosEstado();
    return {
      hasData: data.length > 0,
      series: data.map((d) => d.cantidad) as ApexNonAxisChartSeries,
      chart: { type: 'polarArea', height: 300 } as ApexChart,
      labels: data.map((d) => d.etiqueta),
      colors: ['#f59e0b', '#12a389', '#f26b3a'],
      legend: { position: 'bottom' } as ApexLegend,
      title: { text: 'Solicitudes de Repuestos por Estado', align: 'center' } as ApexTitleSubtitle,
    };
  });

  ngOnInit(): void {
    const onError = (err: unknown) => {
      console.error('Error al cargar datos del dashboard', err);
      this.errorCarga.set('No se pudieron cargar las métricas del dashboard desde el servidor.');
    };

    this.dashboardService.resumen().subscribe({
      next: (data) => this.resumen.set(data),
      error: onError,
    });
    this.dashboardService.evolucionDiaria().subscribe({
      next: (data) => this.evolucion.set(data),
      error: onError,
    });
    this.dashboardService.incidenciasPorArea().subscribe({
      next: (data) => this.porArea.set(data),
      error: onError,
    });
    this.dashboardService.rendimientoTecnicos().subscribe({
      next: (data) => this.rendimiento.set(data),
      error: onError,
    });
    this.dashboardService.fallasPorCategoria().subscribe({
      next: (data) => this.fallasCategoria.set(data),
      error: onError,
    });
    this.dashboardService.repuestosPorEstado().subscribe({
      next: (data) => this.repuestosEstado.set(data),
      error: onError,
    });
  }
}
