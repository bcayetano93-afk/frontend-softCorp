import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  // Datos de ejemplo: tareas asignadas y límite de atención de cada técnico
  readonly technicians = [
    { initials: 'LM', name: 'Luis Mendoza', specialty: 'Hardware', tasks: 3, limit: 5 },
    { initials: 'AT', name: 'Ana Torres', specialty: 'Redes y sistemas', tasks: 5, limit: 5 },
    { initials: 'CR', name: 'Carlos Rojas', specialty: 'Hardware', tasks: 2, limit: 5 },
    { initials: 'MQ', name: 'María Quispe', specialty: 'Software', tasks: 4, limit: 5 },
  ];
}
