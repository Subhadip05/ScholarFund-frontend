import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { PortalService } from '../../../shared/portal.service';
import { Apiservice } from '../../../shared/api/apiservice';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  ApplicationResponse,
  ApplicationStatus,
  InstituteProfileResponse,
} from '../../../shared/types';
import Notiflix from 'notiflix';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-collage-dashboard',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    ToastModule,
  ],
  templateUrl: './collage-dashboard.html',
  styleUrl: './collage-dashboard.css',
  providers: [MessageService],
})
export class CollageDashboard {
  public portalService = inject(PortalService);
  private apiService = inject(Apiservice);
  private fb = inject(FormBuilder);
  private _messageService = inject(MessageService);

  isProfileSaved = signal<boolean>(false);
  isInstituteVerifiedByGovt = signal<boolean>(false);
  instituteDetails: InstituteProfileResponse | null = null;
  instituteDetailsForm!: FormGroup;

  errorMessage: string = '';
  isSubmitting = false;

  affiliationCertificateDoc = {
    id: null as number | null,
    url: null as string | null,
    name: null as string | null,
    folder: 'institute-affiliation',
    label: 'Affiliation / AISHE Certificate',
  };

  // Filter States
  applications = signal<ApplicationResponse[]>([]);
  searchQuery = signal<string>('');
  courseFilter = signal<string>('All');
  statusFilter = signal<string>('All');
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(5);
  readonly ApplicationStatus = ApplicationStatus;

  isModalOpen = signal<boolean>(false);
  selectedApp = signal<ApplicationResponse | null>(null);
  modalRemarks = signal<string>('');

  readonly statusConfig: Record<
    string,
    { label: string; class: string; activeClass: string; badgeClass: string }
  > = {
    All: {
      label: 'All',
      class: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      activeClass: 'bg-slate-900 text-white shadow-sm',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    SUBMITTED: {
      label: 'Pending Review',
      class: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      activeClass: 'bg-amber-500 text-slate-950 shadow-sm',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    INSTITUTE_VERIFIED: {
      label: 'Institute Verified',
      class: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      activeClass: 'bg-emerald-600 text-white shadow-sm',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    ADMIN_APPROVED: {
      label: 'Govt Approved',
      class: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      activeClass: 'bg-emerald-700 text-white shadow-sm',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
    INSTITUTE_REJECTED: {
      label: 'Rejected',
      class: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      activeClass: 'bg-red-600 text-white shadow-sm',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
    },
    ADMIN_REJECTED: {
      label: 'Govt Rejected',
      class: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      activeClass: 'bg-red-700 text-white shadow-sm',
      badgeClass: 'bg-red-50 text-red-800 border-red-300',
    },
    DISBURSED: {
      label: 'Disbursed',
      class: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      activeClass: 'bg-teal-600 text-white shadow-sm',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    },
  };

  ngOnInit(): void {
    this.initForm();
    this.fetchInstituteProfile();
  }

  initForm(): void {
    this.instituteDetailsForm = this.fb.group({
      instituteName: ['', Validators.required],
      collegeCode: ['', Validators.required],
      universityAffiliation: ['', Validators.required],
      principalName: ['', Validators.required],
      officerPhoneNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      officerName: ['', Validators.required],
      address: ['', Validators.required],
      affiliationCertificateFileId: ['', Validators.required],
    });
  }

  fetchInstituteProfile(): void {
    Notiflix.Loading.pulse('Loading...', {});
    this.apiService.getInstituteProfile().subscribe({
      next: (res) => {
        if (res?.status === 200 && res?.data) {
          this.instituteDetails = res.data;
          console.log('Fetching institute details response:', res?.data);
          this.fetchApplicationsByInstitute(res?.data?.profileId); //from api
          // this.fetchDemoApplications();

          this.isProfileSaved.set(true);
          const isVerified = Boolean(res.data.isVerifyByGovt);
          this.isInstituteVerifiedByGovt.set(isVerified);

          this.instituteDetailsForm.patchValue(res.data);
          if (res.data.affiliationCertificateUrl) {
            this.affiliationCertificateDoc.id = res.data.profileId;
            this.affiliationCertificateDoc.url = res.data.affiliationCertificateUrl;
            this.affiliationCertificateDoc.name = 'Affiliation Certificate';
          }
        } else {
          this.isProfileSaved.set(false);
          this.isInstituteVerifiedByGovt.set(false);
        }
        setTimeout(() => Notiflix.Loading.remove(), 800);
      },
      error: (err) => {
        this.isProfileSaved.set(false);
        console.error('Error fetching institute details:', err);
        setTimeout(() => Notiflix.Loading.remove(), 800);
      },
    });
  }

  fetchApplicationsByInstitute(instituteProfileId: any): void {
    this.apiService.getApplicationsByInstituteId(instituteProfileId).subscribe({
      next: (res) => {
        this.applications.set(res.data || []);
        console.log('Fetching applications list by institute:');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load applications by institute.';
      },
    });
  }

  onAffiliationCertificateSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (file.size > 1048576) {
      this._messageService.add({
        severity: 'warn',
        summary: 'File Too Large',
        detail: 'The uploaded file is larger than 1MB. Please upload a smaller file.',
      });
      input.value = '';
      return;
    }

    Notiflix.Loading.pulse(`Uploading ${this.affiliationCertificateDoc.label}...`, {});

    this.apiService.uploadDocument(file, this.affiliationCertificateDoc.folder).subscribe({
      next: (res) => {
        if (res.status === 200 && res.data) {
          this.affiliationCertificateDoc.id = res.data.documentId;
          this.affiliationCertificateDoc.url = res.data.documentUrl;
          this.affiliationCertificateDoc.name = file.name;

          this.instituteDetailsForm.patchValue({
            affiliationCertificateFileId: res.data.documentId,
          });
          this.instituteDetailsForm.get('affiliationCertificateFileId')?.markAsTouched();

          this._messageService.add({
            severity: 'success',
            summary: 'Uploaded',
            detail: `${this.affiliationCertificateDoc.label} uploaded successfully`,
          });
        }
        Notiflix.Loading.remove();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to upload affiliation certificate.';
        this._messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: msg,
          life: 5000,
        });
        input.value = '';
        Notiflix.Loading.remove();
      },
    });
  }

  removeAffiliationCertificate(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    Notiflix.Confirm.show(
      'Remove Certificate',
      'Are you sure you want to remove the uploaded Affiliation Certificate?',
      'Yes',
      'No',
      () => {
        this.affiliationCertificateDoc = {
          id: null,
          url: null,
          name: null,
          folder: 'institute-affiliation',
          label: 'Affiliation / AISHE Certificate',
        };

        this.instituteDetailsForm.patchValue({
          affiliationCertificateFileId: null,
        });

        this._messageService.add({
          severity: 'info',
          summary: 'File Removed',
          detail: 'Affiliation certificate has been removed.',
          life: 3000,
        });
      },
      () => {},
      {
        okButtonBackground: '#ef4444',
        titleColor: '#0f172a',
      },
    );
  }

  saveInstituteProfile(): void {
    this.errorMessage = '';

    if (this.instituteDetailsForm.invalid) {
      this.errorMessage =
        'Please complete all mandatory fields, including Officer Contact No. and Affiliation Certificate.';
      this._messageService.add({
        severity: 'error',
        summary: 'Form Incomplete',
        detail: this.errorMessage,
      });
      return;
    }

    this.isSubmitting = true;
    const instituteSavingPayload = this.instituteDetailsForm.value;
    console.log('Institute saving payload value:', instituteSavingPayload);

    // return;
    Notiflix.Loading.pulse('Loading...', {});
    this.apiService.saveInstituteProfile(instituteSavingPayload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        console.log('Institute saving response', res);
        this.fetchInstituteProfile();
        Notiflix.Loading.remove();

        this._messageService.add({
          severity: 'success',
          summary: 'Profile Saved',
          detail: 'Institute profile registered successfully.',
          life: 5000,
        });
      },
      error: (err) => {
        this.isProfileSaved.set(false);
        console.log('Error on saving institute profile', err);
        Notiflix.Loading.remove();

        this._messageService.add({
          severity: 'error',
          summary: 'Failed To Saved',
          detail: 'Institute profile failed to save.Please try again.',
          life: 5000,
        });
      },
    });
  }

  //Just demo application request data
  fetchDemoApplications() {
    this.applications.set([
      {
        applicationId: 2,
        studentName: 'Subhadip Samanta',
        instituteName: 'Haldia Institute of Technology',
        courseName: 'B.Tech in Computer Science & Engineering',
        academicYear: '2025-2026',
        lastQualificationMarks: 90,
        lastQualificationCourse: '10+2 (Higher Secondary Education)',
        lastQualificationExamRollNo: 'WBCISD8090',
        passOutBoardName: 'WBHSE',
        annualIncome: 120000.0,
        bankAccountNumber: '918273645012',
        ifscCode: 'SBIN0003201',
        status: ApplicationStatus.SUBMITTED,
        incomeCertificateUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/income-certificate/dummy-income.pdf',
        hsMarksheetUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/marksheet/dummy-hs.pdf',
        bankPassbookUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/bank-passbook/dummy-passbook.pdf',
        admissionReceiptUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/admission-receipt/dummy-receipt.pdf',
        timeline: [
          {
            actionTaken: 'Application Submitted',
            actionBy: 'Subhadip Samanta',
            actorRole: 'STUDENT',
            remarks: 'Student submitted the application successfully.',
            actionTime: '2026-08-11T08:57:14.680426',
          },
        ],
      },
      {
        applicationId: 3,
        studentName: 'Priya Mukherjee',
        instituteName: 'College of Engineering & Management, Kolaghat',
        courseName: 'B.Tech in Information Technology',
        academicYear: '2025-2026',
        lastQualificationMarks: 86.5,
        lastQualificationCourse: '10+2 (Higher Secondary Education)',
        lastQualificationExamRollNo: 'WBCHSE2025-8841',
        passOutBoardName: 'WBCHSE',
        annualIncome: 95000.0,
        bankAccountNumber: '501004392810',
        ifscCode: 'HDFC0001042',
        status: ApplicationStatus.INSTITUTE_VERIFIED,
        incomeCertificateUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/income-certificate/dummy-income.pdf',
        hsMarksheetUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/marksheet/dummy-hs.pdf',
        bankPassbookUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/bank-passbook/dummy-passbook.pdf',
        admissionReceiptUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/admission-receipt/dummy-receipt.pdf',
        timeline: [
          {
            actionTaken: 'Application Submitted',
            actionBy: 'Priya Mukherjee',
            actorRole: 'STUDENT',
            remarks: 'Fresh application submitted with all attachments.',
            actionTime: '2026-08-12T10:15:30.120511',
          },
          {
            actionTaken: 'Verified by Institute Nodal Officer',
            actionBy: 'Dr. Biddut Jana',
            actorRole: 'INSTITUTE',
            remarks: 'Academic records and caste criteria verified successfully.',
            actionTime: '2026-08-14T14:22:10.512390',
          },
        ],
      },
      {
        applicationId: 4,
        studentName: 'Sourav Ganguly',
        instituteName: 'Jadavpur University',
        courseName: 'M.Sc in Applied Mathematics',
        academicYear: '2025-2026',
        lastQualificationMarks: 82.4,
        lastQualificationCourse: 'B.Sc (Mathematics Honours)',
        lastQualificationExamRollNo: 'JU-MATH-2025-019',
        passOutBoardName: 'Jadavpur University Autonomous',
        annualIncome: 140000.0,
        bankAccountNumber: '309812457811',
        ifscCode: 'SBIN0000093',
        status: ApplicationStatus.ADMIN_APPROVED,
        incomeCertificateUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/income-certificate/dummy-income.pdf',
        hsMarksheetUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/marksheet/dummy-hs.pdf',
        bankPassbookUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/bank-passbook/dummy-passbook.pdf',
        admissionReceiptUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/admission-receipt/dummy-receipt.pdf',
        timeline: [
          {
            actionTaken: 'Application Submitted',
            actionBy: 'Sourav Ganguly',
            actorRole: 'STUDENT',
            remarks: 'Direct post-graduate application submitted.',
            actionTime: '2026-08-05T09:30:00.000000',
          },
          {
            actionTaken: 'Verified by Institute Nodal Officer',
            actionBy: 'Prof. Anirban Roy',
            actorRole: 'INSTITUTE',
            remarks: 'Marksheet roll matches University database.',
            actionTime: '2026-08-08T11:45:00.000000',
          },
          {
            actionTaken: 'Final Approval by State Welfare Directorate',
            actionBy: 'Joint Secretary (Higher Education)',
            actorRole: 'GOVT_NODAL_OFFICER',
            remarks: 'Disbursement sanctioned under State Merit Scheme.',
            actionTime: '2026-08-16T16:05:22.781204',
          },
        ],
      },
      {
        applicationId: 5,
        studentName: 'Ananya Sen',
        instituteName: 'Heritage Institute of Technology',
        courseName: 'B.Tech in Electronics & Communication',
        academicYear: '2025-2026',
        lastQualificationMarks: 58.0,
        lastQualificationCourse: '10+2 (Higher Secondary Education)',
        lastQualificationExamRollNo: 'CBSE-2025-90124',
        passOutBoardName: 'CBSE',
        annualIncome: 350000.0,
        bankAccountNumber: '023410100049182',
        ifscCode: 'PUNB0023400',
        status: ApplicationStatus.INSTITUTE_REJECTED,
        incomeCertificateUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/income-certificate/dummy-income.pdf',
        hsMarksheetUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/marksheet/dummy-hs.pdf',
        bankPassbookUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/bank-passbook/dummy-passbook.pdf',
        admissionReceiptUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/admission-receipt/dummy-receipt.pdf',
        timeline: [
          {
            actionTaken: 'Application Submitted',
            actionBy: 'Ananya Sen',
            actorRole: 'STUDENT',
            remarks: 'Student submitted application.',
            actionTime: '2026-08-13T12:00:00.000000',
          },
          {
            actionTaken: 'Application Rejected',
            actionBy: 'Dr. Debasis Pal',
            actorRole: 'INSTITUTE',
            remarks: 'Annual income exceeds the ₹2,50,000 threshold for this specific scheme.',
            actionTime: '2026-08-15T15:30:19.412984',
          },
        ],
      },
      {
        applicationId: 6,
        studentName: 'Rohan Ghosh',
        instituteName: 'Kalyani Government Engineering College',
        courseName: 'B.Tech in Mechanical Engineering',
        academicYear: '2025-2026',
        lastQualificationMarks: 78.5,
        lastQualificationCourse: '10+2 (Higher Secondary Education)',
        lastQualificationExamRollNo: 'WBCHSE2025-4491',
        passOutBoardName: 'WBCHSE',
        annualIncome: 110000.0,
        bankAccountNumber: '409182736192',
        ifscCode: 'SBIN0001092',
        status: ApplicationStatus.SUBMITTED,
        incomeCertificateUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/income-certificate/dummy-income.pdf',
        hsMarksheetUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/marksheet/dummy-hs.pdf',
        bankPassbookUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/bank-passbook/dummy-passbook.pdf',
        admissionReceiptUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/admission-receipt/dummy-receipt.pdf',
        timeline: [
          {
            actionTaken: 'Application Submitted',
            actionBy: 'Rohan Ghosh',
            actorRole: 'STUDENT',
            remarks: 'Application logged and waiting for institute nodal officer review.',
            actionTime: '2026-08-17T09:12:44.312901',
          },
        ],
      },
      {
        applicationId: 2,
        studentName: 'Sayak Kar',
        instituteName: 'Swamin Vivekananda University',
        courseName: 'B.Tech in Computer Science & Engineering',
        academicYear: '2025-2026',
        lastQualificationMarks: 82,
        lastQualificationCourse: '10+2 (Higher Secondary Education)',
        lastQualificationExamRollNo: 'WBCISD8060',
        passOutBoardName: 'WBHSE',
        annualIncome: 110000.0,
        bankAccountNumber: '9182736450788',
        ifscCode: 'SBIN0003201',
        status: ApplicationStatus.SUBMITTED,
        incomeCertificateUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/income-certificate/dummy-income.pdf',
        hsMarksheetUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/marksheet/dummy-hs.pdf',
        bankPassbookUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/bank-passbook/dummy-passbook.pdf',
        admissionReceiptUrl:
          'https://scholarfund-documents-dev.s3.ap-south-1.amazonaws.com/admission-receipt/dummy-receipt.pdf',
        timeline: [
          {
            actionTaken: 'Application Submitted',
            actionBy: 'Subhadip Samanta',
            actorRole: 'STUDENT',
            remarks: 'Student submitted the application successfully.',
            actionTime: '2026-08-11T08:57:14.680426',
          },
        ],
      },
    ]);
  }

  getStatusCount(status: string): number {
    if (status === 'All') {
      return this.applications().length;
    }
    return this.applications().filter((a) => a.status === status).length;
  }

  courses = computed(() => [
    'All',
    ...new Set(
      this.applications()
        .map((a) => a.courseName)
        .filter(Boolean),
    ),
  ]);

  // 2. Filtered Dataset
  filteredApps = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const course = this.courseFilter();
    const status = this.statusFilter();

    return this.applications().filter((app) => {
      const matchSearch =
        !query ||
        app.studentName.toLowerCase().includes(query) ||
        String(app.applicationId).includes(query);
      const matchCourse = course === 'All' || app.courseName === course;
      const matchStatus = status === 'All' || app.status === status;
      return matchSearch && matchCourse && matchStatus;
    });
  });

  // 3. Pagination math
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredApps().length / this.itemsPerPage())),
  );
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  paginatedApps = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredApps().slice(start, start + this.itemsPerPage());
  });

  // Quick Action Handlers
  updateStatus(appId: number, newStatus: ApplicationStatus): void {
    this.applications.update((list) =>
      list.map((item) => (item.applicationId === appId ? { ...item, status: newStatus } : item)),
    );
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.courseFilter.set('All');
    this.statusFilter.set('All');
    this.currentPage.set(1);
  }

  getPendingCount = computed(
    () => this.applications().filter((a) => a.status === 'SUBMITTED').length,
  );

  getApprovedCount = computed(
    () =>
      this.applications().filter(
        (a) => a.status === 'INSTITUTE_VERIFIED' || a.status === 'ADMIN_APPROVED',
      ).length,
  );

  getRejectedCount = computed(
    () =>
      this.applications().filter(
        (a) => a.status === 'INSTITUTE_REJECTED' || a.status === 'ADMIN_REJECTED',
      ).length,
  );

  updateApplicationStatus(appId: number, action: 'APPROVE' | 'REJECT'): void {
    const isApprove = action === 'APPROVE';
    const targetStatus = isApprove
      ? ApplicationStatus.INSTITUTE_VERIFIED
      : ApplicationStatus.INSTITUTE_REJECTED;

    const title = isApprove ? 'Verify Application' : 'Reject Application';
    const message = isApprove
      ? 'Are you sure you want to verify and forward this application to Government Nodal Officers?'
      : 'Are you sure you want to reject this student application?';
    const confirmBtnText = isApprove ? 'Verify & Approve' : 'Reject';
    const remarks = this.modalRemarks().trim();

    Notiflix.Confirm.show(
      title,
      message,
      confirmBtnText,
      'Cancel',
      () => {
        this.applications.update((list) =>
          list.map((item) =>
            item.applicationId === appId ? { ...item, status: targetStatus } : item,
          ),
        );

        this._messageService.add({
          severity: isApprove ? 'success' : 'warn',
          summary: isApprove ? 'Application Verified' : 'Application Rejected',
          detail: isApprove
            ? `Application verified and forwarded.`
            : `Application has been marked as rejected.`,
        });

        const payload = {
          statusAction: targetStatus,
          actionRemarks: remarks,
        };
        console.log('Action Payload :', payload, ' and id: ', appId);

        // return;
        Notiflix.Loading.pulse('Updating status...', {});
        this.apiService.updateApplicationStatus(appId, payload).subscribe({
          next: (res) => {
            Notiflix.Loading.remove();
            console.log('Institute action response :', res);

            this.applications.update((list) =>
              list.map((item) =>
                item.applicationId === appId ? { ...item, status: targetStatus } : item,
              ),
            );

            this._messageService.add({
              severity: isApprove ? 'success' : 'warn',
              summary: isApprove ? 'Application Verified' : 'Application Rejected',
              detail: `Application successfully updated.`,
            });

            this.closeModal();
            this.fetchApplicationsByInstitute(this.instituteDetails?.profileId);
          },
          error: (err) => {
            Notiflix.Loading.remove();
            this._messageService.add({
              severity: 'error',
              summary: 'Operation Failed',
              detail: err?.error?.message || 'Failed to update application status.',
            });
          },
        });
      },
      () => {},
      {
        okButtonBackground: isApprove ? '#059669' : '#ef4444',
      },
    );
  }

  selectApplication(app: ApplicationResponse): void {
    console.log('Selected student application:', app);

    this.selectedApp.set(app);
    this.modalRemarks.set('');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedApp.set(null);
    this.modalRemarks.set('');
  }
}
