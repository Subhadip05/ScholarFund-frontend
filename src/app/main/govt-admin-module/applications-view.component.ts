import { Component, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { PortalService } from '../../../shared/portal.service';
import { ApplicationStatus, DocType, ScholarshipApplicationDto } from '../../../shared/types';
import {
  FIXED_SCHOLARSHIP_AMOUNT,
  formatCurrency,
  formatDate,
  getStatusConfig,
} from '../../../shared/utils/formatters';
import { Apiservice } from '../../../shared/api/apiservice';
import Notiflix from 'notiflix';

@Component({
  selector: 'app-applications-view',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="space-y-4">
      <!-- Status Tabs Navigation Bar -->
      <div
        class="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs flex items-center overflow-x-auto gap-1"
      >
        <button
          (click)="handleStatusTabChange('ALL')"
          [class]="
            selectedStatusTab() === 'ALL'
              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
          "
          class="py-2 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer"
        >
          All Applications ({{ applications().length }})
        </button>

        <button
          (click)="handleStatusTabChange(ApplicationStatus.INSTITUTE_VERIFIED)"
          [class]="
            selectedStatusTab() === ApplicationStatus.INSTITUTE_VERIFIED
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
          "
          class="py-2 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer"
        >
          <span>Pending Govt Review</span>
          <span
            [class]="
              selectedStatusTab() === ApplicationStatus.INSTITUTE_VERIFIED
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
            "
            class="px-1.5 py-0.5 rounded-full text-[10px] leading-none"
          >
            {{ statusCounts().INSTITUTE_VERIFIED }}
          </span>
        </button>

        <button
          (click)="handleStatusTabChange(ApplicationStatus.ADMIN_APPROVED)"
          [class]="
            selectedStatusTab() === ApplicationStatus.ADMIN_APPROVED
              ? 'bg-emerald-700 text-white font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
          "
          class="py-2 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer"
        >
          <span>Ready for DBT Disbursal</span>
          <span
            [class]="
              selectedStatusTab() === ApplicationStatus.ADMIN_APPROVED
                ? 'bg-purple-200 text-purple-950 font-black'
                : 'bg-purple-100 text-purple-900 font-bold border border-purple-300'
            "
            class="px-1.5 py-0.5 rounded-full text-[10px] leading-none"
          >
            {{ statusCounts().ADMIN_APPROVED }}
          </span>
        </button>

        <button
          (click)="handleStatusTabChange(ApplicationStatus.DISBURSED)"
          [class]="
            selectedStatusTab() === ApplicationStatus.DISBURSED
              ? 'bg-purple-700 text-white font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
          "
          class="py-2 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer"
        >
          <span>Disbursed</span>
          <span
            [class]="
              selectedStatusTab() === ApplicationStatus.DISBURSED
                ? 'bg-white text-purple-900 font-black'
                : 'bg-purple-100 text-purple-900 font-bold'
            "
            class="px-1.5 py-0.5 rounded-full text-[10px] leading-none"
          >
            {{ statusCounts().DISBURSED }}
          </span>
        </button>

        <button
          (click)="handleStatusTabChange(ApplicationStatus.ADMIN_REJECTED)"
          [class]="
            selectedStatusTab() === ApplicationStatus.ADMIN_REJECTED
              ? 'bg-rose-700 text-white font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
          "
          class="py-2 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer"
        >
          Govt Rejected ({{ statusCounts().ADMIN_REJECTED }})
        </button>
      </div>

      <!-- Filter and Search Bar -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs"
      >
        <div class="relative">
          <i class="pi pi-search absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search by student, ID, roll, bank..."
            [ngModel]="searchQuery()"
            (ngModelChange)="handleSearchChange($event)"
            class="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            [ngModel]="selectedInstituteFilter()"
            (ngModelChange)="handleInstituteFilterChange($event)"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Colleges / Universities</option>
            @for (inst of distinctInstitutes(); track inst) {
              <option [value]="inst">{{ inst }}</option>
            }
          </select>
        </div>

        <div>
          <select
            [ngModel]="marksFilter()"
            (ngModelChange)="handleMarksFilterChange($event)"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Qualifying Marks</option>
            <option value="ABOVE_80">≥ 80% (Merit Tier)</option>
            <option value="BETWEEN_60_80">60% - 79% (Standard)</option>
            <option value="BELOW_60">&lt; 60% (Ineligible)</option>
          </select>
        </div>

        <div>
          <select
            [ngModel]="incomeFilter()"
            (ngModelChange)="handleIncomeFilterChange($event)"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Income Brackets</option>
            <option value="BELOW_1L">≤ ₹1,00,000 / year</option>
            <option value="BETWEEN_1L_2_5L">₹1,00,000 - ₹2,50,000 (Eligible)</option>
            <option value="ABOVE_2_5L">&gt; ₹2,50,000 (Ineligible)</option>
          </select>
        </div>
      </div>

      <!-- Bulk Action Banner if selected -->
      @if (selectedAppIds().length > 0) {
        <div
          class="bg-blue-900 text-white p-3 rounded-xl flex items-center justify-between shadow-md animate-in fade-in duration-150"
        >
          <div class="text-xs font-semibold flex items-center space-x-2">
            <i class="pi pi-check-circle text-sm text-blue-300"></i>
            <span>{{ selectedAppIds().length }} applications selected</span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              (click)="bulkApprove()"
              class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Approve Sanction (₹60,000 each)
            </button>
            <button
              (click)="selectedAppIds.set([])"
              class="px-3 py-1.5 text-xs text-blue-200 hover:text-white cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      }

      <!-- Applications Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-900 text-white font-semibold">
                <th class="p-3.5 text-center w-10">
                  <input
                    type="checkbox"
                    [checked]="isAllSelected()"
                    (change)="handleSelectAll($event)"
                    class="rounded border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th class="p-3.5">App ID & Date</th>
                <th class="p-3.5">Student & Category</th>
                <th class="p-3.5">Enrolled College & Course</th>
                <th class="p-3.5">Qualifying %</th>
                <th class="p-3.5">Family Income</th>
                <th class="p-3.5">Bank A/C & IFSC</th>
                <th class="p-3.5 text-center">Presigned Docs</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5 text-right">Govt Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @if (paginatedApplications().length === 0) {
                <tr>
                  <td colSpan="10" class="p-12 text-center text-slate-500">
                    <i class="pi pi-inbox text-3xl text-slate-300 mx-auto mb-2 block"></i>
                    No scholarship applications found matching the selected filters.
                  </td>
                </tr>
              } @else {
                @for (app of paginatedApplications(); track app.applicationId) {
                  <tr
                    [class]="
                      isSelected(app.applicationId) ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                    "
                    class="transition-colors"
                  >
                    <!-- Checkbox -->
                    <td class="p-3.5 text-center align-top">
                      <input
                        type="checkbox"
                        [checked]="isSelected(app.applicationId)"
                        (change)="toggleSelect(app.applicationId)"
                        class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    <!-- ID & Date -->
                    <td class="p-3.5 align-top">
                      <div class="font-mono font-bold text-slate-900 text-xs">
                        #{{ app.applicationId }}
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                        {{ formatDate(app.applicationDate) }}
                      </div>
                    </td>

                    <!-- Student Name & Category -->
                    <td class="p-3.5 align-top max-w-[180px]">
                      <div
                        (click)="onOpenApp(app)"
                        class="font-bold text-slate-900 hover:text-blue-700 cursor-pointer text-xs leading-snug"
                      >
                        {{ app.studentName }}
                      </div>
                      <div class="flex items-center space-x-1.5 mt-1">
                        <span
                          class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 leading-none"
                        >
                          {{ app.category || 'General' }}
                        </span>
                        <span class="text-[10px] text-slate-400">
                          {{ app.gender }}
                        </span>
                      </div>
                    </td>

                    <!-- Institute & Course -->
                    <td class="p-3.5 align-top max-w-[220px]">
                      <div
                        class="font-semibold text-slate-900 text-xs leading-snug truncate"
                        [title]="app.instituteName"
                      >
                        {{ app.instituteName }}
                      </div>
                      <div
                        class="text-[11px] text-slate-500 mt-0.5 truncate"
                        [title]="app.courseName"
                      >
                        {{ app.courseName }}
                      </div>
                    </td>

                    <!-- Marks % -->
                    <td class="p-3.5 align-top">
                      <div
                        [class]="
                          app.lastQualificationMarks >= 60 ? 'text-emerald-800' : 'text-rose-700'
                        "
                        class="font-mono font-bold text-xs"
                      >
                        {{ app.lastQualificationMarks }}%
                      </div>
                      <div class="text-[10px] text-slate-400">
                        {{ app.lastQualificationMarks >= 60 ? 'Cutoff Met' : 'Below 60%' }}
                      </div>
                    </td>

                    <!-- Income -->
                    <td class="p-3.5 align-top">
                      <div
                        [class]="app.annualIncome <= 250000 ? 'text-slate-900' : 'text-rose-700'"
                        class="font-bold text-xs"
                      >
                        {{ formatCurrency(app.annualIncome) }}
                      </div>
                      <div class="text-[10px] text-slate-400">
                        {{ app.annualIncome <= 250000 ? 'Eligible' : 'Exceeds 2.5L' }}
                      </div>
                    </td>

                    <!-- Bank Account & IFSC -->
                    <td class="p-3.5 align-top">
                      <div class="font-mono text-slate-900 font-bold text-xs">
                        {{ app.bankAccountNumber }}
                      </div>
                      <div class="font-mono text-blue-700 text-[10px] font-semibold">
                        {{ app.ifscCode }}
                      </div>
                    </td>

                    <!-- Presigned Docs Buttons -->
                    <td class="p-3.5 align-top text-center">
                      <div class="inline-flex items-center space-x-1">
                        <button
                          (click)="onInspectDoc(app, 'INCOME')"
                          class="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200 text-xs transition-colors cursor-pointer"
                          title="View Income Certificate"
                        >
                          <i class="pi pi-indian-rupee text-[10px] leading-none"></i>
                        </button>
                        <button
                          (click)="onInspectDoc(app, 'MARKSHEET')"
                          class="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded border border-blue-200 text-xs transition-colors cursor-pointer"
                          title="View Marksheet"
                        >
                          <i class="pi pi-file text-[10px] leading-none"></i>
                        </button>
                        <button
                          (click)="onInspectDoc(app, 'BANK_PASSBOOK')"
                          class="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded border border-purple-200 text-xs transition-colors cursor-pointer"
                          title="View Bank Passbook"
                        >
                          <i class="pi pi-building text-[10px] leading-none"></i>
                        </button>
                      </div>
                    </td>

                    <!-- Status -->
                    <td class="p-3.5 align-top">
                      <span
                        [class]="getStatusConfig(app.status).badgeClass"
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap"
                      >
                        <span
                          [class]="getStatusConfig(app.status).dotClass"
                          class="w-1.5 h-1.5 rounded-full mr-1.5"
                        ></span>
                        {{ getStatusConfig(app.status).label }}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="p-3.5 align-top text-right">
                      <div class="flex items-center justify-end space-x-1.5">
                        @if (app.status === ApplicationStatus.INSTITUTE_VERIFIED) {
                          <button
                            (click)="approveSingle(app.applicationId)"
                            class="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-bold shadow-xs transition-colors inline-flex items-center space-x-1 cursor-pointer"
                            title="Approve ₹60,000 Scholarship Sanction"
                          >
                            <i class="pi pi-check text-xs leading-none"></i>
                            <span>Approve ₹60k</span>
                          </button>
                        }

                        @if (app.status === ApplicationStatus.ADMIN_APPROVED) {
                          <button
                            (click)="disburseSingle(app.applicationId)"
                            class="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-[11px] font-bold shadow-xs transition-colors inline-flex items-center space-x-1 cursor-pointer"
                            title="Disburse ₹60,000 via DBT"
                          >
                            <i class="pi pi-send text-xs leading-none"></i>
                            <span>Disburse DBT</span>
                          </button>
                        }

                        <button
                          (click)="onOpenApp(app)"
                          class="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="View Application Dossier"
                        >
                          <i class="pi pi-eye text-xs leading-none"></i>
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
          [totalItems]="filteredApplications().length"
          (pageChange)="currentPage.set($event)"
          (pageSizeChange)="pageSize.set($event)"
          [pageSizeOptions]="[5, 10, 20, 50]"
        ></app-pagination>
      </div>
    </div>
  `,
})
export class ApplicationsViewComponent implements OnInit {
  readonly service = inject(PortalService);
  private apiService = inject(Apiservice);
  readonly applications = input.required<ScholarshipApplicationDto[]>();
  readonly openApplication = output<ScholarshipApplicationDto>();
  readonly viewDocument = output<{ app: ScholarshipApplicationDto; type: DocType }>();

  readonly selectedStatusTab = signal<string>(ApplicationStatus.INSTITUTE_VERIFIED);
  readonly searchQuery = signal<string>('');
  readonly selectedInstituteFilter = signal<string>('ALL');
  readonly marksFilter = signal<string>('ALL');
  readonly incomeFilter = signal<string>('ALL');
  readonly selectedAppIds = signal<number[]>([]);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  readonly ApplicationStatus = ApplicationStatus;
  readonly getStatusConfig = getStatusConfig;
  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;

  ngOnInit(): void {
    this.fetchApplications();
  }

  fetchApplications(statusFilter?: ApplicationStatus): void {
    Notiflix.Loading.pulse('Fetching applications...');
    this.apiService.getApplicationsList(statusFilter).subscribe({
      next: (res) => {
        console.log('Fetching application list response', res);
        Notiflix.Loading.remove();
      },
      error: (err) => {
        console.log(err);
        Notiflix.Loading.remove();
      },
    });
  }

  readonly distinctInstitutes = computed(() => {
    return Array.from(new Set(this.applications().map((a) => a.instituteName))).sort();
  });

  readonly statusCounts = computed(() => {
    const list = this.applications();
    return {
      INSTITUTE_VERIFIED: list.filter((a) => a.status === ApplicationStatus.INSTITUTE_VERIFIED)
        .length,
      ADMIN_APPROVED: list.filter((a) => a.status === ApplicationStatus.ADMIN_APPROVED).length,
      DISBURSED: list.filter((a) => a.status === ApplicationStatus.DISBURSED).length,
      ADMIN_REJECTED: list.filter((a) => a.status === ApplicationStatus.ADMIN_REJECTED).length,
    };
  });

  readonly filteredApplications = computed(() => {
    return this.applications().filter((app) => {
      // 1. Status tab
      if (this.selectedStatusTab() !== 'ALL' && app.status !== this.selectedStatusTab()) {
        return false;
      }

      // 2. Institute filter
      if (
        this.selectedInstituteFilter() !== 'ALL' &&
        app.instituteName !== this.selectedInstituteFilter()
      ) {
        return false;
      }

      // 3. Marks filter
      if (this.marksFilter() === 'ABOVE_80' && app.lastQualificationMarks < 80) return false;
      if (
        this.marksFilter() === 'BETWEEN_60_80' &&
        (app.lastQualificationMarks < 60 || app.lastQualificationMarks >= 80)
      )
        return false;
      if (this.marksFilter() === 'BELOW_60' && app.lastQualificationMarks >= 60) return false;

      // 4. Income filter
      if (this.incomeFilter() === 'BELOW_1L' && app.annualIncome > 100000) return false;
      if (
        this.incomeFilter() === 'BETWEEN_1L_2_5L' &&
        (app.annualIncome <= 100000 || app.annualIncome > 250000)
      )
        return false;
      if (this.incomeFilter() === 'ABOVE_2_5L' && app.annualIncome <= 250000) return false;

      // 5. Search query
      if (this.searchQuery()) {
        const q = this.searchQuery().toLowerCase();
        const matchesName = app.studentName.toLowerCase().includes(q);
        const matchesId = app.applicationId.toString().includes(q);
        const matchesRoll = app.lastQualificationExamRollNo.toLowerCase().includes(q);
        const matchesInst = app.instituteName.toLowerCase().includes(q);
        const matchesBank = app.bankAccountNumber.includes(q);
        if (!matchesName && !matchesId && !matchesRoll && !matchesInst && !matchesBank) {
          return false;
        }
      }

      return true;
    });
  });

  readonly totalPages = computed(
    () => Math.ceil(this.filteredApplications().length / this.pageSize()) || 1,
  );

  readonly paginatedApplications = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredApplications().slice(start, start + this.pageSize());
  });

  handleStatusTabChange(tab: string) {
    this.selectedStatusTab.set(tab);
    this.currentPage.set(1);
    this.selectedAppIds.set([]);
  }

  handleSearchChange(q: string) {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  handleInstituteFilterChange(inst: string) {
    this.selectedInstituteFilter.set(inst);
    this.currentPage.set(1);
  }

  handleMarksFilterChange(m: string) {
    this.marksFilter.set(m);
    this.currentPage.set(1);
  }

  handleIncomeFilterChange(inc: string) {
    this.incomeFilter.set(inc);
    this.currentPage.set(1);
  }

  isSelected(id: number): boolean {
    return this.selectedAppIds().includes(id);
  }

  isAllSelected(): boolean {
    const list = this.filteredApplications();
    return list.length > 0 && list.every((a) => this.selectedAppIds().includes(a.applicationId));
  }

  toggleSelect(id: number) {
    this.selectedAppIds.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  handleSelectAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedAppIds.set(this.filteredApplications().map((a) => a.applicationId));
    } else {
      this.selectedAppIds.set([]);
    }
  }

  bulkApprove() {
    const selected = this.applications().filter(
      (a) =>
        this.selectedAppIds().includes(a.applicationId) &&
        a.status === ApplicationStatus.INSTITUTE_VERIFIED,
    );
    if (selected.length === 0) return;

    selected.forEach((app) => {
      this.service.approveApplication(
        app.applicationId,
        FIXED_SCHOLARSHIP_AMOUNT,
        'Bulk Govt Sanction order approved under Directorate technical/higher education scheme.',
      );
    });
    this.selectedAppIds.set([]);
  }

  approveSingle(id: number) {
    this.service.approveApplication(
      id,
      FIXED_SCHOLARSHIP_AMOUNT,
      'Direct one-time scholarship sanction granted by Directorate.',
    );
  }

  disburseSingle(id: number) {
    this.service.disburseSingle(id);
  }

  onOpenApp(app: ScholarshipApplicationDto) {
    this.openApplication.emit(app);
  }

  onInspectDoc(app: ScholarshipApplicationDto, type: DocType) {
    this.viewDocument.emit({ app, type });
  }
}
