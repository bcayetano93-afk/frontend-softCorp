import { Component } from '@angular/core';

// Forma que tiene cada incidencia (según los datos que pide el registro)
interface Incident {
  code: string;
  device: string;
  problem: string;
  user: string;
  registeredBy: string;
  date: string;
  technician: string;
  status: 'Pendiente' | 'Solucionado';
}

@Component({
  selector: 'app-incidents',
  templateUrl: './incidents.html',
  styleUrl: './incidents.scss',
})
export class Incidents {
  // Datos de ejemplo
  readonly incidents: Incident[] = [
    {
      code: 'INC-248',
      device: 'PC-ADM-014',
      problem: 'No inicia Windows',
      user: 'Rosa Paredes',
      registeredBy: 'Jorge García',
      date: '14/10/2026 09:15',
      technician: 'Luis Mendoza',
      status: 'Pendiente',
    },
    {
      code: 'INC-247',
      device: 'PC-RRHH-008',
      problem: 'Disco duro dañado (espera repuesto)',
      user: 'Pedro Salas',
      registeredBy: 'Ana Torres',
      date: '13/10/2026 16:40',
      technician: 'Ana Torres',
      status: 'Pendiente',
    },
    {
      code: 'INC-246',
      device: 'PC-FIN-021',
      problem: 'Conexión a red intermitente',
      user: 'Lucía Vega',
      registeredBy: 'Jorge García',
      date: '13/10/2026 11:05',
      technician: 'Carlos Rojas',
      status: 'Solucionado',
    },
    {
      code: 'INC-245',
      device: 'PC-VEN-003',
      problem: 'Impresora no reconocida',
      user: 'Miguel Ramos',
      registeredBy: 'María Quispe',
      date: '12/10/2026 10:30',
      technician: 'María Quispe',
      status: 'Solucionado',
    },
  ];
}
