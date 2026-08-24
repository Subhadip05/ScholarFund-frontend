import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstituteDto, ScholarshipApplicationDto } from '../../../shared/types';
import { formatCurrency, formatDateOnly } from '../../../shared/utils/formatters';

export type DocType =
  'INCOME' | 'MARKSHEET' | 'BANK_PASSBOOK' | 'ADMISSION_RECEIPT' | 'AFFILIATION_CERTIFICATE';

@Component({
  selector: 'app-document-viewer-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      >
        <div
          class="relative w-full max-w-4xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[92vh]"
        >
          <!-- Modal Header -->
          <div
            class="px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between shrink-0"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold"
              >
                <i class="pi pi-file-check text-base"></i>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-bold text-white uppercase tracking-wide">{{
                    getDocTitle()
                  }}</span>
                  <span
                    class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  >
                    S3 Presigned URL Active
                  </span>
                </div>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[400px]">
                  {{ getDocUrl() }}
                </div>
              </div>
            </div>

            <!-- Toolbar Controls -->
            <div class="flex items-center space-x-2">
              <div
                class="bg-slate-800 border border-slate-700 rounded-lg p-1 flex items-center space-x-1"
              >
                <button
                  (click)="zoomOut()"
                  class="p-1.5 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <i class="pi pi-search-minus text-xs"></i>
                </button>
                <span class="text-[11px] font-mono font-bold text-slate-300 px-1"
                  >{{ zoomLevel() }}%</span
                >
                <button
                  (click)="zoomIn()"
                  class="p-1.5 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <i class="pi pi-search-plus text-xs"></i>
                </button>
                <button
                  (click)="rotate()"
                  class="p-1.5 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border-l border-slate-700 pl-2 cursor-pointer"
                  title="Rotate 90°"
                >
                  <i class="pi pi-sync text-xs"></i>
                </button>
              </div>

              <button
                (click)="onClose()"
                class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                <i class="pi pi-times text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Document Rendering Canvas (Simulated High-Resolution Govt Certificate / Marksheet) -->
          <div
            class="flex-1 overflow-auto bg-slate-950 p-6 flex items-center justify-center min-h-[460px]"
          >
            <div
              [style.transform]="'scale(' + zoomLevel() / 100 + ') rotate(' + rotation() + 'deg)'"
              class="transition-transform duration-200 origin-center bg-white text-slate-900 rounded-xl shadow-2xl p-8 max-w-[640px] w-full border border-slate-300 select-none relative"
            >
              <!-- Watermark -->
              <div
                class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"
              >
                <div
                  class="text-7xl font-black text-slate-900 rotate-[-30deg] uppercase tracking-widest text-center"
                >
                  GOVERNMENT VERIFIED
                </div>
              </div>

              <!-- Content for INCOME Certificate -->
              @if (documentType() === 'INCOME') {
                <div class="border-4 border-double border-emerald-800/80 p-6 relative">
                  <div class="text-center pb-4 border-b-2 border-slate-800">
                    <div class="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                      Government of West Bengal • Directorate of Revenue
                    </div>
                    <h2 class="text-base font-extrabold text-slate-900 mt-1 uppercase">
                      Certificate of Annual Family Income
                    </h2>
                    <div class="text-[10px] font-mono text-slate-500 mt-0.5">
                      Govt Order Ref: REV/2026/INC-{{ application()?.applicationId }}
                    </div>
                  </div>

                  <div class="my-6 space-y-4 text-xs leading-relaxed text-slate-800">
                    <p>
                      This is to certify that as per revenue inquiry and land record verification,
                      <strong>{{ application()?.studentName }}</strong
                      >, resident of District
                      <strong>{{ application()?.district || 'Kolkata' }}</strong
                      >, has an aggregate annual family income of
                      <span
                        class="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded font-mono border border-emerald-300"
                      >
                        {{ formatCurrency(application()?.annualIncome) }}
                      </span>
                      (Rupees only) for the assessment year 2025-2026.
                    </p>
                    <p>
                      This certificate is issued exclusively for Higher Education Merit-cum-Means
                      Scholarship statutory entitlement.
                    </p>
                  </div>

                  <div
                    class="pt-6 border-t border-slate-300 flex justify-between items-end text-[10px]"
                  >
                    <div>
                      <div class="text-slate-500">
                        Issued On: {{ formatDateOnly(application()?.applicationDate) }}
                      </div>
                      <div class="font-mono text-slate-600">
                        Digital Seal: e-District Repository Validated
                      </div>
                    </div>
                    <div class="text-center">
                      <div
                        class="w-12 h-12 rounded-full border-2 border-dashed border-emerald-700 flex items-center justify-center text-emerald-800 mx-auto font-bold text-[9px]"
                      >
                        SEAL
                      </div>
                      <div class="font-bold text-slate-900 mt-1">Block Development Officer</div>
                      <div class="text-slate-500 text-[9px]">Govt of West Bengal</div>
                    </div>
                  </div>
                </div>
              }

              <!-- Content for MARKSHEET -->
              @if (documentType() === 'MARKSHEET') {
                <div class="border-4 border-blue-900/80 p-6 relative">
                  <div class="text-center pb-4 border-b-2 border-blue-900">
                    <div class="text-[10px] font-bold text-slate-600 uppercase">
                      {{ application()?.passOutBoardName }}
                    </div>
                    <h2 class="text-base font-extrabold text-blue-950 mt-1">
                      OFFICIAL SENIOR SECONDARY STATEMENT OF MARKS
                    </h2>
                    <div class="text-[10px] font-mono text-slate-500 mt-0.5">
                      Roll No: {{ application()?.lastQualificationExamRollNo }}
                    </div>
                  </div>

                  <div class="my-5 text-xs">
                    <div
                      class="grid grid-cols-2 gap-2 mb-4 bg-blue-50/50 p-2.5 rounded border border-blue-100 text-[11px]"
                    >
                      <div>
                        Candidate: <strong>{{ application()?.studentName }}</strong>
                      </div>
                      <div>
                        Stream: <strong>{{ application()?.lastQualificationCourse }}</strong>
                      </div>
                    </div>

                    <table class="w-full text-left border-collapse text-[11px] mb-4">
                      <thead>
                        <tr class="bg-blue-900 text-white">
                          <th class="p-1.5 border border-blue-900">Subject</th>
                          <th class="p-1.5 border border-blue-900 text-center">Max Marks</th>
                          <th class="p-1.5 border border-blue-900 text-center">Marks Obtained</th>
                          <th class="p-1.5 border border-blue-900 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="border-b border-slate-200">
                          <td class="p-1.5">Language I (English)</td>
                          <td class="p-1.5 text-center">100</td>
                          <td class="p-1.5 text-center font-bold">92</td>
                          <td class="p-1.5 text-center font-bold text-emerald-700">A1</td>
                        </tr>
                        <tr class="border-b border-slate-200">
                          <td class="p-1.5">Mathematics / Core Major</td>
                          <td class="p-1.5 text-center">100</td>
                          <td class="p-1.5 text-center font-bold">96</td>
                          <td class="p-1.5 text-center font-bold text-emerald-700">A1</td>
                        </tr>
                        <tr class="border-b border-slate-200">
                          <td class="p-1.5">Physical Sciences / Domain</td>
                          <td class="p-1.5 text-center">100</td>
                          <td class="p-1.5 text-center font-bold">94</td>
                          <td class="p-1.5 text-center font-bold text-emerald-700">A1</td>
                        </tr>
                        <tr class="border-b border-slate-200">
                          <td class="p-1.5">Elective Subject IV</td>
                          <td class="p-1.5 text-center">100</td>
                          <td class="p-1.5 text-center font-bold">91</td>
                          <td class="p-1.5 text-center font-bold text-emerald-700">A1</td>
                        </tr>
                      </tbody>
                    </table>

                    <div
                      class="flex justify-between items-center bg-blue-50 p-2.5 rounded-lg border border-blue-200"
                    >
                      <span class="font-bold text-slate-800">Aggregate Score:</span>
                      <span class="text-sm font-black text-blue-900 font-mono"
                        >{{ application()?.lastQualificationMarks }}% (PASSED FIRST DIVISION)</span
                      >
                    </div>
                  </div>

                  <div
                    class="pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-500"
                  >
                    <div>Authenticated via DigiLocker National Academic Depository</div>
                    <div class="font-bold text-slate-800">Controller of Examinations</div>
                  </div>
                </div>
              }

              <!-- Content for BANK PASSBOOK -->
              @if (documentType() === 'BANK_PASSBOOK') {
                <div class="border-2 border-slate-400 p-6 bg-amber-50/20">
                  <div class="pb-3 border-b border-slate-300 flex justify-between items-center">
                    <div>
                      <div class="text-sm font-black text-blue-950">
                        {{ application()?.bankName || 'State Bank of India' }}
                      </div>
                      <div class="text-[10px] text-slate-500">
                        {{ application()?.branchName || 'Main Institutional Branch' }}
                      </div>
                    </div>
                    <span
                      class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300"
                    >
                      PFMS DBT ACTIVE
                    </span>
                  </div>

                  <div class="my-5 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span class="text-slate-500 block text-[10px]">Beneficiary Name:</span>
                      <strong class="text-slate-900 text-sm">{{
                        application()?.studentName
                      }}</strong>
                    </div>
                    <div>
                      <span class="text-slate-500 block text-[10px]">Account Number:</span>
                      <strong class="font-mono text-slate-900 text-sm">{{
                        application()?.bankAccountNumber
                      }}</strong>
                    </div>
                    <div>
                      <span class="text-slate-500 block text-[10px]">IFSC Code:</span>
                      <strong class="font-mono text-blue-800">{{ application()?.ifscCode }}</strong>
                    </div>
                    <div>
                      <span class="text-slate-500 block text-[10px]">Aadhaar Seeding:</span>
                      <strong class="text-emerald-700">LINKED & SEEDED (NPCI MAPPER)</strong>
                    </div>
                  </div>

                  <div
                    class="pt-4 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between"
                  >
                    <span>Account Active • Zero Balance PMJDY/Student Account</span>
                    <span class="font-mono">MICR: 700002014</span>
                  </div>
                </div>
              }

              <!-- Content for ADMISSION RECEIPT -->
              @if (documentType() === 'ADMISSION_RECEIPT') {
                <div class="border-2 border-indigo-300 p-6">
                  <div class="text-center pb-3 border-b border-indigo-200">
                    <h3 class="font-black text-slate-900 text-sm">
                      {{ application()?.instituteName }}
                    </h3>
                    <div class="text-[11px] text-indigo-700 font-bold mt-0.5">
                      OFFICIAL TUITION & ENROLMENT DEPOSIT COUNTERFOIL
                    </div>
                    <div class="text-[10px] text-slate-400 font-mono">
                      Academic Year: {{ application()?.academicYear }}
                    </div>
                  </div>

                  <div class="my-4 text-xs space-y-2">
                    <div class="flex justify-between py-1 border-b border-slate-100">
                      <span class="text-slate-500">Student:</span>
                      <span class="font-bold text-slate-900">{{ application()?.studentName }}</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-slate-100">
                      <span class="text-slate-500">Course / Program:</span>
                      <span class="font-bold text-slate-900">{{ application()?.courseName }}</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-slate-100">
                      <span class="text-slate-500">College Code:</span>
                      <span class="font-mono text-slate-800">{{
                        application()?.instituteCollegeCode || 'N/A'
                      }}</span>
                    </div>
                    <div
                      class="flex justify-between py-1.5 bg-indigo-50 px-2 rounded font-bold text-indigo-950"
                    >
                      <span>Admission Deposit Amount:</span>
                      <span class="font-mono">₹12,500.00 (PAID)</span>
                    </div>
                  </div>

                  <div
                    class="pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between"
                  >
                    <span>Verified by College Registrar</span>
                    <span>Status: Enrolled Regular</span>
                  </div>
                </div>
              }

              <!-- Content for AFFILIATION CERTIFICATE -->
              @if (documentType() === 'AFFILIATION_CERTIFICATE') {
                <div class="border-4 border-slate-800 p-6 bg-amber-50/10">
                  <div class="text-center pb-4 border-b-2 border-slate-800">
                    <div class="text-[10px] font-bold text-slate-500 uppercase">
                      UNIVERSITY GRANTS COMMISSION • MINISTRY OF EDUCATION
                    </div>
                    <h2 class="text-base font-extrabold text-slate-900 mt-1">
                      CERTIFICATE OF STATUTORY AFFILIATION & ACCREDITATION
                    </h2>
                    <div class="text-[10px] font-mono text-slate-600 mt-0.5">
                      AISHE Code: {{ institute()?.aisheCode || 'C-6240' }}
                    </div>
                  </div>

                  <div class="my-5 text-xs leading-relaxed text-slate-800 space-y-3">
                    <p>
                      This is to certify that
                      <strong>{{ institute()?.instituteName }}</strong> (College Code:
                      <span class="font-mono font-bold">{{ institute()?.collegeCode }}</span
                      >), located at {{ institute()?.address }}, is affiliated to
                      <strong>{{ institute()?.universityAffiliation }}</strong>
                      under section 2(f) and 12(B) of the UGC Act, 1956.
                    </p>
                    <div
                      class="p-2.5 bg-slate-100 rounded border border-slate-200 text-[11px] grid grid-cols-2 gap-2"
                    >
                      <div>
                        Principal / Head: <strong>{{ institute()?.principalName }}</strong>
                      </div>
                      <div>
                        Nodal Officer: <strong>{{ institute()?.officerName }}</strong>
                      </div>
                      <div>
                        Type: <strong class="uppercase">{{ institute()?.instituteType }}</strong>
                      </div>
                      <div>
                        Clearance: <strong class="text-emerald-700">NAAC / AISHE VALID</strong>
                      </div>
                    </div>
                  </div>

                  <div
                    class="pt-4 border-t border-slate-300 flex justify-between text-[10px] text-slate-500"
                  >
                    <div>Directorate of Higher Education Record</div>
                    <div class="font-bold text-slate-900">Member Secretary, UGC</div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Modal Footer -->
          <div
            class="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400"
          >
            <span class="flex items-center space-x-1.5">
              <i class="pi pi-shield text-blue-400 text-xs"></i>
              <span
                >Statutory cryptographic signature verified against state educational data
                warehouse.</span
              >
            </span>
            <button
              (click)="onClose()"
              class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DocumentViewerModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly documentType = input<DocType>('INCOME');
  readonly application = input<ScholarshipApplicationDto | null>(null);
  readonly institute = input<InstituteDto | null>(null);
  readonly close = output<void>();

  readonly zoomLevel = signal<number>(100);
  readonly rotation = signal<number>(0);
  readonly formatCurrency = formatCurrency;
  readonly formatDateOnly = formatDateOnly;

  zoomIn() {
    this.zoomLevel.update((z) => Math.min(z + 15, 160));
  }

  zoomOut() {
    this.zoomLevel.update((z) => Math.max(z - 15, 60));
  }

  rotate() {
    this.rotation.update((r) => (r + 90) % 360);
  }

  onClose() {
    this.zoomLevel.set(100);
    this.rotation.set(0);
    this.close.emit();
  }

  getDocTitle(): string {
    switch (this.documentType()) {
      case 'INCOME':
        return 'BDO Family Income Certificate';
      case 'MARKSHEET':
        return 'Senior Secondary Qualifying Marksheet';
      case 'BANK_PASSBOOK':
        return 'PFMS Bank Mandate & Passbook';
      case 'ADMISSION_RECEIPT':
        return 'Institutional Admission Tuition Receipt';
      case 'AFFILIATION_CERTIFICATE':
        return 'UGC / AISHE Statutory Affiliation Certificate';
      default:
        return 'Government Support Document';
    }
  }

  getDocUrl(): string {
    const app = this.application();
    const inst = this.institute();
    switch (this.documentType()) {
      case 'INCOME':
        return app?.incomeCertificateUrl || 'https://scholarfund-s3.gov.in/presigned/income.pdf';
      case 'MARKSHEET':
        return app?.hsMarksheetUrl || 'https://scholarfund-s3.gov.in/presigned/marksheet.pdf';
      case 'BANK_PASSBOOK':
        return app?.bankPassbookUrl || 'https://scholarfund-s3.gov.in/presigned/passbook.pdf';
      case 'ADMISSION_RECEIPT':
        return app?.admissionReceiptUrl || 'https://scholarfund-s3.gov.in/presigned/receipt.pdf';
      case 'AFFILIATION_CERTIFICATE':
        return (
          inst?.affiliationCertificateUrl ||
          'https://scholarfund-s3.gov.in/presigned/affiliation.pdf'
        );
      default:
        return 'https://scholarfund-s3.gov.in/presigned/doc.pdf';
    }
  }
}
