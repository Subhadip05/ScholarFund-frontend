import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalItems() > 0) {
      <div class="px-4 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
        <!-- Left side: Range Info & Page Size -->
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-slate-600">
            Showing <span class="font-bold text-slate-900">{{ startItem() }}</span> to
            <span class="font-bold text-slate-900">{{ endItem() }}</span> of
            <span class="font-bold text-slate-900">{{ totalItems() }}</span> entries
          </span>

          <div class="flex items-center space-x-1.5 pl-2 border-l border-slate-200">
            <span class="text-slate-500">Per page:</span>
            <select
              [value]="pageSize()"
              (change)="onPageSizeSelect($event)"
              class="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              @for (opt of pageSizeOptions(); track opt) {
                <option [value]="opt">{{ opt }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Right side: Controls -->
        <div class="flex items-center space-x-1 self-center sm:self-auto">
          <!-- First Page -->
          <button
            (click)="onPageClick(1)"
            [disabled]="currentPage() === 1"
            class="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="First Page"
          >
            <i class="pi pi-angle-double-left text-xs"></i>
          </button>

          <!-- Prev Page -->
          <button
            (click)="onPageClick(currentPage() - 1)"
            [disabled]="currentPage() === 1"
            class="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors flex items-center space-x-1 cursor-pointer"
            title="Previous Page"
          >
            <i class="pi pi-angle-left text-xs"></i>
            <span class="hidden md:inline text-[11px] font-medium pr-1">Prev</span>
          </button>

          <!-- Numbered Buttons -->
          <div class="flex items-center space-x-1 px-1">
            @for (p of pageNumbers(); track $index) {
              @if (p === '...') {
                <span class="px-1.5 py-1 text-slate-400 select-none">...</span>
              } @else {
                <button
                  (click)="onPageClick(+p)"
                  [class]="
                    +p === currentPage()
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                  "
                  class="min-w-[28px] h-7 px-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
                >
                  {{ p }}
                </button>
              }
            }
          </div>

          <!-- Next Page -->
          <button
            (click)="onPageClick(currentPage() + 1)"
            [disabled]="currentPage() === totalPages() || totalPages() === 0"
            class="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors flex items-center space-x-1 cursor-pointer"
            title="Next Page"
          >
            <span class="hidden md:inline text-[11px] font-medium pl-1">Next</span>
            <i class="pi pi-angle-right text-xs"></i>
          </button>

          <!-- Last Page -->
          <button
            (click)="onPageClick(totalPages())"
            [disabled]="currentPage() === totalPages() || totalPages() === 0"
            class="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Last Page"
          >
            <i class="pi pi-angle-double-right text-xs"></i>
          </button>
        </div>
      </div>
    }
  `,
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageSizeOptions = input<number[]>([5, 10, 20, 50]);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly startItem = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  readonly endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalItems()));

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }
    return pages;
  });

  onPageClick(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeSelect(event: Event) {
    const val = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(val);
    this.pageChange.emit(1);
  }
}
