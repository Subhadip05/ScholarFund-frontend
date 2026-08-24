import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalService } from '../../../shared/portal.service';
import { ApplicationStatus, DocType, ScholarshipApplicationDto } from '../../../shared/types';
import {
  FIXED_SCHOLARSHIP_AMOUNT,
  formatCurrency,
  formatDate,
  getStatusConfig,
} from '../../../shared/utils/formatters';

@Component({
  selector: 'app-application-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (application(); as app) {
      <div
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      >
        <div
          class="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        >
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold font-mono"
              >
                #{{ app.applicationId }}
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-mono text-slate-400"
                    >Application #{{ app.applicationId }}</span
                  >
                  <span
                    [class]="getStatusConfig(app.status).badgeClass"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                  >
                    <span
                      [class]="getStatusConfig(app.status).dotClass"
                      class="w-1.5 h-1.5 rounded-full mr-1.5"
                    ></span>
                    {{ getStatusConfig(app.status).label }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold"
                  >
                    Fixed Grant: ₹60,000
                  </span>
                </div>
                <h2 class="text-lg font-bold text-white mt-0.5">{{ app.studentName }}</h2>
              </div>
            </div>

            <button
              (click)="onClose()"
              class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <i class="pi pi-times text-base"></i>
            </button>
          </div>

          <!-- Tab Navigation -->
          <div class="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
            <button
              (click)="activeTab.set('DETAILS')"
              [class]="
                activeTab() === 'DETAILS'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-xs font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              "
              class="py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <i class="pi pi-user text-xs"></i>
              <span>Applicant & Bank Details</span>
            </button>
            <button
              (click)="activeTab.set('DOCUMENTS')"
              [class]="
                activeTab() === 'DOCUMENTS'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-xs font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              "
              class="py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <i class="pi pi-file-check text-xs"></i>
              <span>Mandatory Documents (4)</span>
            </button>
            <button
              (click)="activeTab.set('TIMELINE')"
              [class]="
                activeTab() === 'TIMELINE'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-xs font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              "
              class="py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <i class="pi pi-history text-xs"></i>
              <span>Audit Timeline ({{ app.timeline.length }})</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            <!-- TAB 1: DETAILS -->
            @if (activeTab() === 'DETAILS') {
              <div class="space-y-5">
                <!-- Top Quick Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div class="text-xs text-slate-500 font-medium">Scholarship Grant</div>
                    <div class="text-xl font-bold text-emerald-800 mt-1 font-mono">₹60,000</div>
                    <div class="mt-1 text-[11px] font-semibold text-emerald-700">
                      Fixed One-Time Grant
                    </div>
                  </div>

                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div class="text-xs text-slate-500 font-medium">Annual Family Income</div>
                    <div class="text-lg font-bold text-slate-900 mt-1">
                      {{ formatCurrency(app.annualIncome) }}
                    </div>
                    <div class="mt-1 flex items-center text-xs">
                      @if (app.annualIncome <= 250000) {
                        <span class="text-emerald-700 font-medium flex items-center">
                          <i class="pi pi-check-circle mr-1 text-xs"></i> ≤ ₹2.5L Eligible
                        </span>
                      } @else {
                        <span class="text-rose-700 font-medium flex items-center">
                          <i class="pi pi-exclamation-triangle mr-1 text-xs"></i> Exceeds ₹2.5L
                        </span>
                      }
                    </div>
                  </div>

                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div class="text-xs text-slate-500 font-medium">Qualifying Marks</div>
                    <div class="text-lg font-bold text-blue-700 mt-1">
                      {{ app.lastQualificationMarks }}%
                    </div>
                    <div class="mt-1 flex items-center text-xs">
                      @if (app.lastQualificationMarks >= 60) {
                        <span class="text-emerald-700 font-medium flex items-center">
                          <i class="pi pi-check-circle mr-1 text-xs"></i> ≥ 60% Cutoff Passed
                        </span>
                      } @else {
                        <span class="text-rose-700 font-medium flex items-center">
                          <i class="pi pi-exclamation-triangle mr-1 text-xs"></i> Below 60% Cutoff
                        </span>
                      }
                    </div>
                  </div>

                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div class="text-xs text-slate-500 font-medium">DBT Bank Account</div>
                    <div class="text-xs font-bold text-slate-900 mt-1 font-mono">
                      {{ app.bankAccountNumber }}
                    </div>
                    <div class="mt-1 text-[11px] text-blue-700 font-mono font-semibold">
                      {{ app.ifscCode }}
                    </div>
                  </div>
                </div>

                <!-- Academic & Banking Details Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <h3
                      class="text-sm font-bold text-slate-900 flex items-center mb-4 pb-2 border-b border-slate-100"
                    >
                      <i class="pi pi-graduation-cap mr-2 text-blue-600 text-sm"></i>
                      Enrolled Institute & Academic Details
                    </h3>

                    <dl class="grid grid-cols-1 gap-3 text-xs">
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">Institute:</dt>
                        <dd class="col-span-2 text-slate-900 font-semibold">
                          {{ app.instituteName }}
                        </dd>
                      </div>
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">College Code:</dt>
                        <dd class="col-span-2 font-mono text-slate-800">
                          {{ app.instituteCollegeCode || 'N/A' }}
                        </dd>
                      </div>
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">Course:</dt>
                        <dd class="col-span-2 text-blue-900 font-semibold">{{ app.courseName }}</dd>
                      </div>
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">Academic Year:</dt>
                        <dd class="col-span-2 text-slate-800">{{ app.academicYear }}</dd>
                      </div>
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">Exam Roll No:</dt>
                        <dd class="col-span-2 font-mono text-slate-800">
                          {{ app.lastQualificationExamRollNo }}
                        </dd>
                      </div>
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">Board / Council:</dt>
                        <dd class="col-span-2 text-slate-800">{{ app.passOutBoardName }}</dd>
                      </div>
                    </dl>
                  </div>

                  <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <h3
                      class="text-sm font-bold text-slate-900 flex items-center mb-4 pb-2 border-b border-slate-100"
                    >
                      <i class="pi pi-building mr-2 text-emerald-600 text-sm"></i>
                      Direct Benefit Transfer (DBT) Seeding
                    </h3>

                    <dl class="grid grid-cols-1 gap-3 text-xs">
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">Beneficiary Name:</dt>
                        <dd class="col-span-2 text-slate-900 font-semibold">
                          {{ app.studentName }}
                        </dd>
                      </div>
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">Bank Name:</dt>
                        <dd class="col-span-2 text-slate-800 font-medium">
                          {{ app.bankName || 'Scheduled Bank' }}
                        </dd>
                      </div>
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">Account Number:</dt>
                        <dd class="col-span-2 font-mono font-bold text-slate-900">
                          {{ app.bankAccountNumber }}
                        </dd>
                      </div>
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">IFSC Code:</dt>
                        <dd class="col-span-2 font-mono text-blue-700 font-semibold">
                          {{ app.ifscCode }}
                        </dd>
                      </div>
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">Branch Location:</dt>
                        <dd class="col-span-2 text-slate-800">
                          {{ app.branchName || 'Main Branch' }}
                        </dd>
                      </div>
                      <div class="grid grid-cols-3">
                        <dt class="text-slate-500 font-medium">Category / Domicile:</dt>
                        <dd class="col-span-2 text-slate-800">
                          {{ app.category || 'General' }} • {{ app.district || 'Kolkata' }},
                          {{ app.state || 'West Bengal' }}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <!-- If Disbursed Banner -->
                @if (app.status === ApplicationStatus.DISBURSED) {
                  <div
                    class="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start space-x-3 text-xs"
                  >
                    <div class="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                      <i class="pi pi-send text-base"></i>
                    </div>
                    <div class="flex-1">
                      <h4 class="font-bold text-purple-950 text-sm">
                        Direct Benefit Transfer Successfully Disbursed
                      </h4>
                      <p class="mt-1 text-purple-800">
                        Fixed one-time grant of <strong>₹60,000</strong> was credited to student
                        bank account <strong>{{ app.bankAccountNumber }}</strong> ({{
                          app.ifscCode
                        }}).
                      </p>
                      <div class="mt-2 flex flex-wrap gap-4 text-xs font-mono">
                        <span
                          ><strong>UTR Ref:</strong>
                          {{ app.utrNumber || 'DBT2026IN8849102XQ' }}</span
                        >
                        <span
                          ><strong>Disbursed On:</strong>
                          {{ formatDate(app.disbursementDate) }}</span
                        >
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- TAB 2: DOCUMENTS -->
            @if (activeTab() === 'DOCUMENTS') {
              <div class="space-y-4">
                <div
                  class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-center justify-between"
                >
                  <span class="flex items-center font-medium">
                    <i class="pi pi-info-circle mr-2 text-blue-600"></i>
                    Mandatory candidate documents for statutory verification.
                  </span>
                  <span class="font-mono text-[11px] text-blue-700">AWS S3 Presigned URLs</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Doc 1: Income Certificate -->
                  <div
                    class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div class="flex items-center justify-between">
                        <div
                          class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold"
                        >
                          <i class="pi pi-indian-rupee text-sm"></i>
                        </div>
                        <span
                          class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                        >
                          Income: {{ formatCurrency(app.annualIncome) }}
                        </span>
                      </div>
                      <h4 class="font-bold text-slate-900 text-sm mt-3">
                        Family Income Certificate
                      </h4>
                      <p class="text-xs text-slate-500 mt-1">
                        Issued by Sub-Divisional / Block Revenue Officer (BDO/SDO).
                      </p>
                    </div>
                    <button
                      (click)="onViewDocument('INCOME')"
                      class="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <i class="pi pi-eye text-xs"></i>
                      <span>Inspect Income Certificate</span>
                    </button>
                  </div>

                  <!-- Doc 2: Marksheet -->
                  <div
                    class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div class="flex items-center justify-between">
                        <div
                          class="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold"
                        >
                          <i class="pi pi-file text-sm"></i>
                        </div>
                        <span
                          class="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                        >
                          {{ app.lastQualificationMarks }}% Marks
                        </span>
                      </div>
                      <h4 class="font-bold text-slate-900 text-sm mt-3">
                        10+2 Qualifying Marksheet
                      </h4>
                      <p class="text-xs text-slate-500 mt-1">
                        {{ app.passOutBoardName }} • Roll: {{ app.lastQualificationExamRollNo }}
                      </p>
                    </div>
                    <button
                      (click)="onViewDocument('MARKSHEET')"
                      class="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <i class="pi pi-eye text-xs"></i>
                      <span>Inspect Marksheet</span>
                    </button>
                  </div>

                  <!-- Doc 3: Bank Passbook -->
                  <div
                    class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div class="flex items-center justify-between">
                        <div
                          class="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold"
                        >
                          <i class="pi pi-building text-sm"></i>
                        </div>
                        <span
                          class="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono"
                        >
                          {{ app.ifscCode }}
                        </span>
                      </div>
                      <h4 class="font-bold text-slate-900 text-sm mt-3">Bank Passbook / Mandate</h4>
                      <p class="text-xs text-slate-500 mt-1">
                        A/C: {{ app.bankAccountNumber }} ({{ app.bankName || 'Scheduled Bank' }}).
                      </p>
                    </div>
                    <button
                      (click)="onViewDocument('BANK_PASSBOOK')"
                      class="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <i class="pi pi-eye text-xs"></i>
                      <span>Inspect Passbook</span>
                    </button>
                  </div>

                  <!-- Doc 4: Admission Receipt -->
                  <div
                    class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div class="flex items-center justify-between">
                        <div
                          class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold"
                        >
                          <i class="pi pi-receipt text-sm"></i>
                        </div>
                        <span
                          class="text-[11px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200"
                        >
                          Session {{ app.academicYear }}
                        </span>
                      </div>
                      <h4 class="font-bold text-slate-900 text-sm mt-3">Admission Fee Receipt</h4>
                      <p class="text-xs text-slate-500 mt-1">
                        Tuition deposit at {{ app.instituteName }} for {{ app.courseName }}.
                      </p>
                    </div>
                    <button
                      (click)="onViewDocument('ADMISSION_RECEIPT')"
                      class="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <i class="pi pi-eye text-xs"></i>
                      <span>Inspect Admission Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- TAB 3: TIMELINE -->
            @if (activeTab() === 'TIMELINE') {
              <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 class="text-sm font-bold text-slate-900 mb-6 flex items-center">
                  <i class="pi pi-history mr-2 text-blue-600"></i>
                  Complete Audit Trail & Lifecycle History
                </h3>

                <div
                  class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200"
                >
                  @for (step of app.timeline; track $index) {
                    <div class="relative group">
                      <div
                        class="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white text-[10px] font-bold"
                      >
                        {{ $index + 1 }}
                      </div>
                      <div
                        class="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all"
                      >
                        <div class="flex items-center justify-between flex-wrap gap-1">
                          <span class="font-bold text-slate-900 text-xs">{{
                            step.actionTaken
                          }}</span>
                          <span class="text-[11px] font-mono text-slate-400">{{
                            formatDate(step.actionTime)
                          }}</span>
                        </div>
                        <div class="text-[11px] text-blue-700 font-semibold mt-1">
                          By: {{ step.actionBy }} ({{ step.actorRole }})
                        </div>
                        <p
                          class="text-xs text-slate-600 mt-2 bg-white p-3 rounded-lg border border-slate-100 leading-relaxed"
                        >
                          "{{ step.remarks }}"
                        </p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Inline Action Forms -->
            @if (showApproveForm()) {
              <div class="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5 shadow-md">
                <h4 class="text-sm font-bold text-emerald-950 flex items-center mb-2">
                  <i class="pi pi-check-circle mr-2 text-emerald-600"></i>
                  Grant Government Scholarship Sanction (₹60,000)
                </h4>
                <p class="text-xs text-emerald-800 mb-3">
                  Authorizes fixed one-time scholarship of <strong>₹60,000</strong>. Status will
                  become <strong>ADMIN_APPROVED</strong> and queued for DBT transfer.
                </p>

                <div class="mb-3">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Official Administrative Remarks
                  </label>
                  <textarea
                    rows="2"
                    [(ngModel)]="remarks"
                    class="w-full px-3 py-2 border border-emerald-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter sanction order text..."
                  ></textarea>
                </div>

                <div class="flex justify-end space-x-2">
                  <button
                    (click)="showApproveForm.set(false)"
                    class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    (click)="submitApprove()"
                    class="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <i class="pi pi-check-circle"></i>
                    <span>Confirm Govt Sanction (₹60,000)</span>
                  </button>
                </div>
              </div>
            }

            @if (showRejectForm()) {
              <div class="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 shadow-md">
                <h4 class="text-sm font-bold text-rose-950 flex items-center mb-2">
                  <i class="pi pi-times-circle mr-2 text-rose-600"></i>
                  Reject Scholarship Application (Govt Directorate Level)
                </h4>
                <p class="text-xs text-rose-800 mb-3">
                  Select reason or provide remarks for statutory rejection.
                </p>

                <div class="mb-3">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Preset Rejection Grounds
                  </label>
                  <select
                    (change)="onPresetRejectChange($event)"
                    class="w-full px-3 py-2 border border-rose-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  >
                    <option value="">-- Choose Common Statutory Ground --</option>
                    <option
                      value="Annual family income exceeds scheme ceiling limit of ₹2,50,000 as per revenue records."
                    >
                      Income exceeds ₹2.5L ceiling
                    </option>
                    <option
                      value="10+2 Qualifying examination marks below the 60.0% mandatory cut-off benchmark."
                    >
                      Marks below 60.0% threshold
                    </option>
                    <option
                      value="Duplicate active scholarship grant detected on National Scholarship Portal (NSP)."
                    >
                      Duplicate scholarship detected
                    </option>
                    <option
                      value="Bank account is not Aadhaar seeded / NPCI mapper validation failed."
                    >
                      Bank mandate / Aadhaar seeding failed
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Official Rejection Remarks
                  </label>
                  <textarea
                    rows="2"
                    [(ngModel)]="rejectReason"
                    class="w-full px-3 py-2 border border-rose-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    placeholder="Explain why the scholarship is being rejected..."
                  ></textarea>
                </div>

                <div class="flex justify-end space-x-2">
                  <button
                    (click)="showRejectForm.set(false)"
                    class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    (click)="submitReject()"
                    class="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <i class="pi pi-times-circle"></i>
                    <span>Confirm Application Rejection</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Modal Action Bar -->
          <div
            class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0"
          >
            <div class="text-xs text-slate-500">
              @if (app.status === ApplicationStatus.INSTITUTE_VERIFIED) {
                <span class="text-blue-700 font-medium">
                  Action Required: Decide Govt Sanction Approval for fixed ₹60,000 grant.
                </span>
              }
              @if (app.status === ApplicationStatus.ADMIN_APPROVED) {
                <span class="text-emerald-800 font-medium">
                  Sanctioned (₹60,000): Ready for electronic DBT fund disbursement.
                </span>
              }
              @if (app.status === ApplicationStatus.DISBURSED) {
                <span class="text-purple-900 font-medium">
                  Fund Disbursed: ₹60,000 credited via PFMS Direct Benefit Transfer.
                </span>
              }
            </div>

            <div class="flex items-center space-x-3">
              @if (
                app.status === ApplicationStatus.INSTITUTE_VERIFIED &&
                !showApproveForm() &&
                !showRejectForm()
              ) {
                <button
                  (click)="showRejectForm.set(true)"
                  class="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <i class="pi pi-times-circle"></i>
                  <span>Reject</span>
                </button>
                <button
                  (click)="showApproveForm.set(true)"
                  class="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <i class="pi pi-check-circle"></i>
                  <span>Approve ₹60,000 Sanction</span>
                </button>
              }

              @if (app.status === ApplicationStatus.ADMIN_APPROVED) {
                <button
                  (click)="disburseSingle(app.applicationId)"
                  class="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <i class="pi pi-send"></i>
                  <span>Disburse ₹60,000 via DBT</span>
                </button>
              }

              <button
                (click)="onClose()"
                class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ApplicationDetailModalComponent {
  readonly service = inject(PortalService);
  readonly application = input<ScholarshipApplicationDto | null>(null);
  readonly close = output<void>();
  readonly viewDocument = output<DocType>();

  readonly activeTab = signal<'DETAILS' | 'DOCUMENTS' | 'TIMELINE'>('DETAILS');
  readonly showApproveForm = signal<boolean>(false);
  readonly showRejectForm = signal<boolean>(false);
  remarks = '';
  rejectReason = '';

  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;
  readonly getStatusConfig = getStatusConfig;
  readonly ApplicationStatus = ApplicationStatus;

  constructor() {
    effect(() => {
      const app = this.application();
      if (app) {
        this.remarks = `Statutory one-time scholarship grant of ₹60,000 approved for academic year ${app.academicYear}.`;
        this.showApproveForm.set(false);
        this.showRejectForm.set(false);
        this.rejectReason = '';
      }
    });
  }

  onClose() {
    this.close.emit();
  }

  onViewDocument(type: DocType) {
    this.viewDocument.emit(type);
  }

  onPresetRejectChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    if (val) this.rejectReason = val;
  }

  submitApprove() {
    const app = this.application();
    if (!app) return;
    this.service.approveApplication(app.applicationId, FIXED_SCHOLARSHIP_AMOUNT, this.remarks);
    this.showApproveForm.set(false);
    this.onClose();
  }

  submitReject() {
    const app = this.application();
    if (!app) return;
    this.service.rejectApplication(app.applicationId, this.rejectReason);
    this.showRejectForm.set(false);
    this.onClose();
  }

  disburseSingle(id: number) {
    this.service.disburseSingle(id);
    this.onClose();
  }
}
