import { Component } from '@angular/core';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { Hero } from '../hero/hero';
import { Incidents } from '../incidents/incidents';
import { Modules } from '../modules/modules';
import { Process } from '../process/process';
import { Roles } from '../roles/roles';

@Component({
  selector: 'app-home',
  imports: [Header, Hero, Modules, Process, Roles, Incidents, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
