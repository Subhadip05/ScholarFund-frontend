import { Component, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { PortalService } from '../../../shared/portal.service';
import { InstituteDto } from '../../../shared/types';
import { Apiservice } from '../../../shared/api/apiservice';
import Notiflix from 'notiflix';

@Component({
  selector: 'app-institutes-view',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="space-y-4">
      <!-- Quick Metrics Ribbon -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3"
        >
          <div
            class="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700"
          >
            <i class="pi pi-building-columns text-base leading-none"></i>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Total Registered Institutes</div>
            <div class="text-xl font-black text-slate-900 font-mono mt-0.5">
              {{ institutes().length }}
            </div>
          </div>
        </div>

        <div
          class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3"
        >
          <div
            class="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700"
          >
            <i class="pi pi-exclamation-triangle text-base leading-none"></i>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Pending Govt Clearance</div>
            <div class="text-xl font-black text-amber-800 font-mono mt-0.5">
              {{ pendingCount() }}
            </div>
          </div>
        </div>

        <div
          class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3"
        >
          <div
            class="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700"
          >
            <i class="pi pi-check-circle text-base leading-none"></i>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Govt Verified & Active</div>
            <div class="text-xl font-black text-emerald-800 font-mono mt-0.5">
              {{ verifiedCount() }}
            </div>
          </div>
        </div>
      </div>

      <!-- Filter and Tab Bar -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            class="flex space-x-1 border border-slate-200 p-1 rounded-lg bg-slate-50 self-start text-xs"
          >
            <button
              (click)="handleFilterTabChange('ALL')"
              [class]="
                filterTab() === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              "
              class="px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer"
            >
              All Institutes ({{ institutes().length }})
            </button>
            <button
              (click)="handleFilterTabChange('PENDING')"
              [class]="
                filterTab() === 'PENDING'
                  ? 'bg-amber-100 text-amber-900 shadow-xs font-bold'
                  : 'text-amber-800 hover:bg-amber-50'
              "
              class="px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Pending Govt Verification ({{ pendingCount() }})</span>
            </button>
            <button
              (click)="handleFilterTabChange('VERIFIED')"
              [class]="
                filterTab() === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-900 shadow-xs font-bold'
                  : 'text-emerald-800 hover:bg-emerald-50'
              "
              class="px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Verified & Active ({{ verifiedCount() }})</span>
            </button>
          </div>

          <div class="flex items-center space-x-2">
            <select
              [ngModel]="typeFilter()"
              (ngModelChange)="handleTypeFilterChange($event)"
              class="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Institution Types</option>
              <option value="GOVERNMENT">Government</option>
              <option value="CENTRAL_UNIVERSITY">Institute of National Importance</option>
              <option value="GOVT_AIDED">Govt-Aided</option>
              <option value="PRIVATE">Private Self-Financed</option>
            </select>
          </div>
        </div>

        <div class="relative">
          <i class="pi pi-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search institute name, college code, affiliating university, officer name..."
            [ngModel]="searchQuery()"
            (ngModelChange)="handleSearchChange($event)"
            class="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Institute List Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-900 text-white font-semibold">
                <th class="p-3.5">Code & AISHE</th>
                <th class="p-3.5">Institute Details</th>
                <th class="p-3.5">Affiliating University</th>
                <th class="p-3.5">Principal / Head</th>
                <th class="p-3.5">Scholarship Officer & Contact</th>
                <th class="p-3.5 text-center">Affiliation Doc</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5 text-right">Govt Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @if (paginatedInstitutes().length === 0) {
                <tr>
                  <td colSpan="8" class="p-12 text-center text-slate-500">
                    <i
                      class="pi pi-building-columns text-3xl text-slate-300 mx-auto mb-2 block"
                    ></i>
                    No institutes found matching the selected filter criteria.
                  </td>
                </tr>
              } @else {
                @for (inst of paginatedInstitutes(); track inst.profileId) {
                  <tr
                    [class]="!inst.isVerifyByGovt ? 'bg-amber-50/20' : ''"
                    class="hover:bg-slate-50/80 transition-colors"
                  >
                    <!-- Code & AISHE -->
                    <td class="p-3.5 align-top">
                      <div class="font-mono font-bold text-slate-900 text-xs">
                        {{ inst.collegeCode }}
                      </div>
                      <div class="text-[10px] text-slate-500 font-mono">
                        AISHE: {{ inst.aisheCode || 'C-6240' }}
                      </div>
                      <span
                        class="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase leading-none"
                      >
                        {{
                          inst.instituteType ? inst.instituteType.replace('_', ' ') : 'INSTITUTE'
                        }}
                      </span>
                    </td>

                    <!-- Institute Details -->
                    <td class="p-3.5 align-top max-w-[220px]">
                      <div
                        (click)="onOpenInst(inst)"
                        class="font-bold text-slate-900 hover:text-blue-700 cursor-pointer text-xs leading-snug"
                      >
                        {{ inst.instituteName }}
                      </div>
                      <div class="flex items-start text-[11px] text-slate-500 mt-1">
                        <i class="pi pi-map-marker mr-1 text-slate-400 text-xs mt-0.5 shrink-0"></i>
                        <span class="truncate" [title]="inst.address">{{ inst.address }}</span>
                      </div>
                    </td>

                    <!-- Affiliating University -->
                    <td class="p-3.5 align-top max-w-[180px]">
                      <div class="flex items-start text-xs text-slate-800 font-medium leading-snug">
                        <i
                          class="pi pi-graduation-cap mr-1 text-blue-600 text-xs mt-0.5 shrink-0"
                        ></i>
                        <span class="truncate" [title]="inst.universityAffiliation">{{
                          inst.universityAffiliation
                        }}</span>
                      </div>
                    </td>

                    <!-- Principal -->
                    <td class="p-3.5 align-top">
                      <div class="font-semibold text-slate-800 text-xs">
                        {{ inst.principalName }}
                      </div>
                      <div class="text-[10px] text-slate-400">Head of Institution</div>
                    </td>

                    <!-- Scholarship Officer & Contact -->
                    <td class="p-3.5 align-top">
                      <div class="font-semibold text-slate-800 text-xs">{{ inst.officerName }}</div>
                      <div class="text-[10px] text-slate-500 font-mono">
                        {{ inst.officerPhoneNo }}
                      </div>
                      <div
                        class="text-[10px] text-blue-700 font-mono truncate max-w-[160px]"
                        [title]="inst.email"
                      >
                        {{ inst.email }}
                      </div>
                    </td>

                    <!-- Affiliation Certificate -->
                    <td class="p-3.5 align-top text-center">
                      <button
                        (click)="onViewCert(inst)"
                        class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[11px] font-semibold transition-colors inline-flex items-center space-x-1 border border-slate-200 cursor-pointer"
                        title="View Official Affiliation Certificate"
                      >
                        <i class="pi pi-file text-blue-600 text-xs leading-none"></i>
                        <span>Certificate</span>
                      </button>
                    </td>

                    <!-- Status -->
                    <td class="p-3.5 align-top">
                      <span
                        [class]="
                          inst.isVerifyByGovt
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                        "
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap"
                      >
                        {{ inst.isVerifyByGovt ? 'Govt Verified' : 'Verification Needed' }}
                      </span>
                    </td>

                    <!-- Govt Action -->
                    <td class="p-3.5 align-top text-right">
                      <div class="flex items-center justify-end space-x-1.5">
                        @if (!inst.isVerifyByGovt) {
                          <button
                            (click)="verifyInst(inst.profileId)"
                            class="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-bold shadow-xs transition-colors inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <i class="pi pi-check text-xs leading-none"></i>
                            <span>Verify & Approve</span>
                          </button>
                        } @else {
                          <button
                            (click)="revokeInst(inst.profileId)"
                            class="px-2 py-1 text-rose-700 hover:bg-rose-50 rounded-md text-[11px] font-semibold transition-colors border border-rose-200 cursor-pointer"
                          >
                            Revoke
                          </button>
                        }

                        <button
                          (click)="onOpenInst(inst)"
                          class="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="View Full Institute Profile"
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
          [totalItems]="filteredInstitutes().length"
          (pageChange)="currentPage.set($event)"
          (pageSizeChange)="pageSize.set($event)"
          [pageSizeOptions]="[5, 10, 20, 50]"
        ></app-pagination>
      </div>
    </div>
  `,
})
export class InstitutesViewComponent implements OnInit {
  readonly service = inject(PortalService);
  private apiService = inject(Apiservice);
  readonly institutes = input.required<InstituteDto[]>();
  readonly openInstitute = output<InstituteDto>();
  readonly viewCertificate = output<InstituteDto>();

  readonly filterTab = signal<'ALL' | 'PENDING' | 'VERIFIED'>('ALL');
  readonly searchQuery = signal<string>('');
  readonly typeFilter = signal<string>('ALL');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  ngOnInit(): void {
    this.fetchUnverifiedInstitutes();
  }

  fetchUnverifiedInstitutes(): void {
    Notiflix.Loading.pulse('Fetching applications...');
    this.apiService.getUnverifiedInstitutes().subscribe({
      next: (res) => {
        console.log('Fetching unverified Institutes list response', res);
        Notiflix.Loading.remove();
      },
      error: (err) => {
        console.log(err);
        Notiflix.Loading.remove();
      },
    });
  }

  readonly pendingCount = computed(() => this.institutes().filter((i) => !i.isVerifyByGovt).length);
  readonly verifiedCount = computed(() => this.institutes().filter((i) => i.isVerifyByGovt).length);

  readonly filteredInstitutes = computed(() => {
    return this.institutes().filter((inst) => {
      if (this.filterTab() === 'PENDING' && inst.isVerifyByGovt) return false;
      if (this.filterTab() === 'VERIFIED' && !inst.isVerifyByGovt) return false;

      if (this.typeFilter() !== 'ALL' && inst.instituteType !== this.typeFilter()) return false;

      if (this.searchQuery()) {
        const q = this.searchQuery().toLowerCase();
        const matchesName = inst.instituteName.toLowerCase().includes(q);
        const matchesCode = inst.collegeCode.toLowerCase().includes(q);
        const matchesUni = inst.universityAffiliation.toLowerCase().includes(q);
        const matchesOfficer = inst.officerName.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesUni && !matchesOfficer) {
          return false;
        }
      }

      return true;
    });
  });

  readonly totalPages = computed(
    () => Math.ceil(this.filteredInstitutes().length / this.pageSize()) || 1,
  );

  readonly paginatedInstitutes = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredInstitutes().slice(start, start + this.pageSize());
  });

  handleFilterTabChange(tab: 'ALL' | 'PENDING' | 'VERIFIED') {
    this.filterTab.set(tab);
    this.currentPage.set(1);
  }

  handleTypeFilterChange(type: string) {
    this.typeFilter.set(type);
    this.currentPage.set(1);
  }

  handleSearchChange(q: string) {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  verifyInst(id: number) {
    this.service.verifyInstitute(
      id,
      'AISHE credentials and statutory university affiliation verified by Directorate.',
    );
  }

  revokeInst(id: number) {
    this.service.revokeInstitute(
      id,
      'Verification revoked pending annual AISHE re-accreditation check.',
    );
  }

  onOpenInst(inst: InstituteDto) {
    this.openInstitute.emit(inst);
  }

  onViewCert(inst: InstituteDto) {
    this.viewCertificate.emit(inst);
  }
}
