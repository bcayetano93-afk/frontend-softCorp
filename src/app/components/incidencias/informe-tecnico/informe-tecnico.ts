import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia, InformeTecnico, LugarAtencion } from '../../../model/incidencia';
import { IncidenciaService } from '../../../services/incidencia';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';
import { ToastService } from '../../../services/toast';
import { ClassGeneric } from '../../../util/class-generic';
import { RegexConstants, onEnterKey } from '../../../util/constant';
import { setListRow } from '../../../util/methods';
import { TablePagination } from '../../shared/table-pagination/table-pagination';

type InformeRow = InformeTecnico & ClassGeneric;

// HU08 - Registrar informe técnico y cerrar incidencia como SOLUCIONADO
@Component({
  selector: 'app-informe-tecnico',
  imports: [FormsModule, DatePipe, TablePagination],
  templateUrl: './informe-tecnico.html',
  styleUrl: './informe-tecnico.scss',
})
export class InformeTecnicoComponent implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private soporteService = inject(SoporteTecnicoService);
  private toast = inject(ToastService);
  public RG = RegexConstants;

  incidenciasPendientes = signal<Incidencia[]>([]);
  informes = signal<InformeRow[]>([]);
  page = signal(1);
  pageSize = signal(10);

  informesPaginados = computed(() => {
    const lista = this.informes();
    const totalPages = Math.max(1, Math.ceil(lista.length / this.pageSize()));
    const current = Math.min(Math.max(1, this.page()), totalPages);
    const start = (current - 1) * this.pageSize();
    return lista.slice(start, start + this.pageSize());
  });

  form = {
    idIncidencia: null as number | null,
    diagnostico: '',
    solucionAplicada: '',
    piezasCambiadas: '',
    lugarSolucion: 'OFICINA_USUARIO' as LugarAtencion,
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  onEnterKey(event: Event): void {
    onEnterKey(event);
  }

  cargarDatos(): void {
    this.incidenciaService.listar().subscribe((lista) => {
      this.incidenciasPendientes.set(
        lista.filter((i) => i.estado === 'PENDIENTE' && i.idTecnico !== null),
      );
    });

    this.soporteService.listarInformes().subscribe({
      next: (lista) => this.informes.set(setListRow(lista)),
      error: (err: HttpErrorResponse) => {
        this.informes.set([]);
        this.toast.show(err.error?.message ?? 'No se pudieron cargar los informes técnicos.', 'danger');
      },
    });
  }

  registrarInforme(): void {
    const inc = this.incidenciasPendientes().find((i) => i.idIncidencia === this.form.idIncidencia);
    const diagnostico = this.form.diagnostico.trim();
    const solucionAplicada = this.form.solucionAplicada.trim();
    const piezasCambiadas = this.form.piezasCambiadas.trim();

    if (!inc || !diagnostico || !solucionAplicada) {
      return;
    }

    this.soporteService
      .registrarInformeTecnico({
        idIncidencia: inc.idIncidencia,
        diagnostico,
        solucionAplicada,
        piezasCambiadas,
        lugarSolucion: this.form.lugarSolucion,
      })
      .subscribe({
        next: () => {
          this.toast.show(`Informe registrado. ${inc.codigo} pasó a estado Solucionado.`, 'success');
          this.form = {
            idIncidencia: null,
            diagnostico: '',
            solucionAplicada: '',
            piezasCambiadas: '',
            lugarSolucion: 'OFICINA_USUARIO',
          };
          this.page.set(1);
          this.cargarDatos();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status !== 403) {
            this.toast.show(err.error?.message ?? 'No se pudo registrar el informe técnico.', 'danger');
          }
        },
      });
  }
}
