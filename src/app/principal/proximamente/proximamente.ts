import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../services/session';

// Página temporal para los módulos de los siguientes sprints
@Component({
  selector: 'app-proximamente',
  templateUrl: './proximamente.html',
})
export class Proximamente {
  private session = inject(SessionService);

  // Parámetro de la URL (ej. "mis-tareas"). Se actualiza al cambiar de módulo.
  private parametros = toSignal(inject(ActivatedRoute).paramMap);

  // Nombre del módulo para mostrar (ej. "Mis tareas")
  nombreModulo = computed(() => {
    const url = this.parametros()?.get('modulo');
    const modulo = this.session.getInfoSession()?.modulos.find((m) => m.url === url);
    return modulo?.descripcion ?? 'Módulo';
  });
}
