import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalService } from '../../../shared/portal.service';
import { InstituteDto } from '../../../shared/types';
import { formatDate } from '../../../shared/utils/formatters';

@Component({
  selector: 'app-institute-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (institute(); as inst) {
      <div
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
      >
        <div
          class="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        >
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold"
              >
                <i class="pi pi-building-columns text-lg"></i>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-mono text-xs text-slate-300">{{ inst.collegeCode }}</span>
                  <span
                    [class]="
                      inst.isVerifyByGovt
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                    "
                    class="px-2 py-0.5 rounded-full text-xs font-semibold border"
                  >
                    {{
                      inst.isVerifyByGovt ? 'Govt Verified & Active' : 'Pending Govt Verification'
                    }}
                  </span>
                </div>
                <h2 class="text-lg font-bold text-white mt-0.5">{{ inst.instituteName }}</h2>
              </div>
            </div>

            <button
              (click)="onClose()"
              class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <i class="pi pi-times text-base"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50 text-xs">
            <!-- Verification Alert Banner -->
            @if (!inst.isVerifyByGovt) {
              <div
                class="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start space-x-3"
              >
                <i class="pi pi-exclamation-triangle text-amber-600 text-base mt-0.5 shrink-0"></i>
                <div class="flex-1">
                  <h4 class="font-bold text-amber-900 text-sm">
                    Action Required: Statutory Verification Pending
                  </h4>
                  <p class="text-amber-800 mt-1 leading-relaxed">
                    This institution's AISHE code and university accreditation require Directorate
                    verification before students can be cleared for scholarship grant sanction.
                  </p>
                </div>
              </div>
            }

            <!-- General Accreditation Data -->
            <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3
                class="text-sm font-bold text-slate-900 flex items-center mb-4 pb-2 border-b border-slate-100"
              >
                <i class="pi pi-shield mr-2 text-blue-600"></i>
                Institutional Statutory Credentials
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-slate-500 block">AISHE Code:</span>
                  <strong class="font-mono text-slate-900 text-sm">{{
                    inst.aisheCode || 'C-6240'
                  }}</strong>
                </div>
                <div>
                  <span class="text-slate-500 block">Institution Category:</span>
                  <strong class="uppercase text-slate-800">{{
                    inst.instituteType || 'GOVERNMENT'
                  }}</strong>
                </div>
                <div class="md:col-span-2">
                  <span class="text-slate-500 block">Affiliating University / Council:</span>
                  <strong class="text-slate-900 text-sm">{{ inst.universityAffiliation }}</strong>
                </div>
                <div class="md:col-span-2">
                  <span class="text-slate-500 block">Official Campus Address:</span>
                  <span class="text-slate-700">{{ inst.address }}</span>
                </div>
              </div>
            </div>

            <!-- Contacts Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 class="text-sm font-bold text-slate-900 flex items-center mb-3">
                  <i class="pi pi-user mr-2 text-blue-600"></i>
                  Head of Institution (Principal)
                </h3>
                <div class="space-y-2">
                  <div>
                    <span class="text-slate-500 block">Name:</span>
                    <strong class="text-slate-900 text-sm">{{ inst.principalName }}</strong>
                  </div>
                  <div>
                    <span class="text-slate-500 block">College Official Email:</span>
                    <span class="font-mono text-blue-700">{{ inst.email }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">Campus Phone:</span>
                    <span class="font-mono text-slate-800">{{
                      inst.contactNumber || '033 2200 0000'
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 class="text-sm font-bold text-slate-900 flex items-center mb-3">
                  <i class="pi pi-id-card mr-2 text-emerald-600"></i>
                  Scholarship Nodal Officer
                </h3>
                <div class="space-y-2">
                  <div>
                    <span class="text-slate-500 block">Designated Officer:</span>
                    <strong class="text-slate-900 text-sm">{{ inst.officerName }}</strong>
                  </div>
                  <div>
                    <span class="text-slate-500 block">Mobile Phone:</span>
                    <span class="font-mono font-bold text-slate-900">{{
                      inst.officerPhoneNo
                    }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 block">Verification Authority:</span>
                    <span class="text-emerald-700 font-semibold">Institute L1 Approver</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Affiliation Certificate Inspect Box -->
            <div
              class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700"
                >
                  <i class="pi pi-file text-base"></i>
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">
                    Statutory Affiliation Certificate
                  </h4>
                  <p class="text-slate-500 text-[11px] font-mono mt-0.5 truncate max-w-[320px]">
                    {{ inst.affiliationCertificateUrl }}
                  </p>
                </div>
              </div>
              <button
                (click)="onViewCertificate()"
                class="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold border border-blue-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <i class="pi pi-eye text-xs"></i>
                <span>Inspect Document</span>
              </button>
            </div>

            <!-- Verification History if available -->
            @if (inst.verifiedAt) {
              <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                <div class="font-bold flex items-center">
                  <i class="pi pi-check-circle mr-1.5 text-emerald-600"></i>
                  Directorate Verification Recorded
                </div>
                <div class="mt-1 text-slate-600">
                  Verified by <strong>{{ inst.verifiedBy }}</strong> on
                  {{ formatDate(inst.verifiedAt) }}.
                </div>
                @if (inst.verificationRemarks) {
                  <p class="mt-1 italic text-slate-700">"{{ inst.verificationRemarks }}"</p>
                }
              </div>
            }
          </div>

          <!-- Modal Action Bar -->
          <div
            class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0"
          >
            <button
              (click)="onClose()"
              class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Close Profile
            </button>

            <div class="flex items-center space-x-2">
              @if (!inst.isVerifyByGovt) {
                <button
                  (click)="verifyInstitute()"
                  class="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <i class="pi pi-check-circle"></i>
                  <span>Verify & Grant Clearance</span>
                </button>
              } @else {
                <button
                  (click)="revokeInstitute()"
                  class="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  Revoke Verification
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class InstituteDetailModalComponent {
  readonly service = inject(PortalService);
  readonly institute = input<InstituteDto | null>(null);
  readonly close = output<void>();
  readonly viewCertificate = output<void>();

  readonly formatDate = formatDate;

  onClose() {
    this.close.emit();
  }

  onViewCertificate() {
    this.viewCertificate.emit();
  }

  verifyInstitute() {
    const inst = this.institute();
    if (!inst) return;
    this.service.verifyInstitute(
      inst.profileId,
      'AISHE credentials and statutory university affiliation verified by Directorate.',
    );
    this.onClose();
  }

  revokeInstitute() {
    const inst = this.institute();
    if (!inst) return;
    this.service.revokeInstitute(
      inst.profileId,
      'Verification revoked pending annual AISHE re-accreditation check.',
    );
    this.onClose();
  }
}
