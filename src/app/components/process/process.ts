import { Component } from '@angular/core';

@Component({
  selector: 'app-process',
  templateUrl: './process.html',
  styleUrl: './process.scss',
})
export class Process {
  // Pasos que sigue una incidencia desde que se reporta hasta que se soluciona
  readonly steps = [
    {
      title: 'El usuario reporta',
      text: 'Por email o teléfono indica el código de su equipo y el problema que presenta.',
    },
    {
      title: 'Se registra la incidencia',
      text: 'Un técnico, el personal de sistemas o el jefe la registra en el sistema.',
    },
    {
      title: 'El jefe asigna',
      text: 'Elige a un técnico que todavía tenga cupo dentro de su límite de atención.',
    },
    {
      title: 'El técnico atiende',
      text: 'Lo resuelve en la oficina o lleva el equipo al área y pide el repuesto a Logística.',
    },
    {
      title: 'Informe y cierre',
      text: 'La incidencia pasa de Pendiente a Solucionado y se registra el informe técnico.',
    },
  ];
}
