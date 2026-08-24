import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { PortalService } from '../../../shared/portal.service';
import { ApplicationStatus, ScholarshipApplicationDto } from '../../../shared/types';
import { FIXED_SCHOLARSHIP_AMOUNT, formatCurrency, formatDate } from '../../../shared/utils/formatters';

@Component({
  selector: 'app-disbursement-view',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="space-y-4">
      <!-- Quick Metrics Ribbon -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Direct Disbursal</div>
            <div class="text-2xl font-black text-purple-950 font-mono mt-1">
              {{ formatCurrency(totalPendingAmount()) }}
            </div>
            <div class="text-xs text-slate-600 mt-0.5">
              {{ readyForDisburseCount() }} Approved candidates in current payout cycle
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
            <i class="pi pi-clock text-xl leading-none"></i>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Disbursed to Date</div>
            <div class="text-2xl font-black text-emerald-800 font-mono mt-1">
              {{ formatCurrency(totalDisbursedAmount()) }}
            </div>
            <div class="text-xs text-slate-600 mt-0.5">
              {{ totalDisbursedCount() }} Student bank accounts credited successfully
            </div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <i class="pi pi-check-circle text-xl leading-none"></i>
          </div>
        </div>
      </div>

      <!-- Sub Tabs & Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-white px-4 pt-2 rounded-t-xl shadow-xs gap-3">
        <div class="flex space-x-2 sm:space-x-4 overflow-x-auto">
          <button
            (click)="handleSubTabChange('PENDING_DISBURSE')"
            [class]="
              subTab() === 'PENDING_DISBURSE'
                ? 'border-purple-600 text-purple-900 bg-purple-50/50 rounded-t font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            "
            class="py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
          >
            <i class="pi pi-send text-xs leading-none"></i>
            <span>Ready for Direct Disbursal ({{ approvedApps().length }})</span>
          </button>

          <button
            (click)="handleSubTabChange('DISBURSED_HISTORY')"
            [class]="
              subTab() === 'DISBURSED_HISTORY'
                ? 'border-purple-600 text-purple-900 bg-purple-50/50 rounded-t font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            "
            class="py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
          >
            <i class="pi pi-history text-xs leading-none"></i>
            <span>Disbursed Treasury History ({{ disbursedApps().length }})</span>
          </button>
        </div>

        <div class="flex items-center space-x-2 pb-2">
          @if (readyForDisburseCount() > 0 && subTab() === 'PENDING_DISBURSE') {
            <button
              (click)="triggerBatchDisburseAll()"
              class="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm border border-purple-400/40 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <i class="pi pi-send text-xs leading-none"></i>
              <span>Disburse Batch ({{ readyForDisburseCount() }})</span>
            </button>
          }

          <button
            (click)="exportCSV()"
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 border border-slate-200 cursor-pointer"
          >
            <i class="pi pi-download text-xs leading-none"></i>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <!-- Search bar -->
      <div class="bg-white p-3 border-x border-slate-200 flex items-center space-x-2">
        <i class="pi pi-search text-slate-400 text-xs pl-2"></i>
        <input
          type="text"
          placeholder="Filter by student name, bank account, IFSC code, or UTR..."
          [ngModel]="searchQuery()"
          (ngModelChange)="handleSearchChange($event)"
          class="w-full text-xs border-none focus:outline-hidden bg-transparent"
        />
      </div>

      <!-- Main Disbursal Table -->
      <div class="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-900 text-white font-semibold">
                @if (subTab() === 'PENDING_DISBURSE') {
                  <th class="p-3.5 text-center w-10">
                    <input
                      type="checkbox"
                      [checked]="isAllSelected()"
                      (change)="handleSelectAll($event)"
                      class="rounded border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </th>
                }
                <th class="p-3.5">App ID</th>
                <th class="p-3.5">Beneficiary Student & College</th>
                <th class="p-3.5">Bank Name & Branch</th>
                <th class="p-3.5">Account No. & IFSC</th>
                <th class="p-3.5">Sanctioned Grant</th>
                @if (subTab() === 'DISBURSED_HISTORY') {
                  <th class="p-3.5">PFMS UTR & Disbursed Date</th>
                }
                <th class="p-3.5">Status</th>
                <th class="p-3.5 text-right">Direct Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @if (paginatedList().length === 0) {
                <tr>
                  <td colSpan="8" class="p-12 text-center text-slate-500">
                    <i class="pi pi-check-circle text-3xl text-slate-300 mx-auto mb-2 block"></i>
                    No records found in this payout queue.
                  </td>
                </tr>
              } @else {
                @for (app of paginatedList(); track app.applicationId) {
                  <tr class="hover:bg-purple-50/30 transition-colors">
                    @if (subTab() === 'PENDING_DISBURSE') {
                      <td class="p-3.5 text-center align-top">
                        <input
                          type="checkbox"
                          [checked]="isSelected(app.applicationId)"
                          (change)="toggleSelect(app.applicationId)"
                          class="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                    }

                    <!-- App ID -->
                    <td class="p-3.5 align-top font-mono font-bold text-slate-900">
                      #{{ app.applicationId }}
                    </td>

                    <!-- Student & College -->
                    <td class="p-3.5 align-top max-w-[200px]">
                      <div
                        (click)="onOpenApp(app)"
                        class="font-bold text-slate-900 hover:text-purple-700 cursor-pointer"
                      >
                        {{ app.studentName }}
                      </div>
                      <div class="text-[11px] text-slate-500 truncate" [title]="app.instituteName">
                        {{ app.instituteName }}
                      </div>
                    </td>

                    <!-- Bank Name -->
                    <td class="p-3.5 align-top">
                      <div class="font-semibold text-slate-900">{{ app.bankName || 'State Bank of India' }}</div>
                      <div class="text-[10px] text-slate-500">{{ app.branchName || 'Main Institutional Branch' }}</div>
                    </td>

                    <!-- Account No & IFSC -->
                    <td class="p-3.5 align-top font-mono">
                      <div class="font-bold text-slate-900">{{ app.bankAccountNumber }}</div>
                      <div class="text-blue-700 text-[10px]">{{ app.ifscCode }}</div>
                    </td>

                    <!-- Amount -->
                    <td class="p-3.5 align-top">
                      <div class="font-mono font-bold text-slate-900 text-sm">
                        {{ formatCurrency(app.sanctionAmount || FIXED_SCHOLARSHIP_AMOUNT) }}
                      </div>
                      <div class="text-[10px] text-emerald-700 font-semibold">100% Govt Grant</div>
                    </td>

                    <!-- UTR / Date -->
                    @if (subTab() === 'DISBURSED_HISTORY') {
                      <td class="p-3.5 align-top">
                        <div class="font-mono text-purple-900 font-bold text-xs">
                          {{ app.utrNumber || 'DBT2026IN8849102XQ' }}
                        </div>
                        <div class="text-[10px] text-slate-500 font-mono">
                          {{ formatDate(app.disbursementDate) }}
                        </div>
                      </td>
                    }

                    <!-- Status -->
                    <td class="p-3.5 align-top">
                      @if (app.status === ApplicationStatus.ADMIN_APPROVED) {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                          Ready for DBT
                        </span>
                      } @else {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                          Disbursed
                        </span>
                      }
                    </td>

                    <!-- Action -->
                    <td class="p-3.5 align-top text-right">
                      <div class="flex items-center justify-end space-x-2">
                        @if (app.status === ApplicationStatus.ADMIN_APPROVED) {
                          <button
                            (click)="disburseSingle(app.applicationId)"
                            class="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-[11px] font-bold shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <i class="pi pi-send text-xs"></i>
                            <span>Disburse DBT</span>
                          </button>
                        }

                        <button
                          (click)="onOpenApp(app)"
                          class="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="View Application Details"
                        >
                          <i class="pi pi-eye text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Table Pagination -->
        <app-pagination
          [currentPage]="currentPage()"
          [totalPages]="totalPages()"
          [pageSize]="pageSize()"
          [totalItems]="filteredList().length"
          (pageChange)="currentPage.set($event)"
          (pageSizeChange)="pageSize.set($event)"
          [pageSizeOptions]="[5, 10, 20, 50]"
        ></app-pagination>
      </div>
    </div>
  `,
})
export class DisbursementViewComponent {
  readonly service = inject(PortalService);
  readonly applications = input.required<ScholarshipApplicationDto[]>();
  readonly openApplication = output<ScholarshipApplicationDto>();
  readonly openBatchDisburse = output<ScholarshipApplicationDto[]>();

  readonly subTab = signal<'PENDING_DISBURSE' | 'DISBURSED_HISTORY'>('PENDING_DISBURSE');
  readonly searchQuery = signal<string>('');
  readonly selectedIds = signal<number[]>([]);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  readonly ApplicationStatus = ApplicationStatus;
  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;
  readonly FIXED_SCHOLARSHIP_AMOUNT = FIXED_SCHOLARSHIP_AMOUNT;

  readonly approvedApps = computed(() =>
    this.applications().filter((a) => a.status === ApplicationStatus.ADMIN_APPROVED)
  );

  readonly disbursedApps = computed(() =>
    this.applications().filter((a) => a.status === ApplicationStatus.DISBURSED)
  );

  readonly readyForDisburseCount = computed(() => this.approvedApps().length);
  readonly totalDisbursedCount = computed(() => this.disbursedApps().length);

  readonly totalPendingAmount = computed(() =>
    this.approvedApps().reduce((acc, a) => acc + (a.sanctionAmount || FIXED_SCHOLARSHIP_AMOUNT), 0)
  );

  readonly totalDisbursedAmount = computed(() =>
    this.disbursedApps().reduce((acc, a) => acc + (a.sanctionAmount || FIXED_SCHOLARSHIP_AMOUNT), 0)
  );

  readonly currentList = computed(() =>
    this.subTab() === 'PENDING_DISBURSE' ? this.approvedApps() : this.disbursedApps()
  );

  readonly filteredList = computed(() => {
    const list = this.currentList();
    if (!this.searchQuery()) return list;

    const q = this.searchQuery().toLowerCase();
    return list.filter(
      (a) =>
        a.studentName.toLowerCase().includes(q) ||
        a.bankAccountNumber.includes(q) ||
        a.ifscCode.toLowerCase().includes(q) ||
        (a.utrNumber && a.utrNumber.toLowerCase().includes(q))
    );
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredList().length / this.pageSize()) || 1);

  readonly paginatedList = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredList().slice(start, start + this.pageSize());
  });

  handleSubTabChange(newTab: 'PENDING_DISBURSE' | 'DISBURSED_HISTORY') {
    this.subTab.set(newTab);
    this.selectedIds.set([]);
    this.currentPage.set(1);
  }

  handleSearchChange(q: string) {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  isAllSelected(): boolean {
    const list = this.filteredList();
    return list.length > 0 && list.every((a) => this.selectedIds().includes(a.applicationId));
  }

  toggleSelect(id: number) {
    this.selectedIds.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  }

  handleSelectAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.set(this.filteredList().map((a) => a.applicationId));
    } else {
      this.selectedIds.set([]);
    }
  }

  disburseSingle(id: number) {
    this.service.disburseSingle(id);
  }

  triggerBatchDisburseAll() {
    this.openBatchDisburse.emit(this.approvedApps());
  }

  onOpenApp(app: ScholarshipApplicationDto) {
    this.openApplication.emit(app);
  }

  exportCSV() {
    const headers = 'Application ID,Student Name,Institute,Bank Account,IFSC,Amount,Status,UTR Number,Disbursed Date\n';
    const rows = this.filteredList()
      .map(
        (a) =>
          `"${a.applicationId}","${a.studentName}","${a.instituteName}","${a.bankAccountNumber}","${a.ifscCode}","${a.sanctionAmount || FIXED_SCHOLARSHIP_AMOUNT}","${a.status}","${a.utrNumber || 'N/A'}","${a.disbursementDate || 'N/A'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScholarFund_DBT_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
