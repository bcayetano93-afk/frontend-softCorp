import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { Incidents } from '../incidents/incidents';
import { Modules } from '../modules/modules';
import { Process } from '../process/process';
import { Roles } from '../roles/roles';

@Component({
  selector: 'app-home',
  imports: [Hero, Modules, Process, Roles, Incidents],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
