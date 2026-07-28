import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, output } from '@angular/core';
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

@Component({
  selector: 'app-application-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule,ToastModule],
  providers: [MessageService],
  templateUrl: './application-form.html',
  styleUrl: './application-form.css',
})

export class ApplicationForm implements OnInit {
  public portalService = inject(PortalService);
  private fb = inject(FormBuilder);
  private _messageService = inject(MessageService);
  private router = inject(Router);

  cancel = output<void>();
  submitForm = output<any>();

  applicationForm!: FormGroup;

  step = 1;
  agreed = false;
  bankError: string | null = null;

  institutes = [
    { id: '1001', name: 'Indian Institute of Technology, Delhi (IITD)' },
    { id: '1002', name: 'Jadavpur University, Kolkata' },
    { id: '1003', name: 'Presidency University, Kolkata' },
    { id: '1004', name: 'Calcutta University' },
    { id: '1005', name: 'National Institute of Technology, Durgapur' },
  ];

  stepperStages = [
    { num: 1, name: 'Academic & Bank Details' },
    { num: 2, name: 'Upload Documents' },
    { num: 3, name: 'Confirm & Submit' },
  ];

  uploadDocuments = [
    { key: 'incomeFileId', title: 'Family Income Certificate', fieldCode: 'incomeFileId' },
    { key: 'hsMarksheetFileId', title: '10+2 Marksheet', fieldCode: 'hsMarksheetFileId' },
    { key: 'bankPassbookFileId', title: 'Bank Passbook (Front)', fieldCode: 'bankPassbookFileId' },
  ];

  ngOnInit(): void {
    this.initForm();
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
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.applicationForm.patchValue({ [fieldKey]: file });
      this.applicationForm.get(fieldKey)?.markAsTouched();
    }
  }

  removeFile(fieldKey: string): void {
    this.applicationForm.patchValue({ [fieldKey]: null });
  }

  getFileName(fieldKey: string): string {
    const val = this.applicationForm.get(fieldKey)?.value;
    if (val instanceof File) return val.name;
    if (typeof val === 'string') return val;
    return '';
  }

  // Draft saving & step navigation
  handleDraftAndSave(): void {
    this.bankError = null;

    if (this.step === 1) {
      const step1Fields = [
        'instituteId', 'courseName', 'academicYear', 'lastQualificationCourse', 
        'lastQualificationMarks', 'lastQualificationExamRollNo', 'passOutBoardName', 
        'annualIncome', 'bankAccountNumber', 'confirmBankAccountNumber', 'ifscCode', 'confirmIfscCode'
      ];
      
      const isStep1Valid = step1Fields.every(field => {
        const val = this.applicationForm.get(field)?.value;
        return val !== null && val !== undefined && val.toString().trim() !== '';
      });

      if (!isStep1Valid) {
        this.bankError = 'All fields marked with an asterisk (*) are mandatory. Please complete all fields.';
        this._messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please complete all required fields in Step 1.'
        });
        return;
      }
      if (this.accountMismatch) {
        this.bankError = 'Bank Account Numbers do not match! Please verify both inputs.';
        this._messageService.add({
          severity: 'warn',
          summary: 'Account Mismatch',
          detail: 'Bank Account Numbers do not match.'
        });
        return;
      }
      if (this.ifscMismatch) {
        this.bankError = 'Bank IFSC Codes do not match! Please verify both inputs.';
        this._messageService.add({
          severity: 'warn',
          summary: 'IFSC Mismatch',
          detail: 'Bank IFSC Codes do not match.'
        });
        return;
      }
    }

    if (this.step === 2) {
      if (!this.applicationForm.value.incomeFileId || !this.applicationForm.value.hsMarksheetFileId || !this.applicationForm.value.bankPassbookFileId) {
        this.bankError = 'All 3 required document files marked with (*) must be uploaded.';
        this._messageService.add({
          severity: 'error',
          summary: 'Files Missing',
          detail: 'Please upload all 3 required verification documents.'
        });
        return;
      }
    }

    this._messageService.add({
      severity: 'success',
      summary: 'Draft Saved',
      detail: `Draft saved successfully at ${new Date().toLocaleTimeString()}`
    });

    this.step = Math.min(this.step + 1, 3);
  }

  onCancelClick(): void {
    this.router.navigate(['/student']);
  }

  onSubmitClick(): void {
    if (this.agreed && this.applicationForm.valid) {

      this.portalService.applyScholarship('1');

      const { confirmBankAccountNumber, confirmIfscCode, ...submitData } = this.applicationForm.value;
      
      this._messageService.add({
        severity: 'success',
        summary: 'Application Submitted',
        detail: 'Your scholarship application has been submitted successfully.'
      });

      this.submitForm.emit(submitData);

      this.router.navigate(['/student']);
    }
  }
}
