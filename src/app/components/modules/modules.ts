import { Component } from '@angular/core';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.html',
  styleUrl: './modules.scss',
})
export class Modules {
  // Cada módulo responde a un requisito del sistema
  readonly modules = [
    {
      icon: '📝',
      title: 'Registro de incidencias',
      text: 'Código del equipo, problema, usuario responsable, fecha y hora, y quién la registró.',
      role: 'Todo el personal',
    },
    {
      icon: '👥',
      title: 'Asignación de técnicos',
      text: 'Asigna cada incidencia verificando la disponibilidad y el límite de atención del técnico.',
      role: 'Jefe del área',
    },
    {
      icon: '🛠️',
      title: 'Mis tareas',
      text: 'Cada técnico consulta las incidencias asignadas y se dirige al área del usuario.',
      role: 'Técnicos',
    },
    {
      icon: '📦',
      title: 'Solicitud de repuestos',
      text: 'Si el equipo necesita una pieza nueva, se solicita al área de Logística.',
      role: 'Técnicos',
    },
    {
      icon: '📄',
      title: 'Informe técnico',
      text: 'Al solucionar el problema se registra el informe con el trabajo realizado.',
      role: 'Técnicos',
    },
    {
      icon: '📚',
      title: 'Diccionario de fallas',
      text: 'Registra y consulta soluciones a problemas frecuentes para resolverlos más rápido.',
      role: 'Técnicos',
    },
    {
      icon: '📊',
      title: 'Reportes',
      text: 'Estado de las PC con problemas complicados y equipos arreglados por día.',
      role: 'Jefe del área',
    },
    {
      icon: '🖥️',
      title: 'Historial de equipos',
      text: 'Revisa todas las fallas de un equipo para decidir si conviene comprar uno nuevo.',
      role: 'Todo el personal',
    },
  ];
}
