import { Component } from '@angular/core';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { Home } from './components/home/home';

@Component({
  selector: 'app-root',
  imports: [Header, Home, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
