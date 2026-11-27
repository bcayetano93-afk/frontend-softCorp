import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-table-pagination',
  imports: [],
  templateUrl: './table-pagination.html',
  styleUrl: './table-pagination.scss',
})
export class TablePagination {
  totalItems = input.required<number>();
  totalUnfiltered = input<number | null>(null);
  page = input<number>(1);
  pageSize = input<number>(10);
  pageSizeOptions = input<number[]>([5, 10, 20]);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  // safePage acota la página actual si un filtro reduce el total de páginas disponibles
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  safePage = computed(() => Math.min(Math.max(1, this.page()), this.totalPages()));
  startIndex = computed(() => (this.totalItems() === 0 ? 0 : (this.safePage() - 1) * this.pageSize() + 1));
  endIndex = computed(() => Math.min(this.safePage() * this.pageSize(), this.totalItems()));

  // Emite el cambio de página manteniendo el número dentro de [1, totalPages]
  goToPage(nextPage: number): void {
    const clamped = Math.min(Math.max(1, nextPage), this.totalPages());
    if (clamped !== this.safePage()) {
      this.pageChange.emit(clamped);
    }
  }

  // Al cambiar el tamaño de página reinicia siempre a la página 1
  onPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (value > 0) {
      this.pageSizeChange.emit(value);
      this.pageChange.emit(1);
    }
  }
}
