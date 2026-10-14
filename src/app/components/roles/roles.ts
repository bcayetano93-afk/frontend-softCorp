import { Component } from '@angular/core';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class Roles {
  // Qué puede hacer cada tipo de usuario del sistema
  readonly roles = [
    {
      icon: '👔',
      name: 'Jefe del área',
      description: 'Organiza el trabajo y supervisa los resultados.',
      tasks: [
        'Registrar incidencias',
        'Asignar técnicos según disponibilidad',
        'Ver equipos con problemas complicados',
        'Ver equipos arreglados por día',
        'Consultar historial de equipos',
      ],
      featured: false,
    },
    {
      icon: '🔧',
      name: 'Técnicos',
      description: 'Atienden y solucionan los problemas de los equipos.',
      tasks: [
        'Registrar incidencias',
        'Consultar sus tareas asignadas',
        'Solicitar repuestos a Logística',
        'Registrar el informe técnico',
        'Usar el diccionario de fallas',
        'Consultar historial de equipos',
      ],
      featured: true,
    },
    {
      icon: '💻',
      name: 'Personal de sistemas',
      description: 'Apoya en la recepción de los reportes.',
      tasks: ['Registrar incidencias', 'Consultar historial de equipos'],
      featured: false,
    },
  ];
}
