import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PortalService } from '../../../shared/portal.service';
import Notiflix from 'notiflix';
import { Apiservice } from '../../../shared/api/apiservice';
import { InstituteProfileResponse } from '../../../shared/types';

@Component({
  selector: 'app-application-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './application-form.html',
  styleUrl: './application-form.css',
})
export class ApplicationForm implements OnInit {
  public portalService = inject(PortalService);
  private apiService = inject(Apiservice);
  private fb = inject(FormBuilder);
  private _messageService = inject(MessageService);
  private router = inject(Router);

  applicationForm!: FormGroup;

  step = 1;
  agreed = false;
  bankError: string | null = null;

  institutes = [];
  verifiedColleges: InstituteProfileResponse[] = [];

  stepperStages = [
    { num: 1, name: 'Academic & Bank Details' },
    { num: 2, name: 'Upload Documents' },
    { num: 3, name: 'Confirm & Submit' },
  ];

  uploadDocuments = [
    { key: 'incomeFileId', title: 'Family Income Certificate', folder: 'income-certificate' },
    { key: 'hsMarksheetFileId', title: '10+2 Marksheet', folder: 'marksheet' },
    { key: 'bankPassbookFileId', title: 'Bank Passbook (Front)', folder: 'bank-passbook' },
    { key: 'admissionReceiptFileId', title: 'Admission Receipt', folder: 'admission-receipt' },
  ];

  // Store Name and URL for UI display
  documentDetails: Record<string, { name: string | null; url: string | null }> = {
    incomeFileId: { name: null, url: null },
    hsMarksheetFileId: { name: null, url: null },
    bankPassbookFileId: { name: null, url: null },
    admissionReceiptFileId: { name: null, url: null },
  };

  ngOnInit(): void {
    this.initForm();
    this.fetchVerifiedInstituteList();
  }

  initForm(): void {
    this.applicationForm = this.fb.group({
      instituteId: ['', Validators.required],
      courseName: ['', Validators.required],
      academicYear: ['', Validators.required],
      lastQualificationMarks: ['', Validators.required],
      lastQualificationCourse: ['', Validators.required],
      lastQualificationExamRollNo: ['', Validators.required],
      passOutBoardName: ['', Validators.required],
      annualIncome: ['', Validators.required],
      bankAccountNumber: ['', Validators.required],
      confirmBankAccountNumber: ['', Validators.required],
      ifscCode: ['', Validators.required],
      confirmIfscCode: ['', Validators.required],
      incomeFileId: [null, Validators.required],
      hsMarksheetFileId: [null, Validators.required],
      bankPassbookFileId: [null, Validators.required],
      admissionReceiptFileId: [null, Validators.required],
    });
  }

  get accountMismatch(): boolean {
    const acc = this.applicationForm.get('bankAccountNumber')?.value;
    const confirmAcc = this.applicationForm.get('confirmBankAccountNumber')?.value;
    return !!acc && !!confirmAcc && acc !== confirmAcc;
  }

  get ifscMismatch(): boolean {
    const ifsc = this.applicationForm.get('ifscCode')?.value?.toUpperCase();
    const confirmIfsc = this.applicationForm.get('confirmIfscCode')?.value?.toUpperCase();
    return !!ifsc && !!confirmIfsc && ifsc !== confirmIfsc;
  }

  onFileSelect(fieldKey: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const docConfig = this.uploadDocuments.find((d) => d.key === fieldKey);

    if (!docConfig) return;

    Notiflix.Loading.pulse(`Uploading ${docConfig.title}...`, {});

    this.apiService.uploadDocument(file, docConfig.folder).subscribe({
      next: (res) => {
        if (res.status === 200 && res.data?.documentId) {
          this.applicationForm.patchValue({ [fieldKey]: res.data.documentId });
          this.applicationForm.get(fieldKey)?.markAsTouched();

          this.documentDetails[fieldKey].name = file.name;
          this.documentDetails[fieldKey].url = res.data.documentUrl;

          this._messageService.add({
            severity: 'success',
            summary: 'Uploaded',
            detail: res.message,
          });
        }
        Notiflix.Loading.remove();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to upload document.';
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

  removeFile(fieldKey: string): void {
    const docConfig = this.uploadDocuments.find((d) => d.key === fieldKey);
    const docTitle = docConfig ? docConfig.title : 'this document';

    Notiflix.Confirm.show(
      'Remove File',
      `Are you sure you want to remove the uploaded ${docTitle}?`,
      'Yes',
      'No',
      () => {
        this.applicationForm.patchValue({ [fieldKey]: null });
        this.documentDetails[fieldKey] = { name: null, url: null };

        this._messageService.add({
          severity: 'info',
          summary: 'File Removed',
          detail: `${docTitle} has been removed.`,
          life: 3000,
        });
      },
      () => {
        console.log('Cancel Click to remove file.');
      },
      {
        okButtonBackground: '#ef4444',
        titleColor: '#0f172a',
      },
    );
  }

  getFileName(fieldKey: string): string {
    return this.documentDetails[fieldKey]?.name || 'Document uploaded';
  }

  getFileUrl(fieldKey: string): string | null {
    return this.documentDetails[fieldKey]?.url;
  }

  fetchVerifiedInstituteList() {
    this.apiService.getVerifiedInstitutes().subscribe({
      next: (response) => {
        this.verifiedColleges = response?.data;
        console.log('Verified Institute List: ', this.verifiedColleges);
      },
      error: (err) => {
        console.error('Failed to load verified colleges:', err);
      },
    });
  }

  // Draft saving & step navigation
  handleDraftAndSave(): void {
    this.bankError = null;

    if (this.step === 1) {
      const step1Fields = [
        'instituteId',
        'courseName',
        'academicYear',
        'lastQualificationCourse',
        'lastQualificationMarks',
        'lastQualificationExamRollNo',
        'passOutBoardName',
        'annualIncome',
        'bankAccountNumber',
        'confirmBankAccountNumber',
        'ifscCode',
        'confirmIfscCode',
      ];

      const isStep1Valid = step1Fields.every((field) => {
        const val = this.applicationForm.get(field)?.value;
        return val !== null && val !== undefined && val.toString().trim() !== '';
      });

      if (!isStep1Valid) {
        this.bankError =
          'All fields marked with an asterisk (*) are mandatory. Please complete all fields.';
        this._messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please complete all required fields in Step 1.',
        });
        return;
      }
      if (this.accountMismatch) {
        this.bankError = 'Bank Account Numbers do not match! Please verify both inputs.';
        this._messageService.add({
          severity: 'warn',
          summary: 'Account Mismatch',
          detail: 'Bank Account Numbers do not match.',
        });
        return;
      }
      if (this.ifscMismatch) {
        this.bankError = 'Bank IFSC Codes do not match! Please verify both inputs.';
        this._messageService.add({
          severity: 'warn',
          summary: 'IFSC Mismatch',
          detail: 'Bank IFSC Codes do not match.',
        });
        return;
      }

      console.log('Application form - step 1 value : ', this.applicationForm.value);
    }

    if (this.step === 2) {
      if (
        !this.applicationForm.value.incomeFileId ||
        !this.applicationForm.value.hsMarksheetFileId ||
        !this.applicationForm.value.bankPassbookFileId
      ) {
        this.bankError = 'All 3 required document files marked with (*) must be uploaded.';
        this._messageService.add({
          severity: 'error',
          summary: 'Files Missing',
          detail: 'Please upload all 3 required verification documents.',
        });
        return;
      }
    }

    this._messageService.add({
      severity: 'success',
      summary: 'Draft Saved',
      detail: `Draft saved successfully at ${new Date().toLocaleTimeString()}`,
    });

    this.step = Math.min(this.step + 1, 3);
  }

  onCancelClick(): void {
    this.router.navigate(['/student']);
  }

  onSubmitClick(): void {
    if (this.agreed && this.applicationForm.valid) {
      console.log('Total Application Form value', this.applicationForm.value);

      const { confirmBankAccountNumber, confirmIfscCode, ...applicationPayload } =
        this.applicationForm.value;
      console.log('The Application payload: ', applicationPayload);

      return;
      Notiflix.Loading.pulse('Submitting Application...', {});
      this.apiService.submitApplication(applicationPayload).subscribe({
        next: (res) => {
          if (res.status === 200) {
            console.log('Submit scholarship response:', res);

            this._messageService.add({
              severity: 'success',
              summary: 'Application Submitted',
              detail: 'Your scholarship application has been submitted successfully.',
              life: 5000,
            });
          }
          Notiflix.Loading.remove();
        },
        error: (err) => {
          console.error('Failed to save profile:', err);
          this._messageService.add({
            severity: 'error',
            summary: 'Application Submission Failed',
            detail: err.error?.message || 'An error occurred while submitting your application.',
            life: 5000,
          });
          Notiflix.Loading.remove();
        },
      });

      this.router.navigate(['/student']);
    }
  }
}
