import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia, InformeTecnico, LugarAtencion } from '../../../model/incidencia';
import { IncidenciaService } from '../../../services/incidencia';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';
import { ToastService } from '../../../services/toast';
import { RegexConstants, onEnterKey } from '../../../util/constant';

// HU08 - Registrar informe técnico y cerrar incidencia como SOLUCIONADO
@Component({
  selector: 'app-informe-tecnico',
  imports: [FormsModule, DatePipe],
  templateUrl: './informe-tecnico.html',
  styleUrl: './informe-tecnico.scss',
})
export class InformeTecnicoComponent implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private soporteService = inject(SoporteTecnicoService);
  private toast = inject(ToastService);
  public RG = RegexConstants;

  incidenciasPendientes = signal<Incidencia[]>([]);
  informes = signal<InformeTecnico[]>([]);

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
      next: (lista) => this.informes.set(lista),
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
