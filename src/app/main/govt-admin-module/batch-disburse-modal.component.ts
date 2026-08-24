import { Component, input, output, signal, effect, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalService } from '../../../shared/portal.service';
import { ScholarshipApplicationDto } from '../../../shared/types';
import {
  FIXED_SCHOLARSHIP_AMOUNT,
  formatCurrency,
  generateUTR,
} from '../../../shared/utils/formatters';

interface DisburseResult {
  id: number;
  studentName: string;
  amount: number;
  utr: string;
  status: 'SUCCESS' | 'FAILED';
}

@Component({
  selector: 'app-batch-disburse-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      >
        <div
          class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        >
          <!-- Modal Header -->
          <div
            class="px-6 py-4 bg-purple-950 text-white flex items-center justify-between shrink-0"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-xl bg-purple-800/60 border border-purple-400/40 flex items-center justify-center text-purple-200 font-bold"
              >
                <i class="pi pi-send text-base"></i>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-bold text-purple-300 uppercase tracking-wider"
                    >PFMS Electronic Treasury Gateway</span
                  >
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-800/80 text-purple-200 border border-purple-500/30"
                  >
                    Direct Benefit Transfer (DBT)
                  </span>
                </div>
                <h2 class="text-base font-bold text-white mt-0.5">
                  Bulk DBT Scholarship Disbursal Console
                </h2>
              </div>
            </div>

            @if (currentPhase() === 'CONFIRM' || currentPhase() === 'COMPLETED') {
              <button
                (click)="onClose()"
                class="p-2 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-lg transition-colors cursor-pointer"
              >
                <i class="pi pi-times text-base"></i>
              </button>
            }
          </div>

          <!-- Modal Body -->
          <div class="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50 text-xs">
            <!-- PHASE 1: CONFIRMATION -->
            @if (currentPhase() === 'CONFIRM') {
              <div class="space-y-4">
                <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 text-purple-950">
                  <h4 class="font-bold text-sm flex items-center">
                    <i class="pi pi-info-circle mr-2 text-purple-700"></i>
                    Review Direct Benefit Transfer Batch
                  </h4>
                  <p class="mt-1 text-purple-800 leading-relaxed">
                    You are about to authorize electronic funds transfer of fixed ₹60,000 grants
                    directly to the validated student bank accounts.
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div class="text-slate-500 font-medium">Selected Beneficiaries</div>
                    <div class="text-2xl font-bold text-slate-900 mt-1 font-mono">
                      {{ applications().length }}
                      <span class="text-xs font-normal text-slate-500">Students</span>
                    </div>
                  </div>
                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div class="text-slate-500 font-medium">Total Disbursal Liability</div>
                    <div class="text-2xl font-bold text-purple-900 mt-1 font-mono">
                      {{ formatCurrency(totalAmount()) }}
                    </div>
                  </div>
                </div>

                <!-- Beneficiary Preview Table -->
                <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div
                    class="px-4 py-2.5 bg-slate-100 font-bold text-slate-700 border-b border-slate-200"
                  >
                    Recipient Bank Manifest Preview ({{ applications().length }})
                  </div>
                  <div class="max-h-[180px] overflow-y-auto divide-y divide-slate-100">
                    @for (app of applications(); track app.applicationId) {
                      <div
                        class="px-4 py-2 flex items-center justify-between text-[11px] hover:bg-slate-50"
                      >
                        <div>
                          <strong class="text-slate-900 block">{{ app.studentName }}</strong>
                          <span class="font-mono text-slate-500"
                            >A/C: {{ app.bankAccountNumber }} ({{ app.ifscCode }})</span
                          >
                        </div>
                        <span
                          class="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200"
                        >
                          {{ formatCurrency(app.sanctionAmount || FIXED_SCHOLARSHIP_AMOUNT) }}
                        </span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- PHASE 2: PROCESSING ANIMATION -->
            @if (currentPhase() === 'PROCESSING') {
              <div class="py-10 px-4 text-center space-y-6">
                <div
                  class="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto animate-pulse"
                >
                  <i class="pi pi-spin pi-spinner text-3xl"></i>
                </div>

                <div>
                  <h3 class="text-base font-bold text-slate-900">
                    PFMS Electronic Disbursal in Progress...
                  </h3>
                  <p class="text-slate-500 text-xs mt-1">{{ progressStatus() }}</p>
                </div>

                <!-- Progress Bar -->
                <div class="max-w-md mx-auto space-y-1.5">
                  <div class="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      class="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-300 rounded-full"
                      [style.width]="progressPercent() + '%'"
                    ></div>
                  </div>
                  <div class="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>Transmitting to RBI Gateway</span>
                    <span>{{ progressPercent() }}%</span>
                  </div>
                </div>
              </div>
            }

            <!-- PHASE 3: COMPLETED REPORT -->
            @if (currentPhase() === 'COMPLETED') {
              <div class="space-y-4">
                <div
                  class="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-950 flex items-start space-x-3"
                >
                  <i class="pi pi-check-circle text-emerald-600 text-xl mt-0.5"></i>
                  <div>
                    <h4 class="font-bold text-sm">
                      Direct Benefit Transfer Successfully Disbursed!
                    </h4>
                    <p class="text-emerald-800 text-xs mt-1">
                      PFMS Treasury has cleared
                      <strong>{{ formatCurrency(totalAmount()) }}</strong> for
                      <strong>{{ applications().length }}</strong> beneficiaries. Real-time UTR
                      tracking codes have been issued.
                    </p>
                  </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div
                    class="px-4 py-2.5 bg-slate-100 font-bold text-slate-700 border-b border-slate-200 flex justify-between"
                  >
                    <span>Generated RBI UTR Reference Ledger</span>
                    <span class="font-mono text-emerald-700">{{ results().length }} Success</span>
                  </div>
                  <div class="max-h-[220px] overflow-y-auto divide-y divide-slate-100">
                    @for (item of results(); track item.id) {
                      <div
                        class="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50"
                      >
                        <div>
                          <span class="font-bold text-slate-900 block">{{ item.studentName }}</span>
                          <span class="font-mono text-[11px] text-blue-700"
                            >UTR: {{ item.utr }}</span
                          >
                        </div>
                        <div class="text-right">
                          <span class="font-mono font-bold text-slate-900 block">{{
                            formatCurrency(item.amount)
                          }}</span>
                          <span
                            class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200"
                          >
                            CREDITED
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Modal Action Bar -->
          <div
            class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0"
          >
            @if (currentPhase() === 'CONFIRM') {
              <button
                (click)="onClose()"
                class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                (click)="startDisbursement()"
                class="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <i class="pi pi-send"></i>
                <span>Authorize DBT Transfer ({{ formatCurrency(totalAmount()) }})</span>
              </button>
            }

            @if (currentPhase() === 'COMPLETED') {
              <div class="text-xs text-slate-500">
                Transaction audit log registered in state treasury repository.
              </div>
              <button
                (click)="onClose()"
                class="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class BatchDisburseModalComponent {
  readonly service = inject(PortalService);
  readonly isOpen = input<boolean>(false);
  readonly applications = input<ScholarshipApplicationDto[]>([]);
  readonly close = output<void>();

  readonly currentPhase = signal<'CONFIRM' | 'PROCESSING' | 'COMPLETED'>('CONFIRM');
  readonly progressPercent = signal<number>(0);
  readonly progressStatus = signal<string>('Initializing electronic transfer...');
  readonly results = signal<DisburseResult[]>([]);

  readonly formatCurrency = formatCurrency;
  readonly FIXED_SCHOLARSHIP_AMOUNT = FIXED_SCHOLARSHIP_AMOUNT;

  readonly totalAmount = computed(() =>
    this.applications().reduce(
      (sum, app) => sum + (app.sanctionAmount || FIXED_SCHOLARSHIP_AMOUNT),
      0,
    ),
  );

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.currentPhase.set('CONFIRM');
        this.progressPercent.set(0);
        this.results.set([]);
      }
    });
  }

  onClose() {
    this.close.emit();
  }

  startDisbursement() {
    this.currentPhase.set('PROCESSING');
    this.progressPercent.set(15);
    this.progressStatus.set('Validating bank routing & NPCI Aadhaar seeding...');

    setTimeout(() => {
      this.progressPercent.set(45);
      this.progressStatus.set('Generating RBI NEFT/RTGS payment XML batch...');

      setTimeout(() => {
        this.progressPercent.set(75);
        this.progressStatus.set('Signing cryptographic DSC payload with Directorate key...');

        setTimeout(() => {
          this.progressPercent.set(100);
          this.progressStatus.set('Settlement complete via PFMS Treasury Gateway.');

          // Generate results and execute state change
          const res: DisburseResult[] = this.applications().map((app) => ({
            id: app.applicationId,
            studentName: app.studentName,
            amount: app.sanctionAmount || FIXED_SCHOLARSHIP_AMOUNT,
            utr: generateUTR(),
            status: 'SUCCESS',
          }));
          this.results.set(res);

          const ids = this.applications().map((a) => a.applicationId);
          this.service.disburseBatch(ids);

          this.currentPhase.set('COMPLETED');
        }, 600);
      }, 700);
    }, 700);
  }
}
