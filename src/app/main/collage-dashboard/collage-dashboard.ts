import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PortalService } from '../../../shared/portal.service';
import { Apiservice } from '../../../shared/api/apiservice';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CollegeApplication, InstituteProfileResponse } from '../../../shared/types';
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
  searchQuery: string = '';
  statusFilter: 'All' | 'Pending' | 'Approved' | 'Rejected' = 'All';
  courseFilter: string = 'All';

  // Pagination States
  currentPage: number = 1;
  itemsPerPage: number = 5;

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
          console.log(res?.data);

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

  // --- Stats Counters ---
  getPendingCount(): number {
    return this.portalService.collegeApplications.filter((a) => a.status === 'Pending').length;
  }

  getApprovedCount(): number {
    return this.portalService.collegeApplications.filter((a) => a.status === 'Approved').length;
  }

  getRejectedCount(): number {
    return this.portalService.collegeApplications.filter((a) => a.status === 'Rejected').length;
  }

  // --- Dynamic Filters & Table Helpers ---
  get uniqueCourses(): string[] {
    const courses = Array.from(
      new Set(this.portalService.collegeApplications.map((app) => app.course)),
    ).filter(Boolean);
    return ['All', ...courses.sort()];
  }

  get filteredApplications(): CollegeApplication[] {
    return this.portalService.collegeApplications.filter((app) => {
      const query = this.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        app.name.toLowerCase().includes(query) ||
        app.id.toLowerCase().includes(query) ||
        app.course.toLowerCase().includes(query) ||
        app.scheme.toLowerCase().includes(query);

      const matchesStatus = this.statusFilter === 'All' ? true : app.status === this.statusFilter;
      const matchesCourse = this.courseFilter === 'All' ? true : app.course === this.courseFilter;

      return matchesSearch && matchesStatus && matchesCourse;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredApplications.length / this.itemsPerPage));
  }

  get validCurrentPage(): number {
    return Math.min(this.currentPage, this.totalPages);
  }

  get paginatedApplications(): CollegeApplication[] {
    const startIdx = (this.validCurrentPage - 1) * this.itemsPerPage;
    return this.filteredApplications.slice(startIdx, startIdx + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get isFilterActive(): boolean {
    return this.searchQuery !== '' || this.statusFilter !== 'All' || this.courseFilter !== 'All';
  }

  get startIndex(): number {
    return this.filteredApplications.length === 0
      ? 0
      : (this.validCurrentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    return Math.min(this.validCurrentPage * this.itemsPerPage, this.filteredApplications.length);
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  handleClearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.courseFilter = 'All';
    this.currentPage = 1;
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status as 'All' | 'Pending' | 'Approved' | 'Rejected';
    this.onFilterChange();
  }

  getStatusCount(status: string): number {
    if (status === 'All') {
      return this.portalService.collegeApplications.length;
    }
    return this.portalService.collegeApplications.filter((a) => a.status === status).length;
  }

  selectApplication(app: CollegeApplication): void {
    console.log('Selected student application:', app);
  }
}
