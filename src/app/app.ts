import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainer } from './components/toast-container/toast-container';
import { LoadingService } from './services/loading';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  loadingService = inject(LoadingService);
}
