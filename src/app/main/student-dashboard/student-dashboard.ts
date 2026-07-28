import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { PortalService } from '../../../shared/portal.service';
import { Apiservice } from '../../../shared/api/apiservice';
import { StudentProfileResponse } from '../../../shared/types';
import { Router } from '@angular/router';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import Notiflix from 'notiflix';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-student-dashboard',
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
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
  providers: [MessageService],
})
export class StudentDashboard implements OnInit {
  public portalService = inject(PortalService);
  private apiService = inject(Apiservice);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private _messageService = inject(MessageService);

  isProfileSaved = signal<boolean>(false);
  studentDetails: StudentProfileResponse | null = null;
  userMetadata: any = null;

  studentDetailsForm!: FormGroup;
  visible: boolean = false;

  aadhaarFileId: number | null = null;
  selfImageFileId: number | null = null;
  selfSignatureFileId: number | null = null;

  constructor() {
    const savedMetadata = sessionStorage.getItem('user_metadata');
    if (savedMetadata) {
      this.userMetadata = JSON.parse(savedMetadata);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.fetchStudentProfile();
  }

  initForm() {
    this.studentDetailsForm = this.fb.group({
      fullName: [this.userMetadata?.name, Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      aadhaarNumber: ['', Validators.required],
      address: ['', Validators.required],
      isWestBengalResident: [false],
    });
  }

  fetchStudentProfile() {
    Notiflix.Loading.pulse('Loading...', {});
    this.apiService.getStudentProfile().subscribe({
      next: (res) => {
        this.studentDetails = res.data;
        this.isProfileSaved.set(true);
        console.log('Student Profile response:', this.studentDetails);
        setTimeout(() => {
          Notiflix.Loading.remove();
        }, 3000);
      },
      error: (err) => {
        this.isProfileSaved.set(false);
        console.error(err);
        setTimeout(() => {
          Notiflix.Loading.remove();
        }, 3000);
      },
    });
  }

  openBasicDetailsModal() {
    console.log('Student Details modal open');
    this.visible = true;
  }

  closeModal() {
    this.visible = false;
  }

  onFileSelected(event: Event, type: 'aadhaar' | 'selfImage' | 'signature') {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      let folderName = 'general';
      let documentName = 'Document';

      if (type === 'aadhaar') {
        folderName = 'aadhaar';
        documentName = 'Aadhaar Document';
      } else if (type === 'selfImage') {
        folderName = 'self-image';
        documentName = 'Self Image';
      } else if (type === 'signature') {
        folderName = 'self-signature';
        documentName = 'Self Signature';
      }

      Notiflix.Loading.pulse(`Uploading ${documentName}...`, {});

      this.apiService.uploadDocument(file, folderName).subscribe({
        next: (res) => {
          if (res.status === 200 && res.data?.documentId) {
            const uploadedId = res.data.documentId;

            if (type === 'aadhaar') this.aadhaarFileId = uploadedId;
            if (type === 'selfImage') this.selfImageFileId = uploadedId;
            if (type === 'signature') this.selfSignatureFileId = uploadedId;

            this._messageService.add({
              severity: 'success',
              summary: `${documentName} Uploaded`,
              detail: res.message || 'File uploaded successfully',
            });
          }

          Notiflix.Loading.remove();
        },
        error: (err) => {
          console.error(`Failed to upload ${type}:`, err);

          this._messageService.add({
            severity: 'error',
            summary: 'Upload Failed',
            detail: `Failed to upload ${documentName}. Please try again.`,
          });

          Notiflix.Loading.remove();
        },
      });
    }
  }

  saveBasicDetails() {
    console.log('Student details saving payload :', this.studentDetailsForm.value);

    if (this.studentDetailsForm.invalid) {
      this._messageService.add({
        severity: 'warn',
        summary: 'Incomplete Details',
        detail: 'Please fill out all required fields correctly.',
      });
      return;
    }

    if (!this.aadhaarFileId || !this.selfImageFileId || !this.selfSignatureFileId) {
      this._messageService.add({
        severity: 'error',
        summary: 'Missing Documents',
        detail: 'Please upload all 3 mandatory documents before saving.',
      });
      return;
    }

    const payload = {
      ...this.studentDetailsForm.value,
      aadhaarFileId: this.aadhaarFileId,
      selfImageFileId: this.selfImageFileId,
      selfSignatureFileId: this.selfSignatureFileId,
    };

    console.log('Student details after upload file:', payload);
    return;

    Notiflix.Loading.pulse('Saving Profile Details...', {});

    this.apiService.saveStudentProfile(payload).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this._messageService.add({
            severity: 'success',
            summary: 'Profile Saved',
            detail: res.message || 'Your profile has been updated successfully.',
          });

          this.closeModal();
        }
        Notiflix.Loading.remove();
      },
      error: (err) => {
        console.error('Failed to save profile:', err);
        this._messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: err.error?.message || 'An error occurred while saving your profile.',
        });
        Notiflix.Loading.remove();
      },
    });
  }

  readonly schemeId = '1';

  get isApplied(): boolean {
    return this.portalService.appliedScholarships.includes(this.schemeId);
  }

  applyForScheme() {
    this.router.navigate(['/application-form']);
    // this.portalService.applyScholarship(this.schemeId);
  }
}
