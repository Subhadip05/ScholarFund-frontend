import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { PortalService } from '../../../shared/portal.service';
import { Apiservice } from '../../../shared/api/apiservice';
import { ApplicationResponse, StudentProfileResponse } from '../../../shared/types';
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
  readonly applicationDetails = signal<ApplicationResponse | null>(null);
  userMetadata: any = null;

  studentDetailsForm!: FormGroup;
  visible: boolean = false;

  documents = {
    aadhaar: {
      id: null as number | null,
      url: null as string | null,
      name: null as string | null,
      folder: 'aadhaar',
      label: 'Aadhaar Document',
    },
    selfImage: {
      id: null as number | null,
      url: null as string | null,
      name: null as string | null,
      folder: 'self-image',
      label: 'Self Image',
    },
    signature: {
      id: null as number | null,
      url: null as string | null,
      name: null as string | null,
      folder: 'self-signature',
      label: 'Self Signature',
    },
  };

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
      phoneNumber: [
        this.userMetadata?.phoneNo,
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ],
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

        if (this.studentDetails?.isApplicationSubmitted) {
          this.fetchApplicationsByStudent(this.studentDetails?.profileId);
        }
        setTimeout(() => {
          Notiflix.Loading.remove();
        }, 1500);
      },
      error: (err) => {
        this.isProfileSaved.set(false);
        console.error(err);
        setTimeout(() => {
          Notiflix.Loading.remove();
        }, 1500);
      },
    });
  }

  fetchApplicationsByStudent(studentProfileId: any): void {
    this.apiService.getApplicationsByStudentId(studentProfileId).subscribe({
      next: (res) => {
        this.applicationDetails.set(res.data[0]);
        console.log('Fetching applications details for this student:', this.applicationDetails());
      },
      error: (err) => {
        console.log(err);
        this.applicationDetails.set(null);
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

  onFileSelected(event: Event, docKey: 'aadhaar' | 'selfImage' | 'signature') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (file.size > 1048576) {
      this._messageService.add({
        severity: 'warn',
        summary: 'File Too Large',
        detail: 'Max size is 1MB.',
      });
      input.value = '';
      return;
    }

    const docData = this.documents[docKey];
    Notiflix.Loading.pulse(`Uploading ${docData.label}...`, {});

    this.apiService.uploadDocument(file, docData.folder).subscribe({
      next: (res) => {
        if (res.status === 200 && res.data) {
          docData.id = res.data.documentId;
          docData.url = res.data.documentUrl;
          docData.name = file.name;

          this._messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${docData.label} uploaded successfully`,
          });
        }
        Notiflix.Loading.remove();
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to upload document.';
        this._messageService.add({ severity: 'error', summary: 'Upload Failed', detail: msg });
        input.value = '';
        Notiflix.Loading.remove();
      },
    });
  }

  saveBasicDetails() {
    console.log('Student details saving payload :', this.studentDetailsForm.value);

    if (this.studentDetailsForm.invalid) {
      this._messageService.add({
        severity: 'warn',
        summary: 'Incomplete Details',
        detail: 'Please fill out all required fields correctly.',
        life: 5000,
      });
      return;
    }

    if (
      !this.documents.aadhaar.id ||
      !this.documents.selfImage.id ||
      !this.documents.signature.id
    ) {
      this._messageService.add({
        severity: 'error',
        summary: 'Missing Documents',
        detail: 'Please upload all 3 mandatory documents before saving.',
        life: 5000,
      });
      return;
    }

    const payload = {
      ...this.studentDetailsForm.value,
      aadhaarFileId: this.documents.aadhaar.id,
      selfImageFileId: this.documents.selfImage.id,
      selfSignatureFileId: this.documents.signature.id,
    };

    Notiflix.Confirm.show(
      `Save Car Booking`,
      "After Saving you can't edit these basic details.Please re-check the details before saving.",
      'Yes',
      'No',
      () => {
        console.log('Student details after upload file:', payload);
        // return
        Notiflix.Loading.pulse('Saving Profile Details...', {});
        this.apiService.saveStudentProfile(payload).subscribe({
          next: (res) => {
            if (res.status === 200) {
              this._messageService.add({
                severity: 'success',
                summary: 'Profile Saved',
                detail: res.message || 'Your profile has been updated successfully.',
                life: 5000,
              });

              this.closeModal();
              this.fetchStudentProfile();
            }
            Notiflix.Loading.remove();
          },
          error: (err) => {
            console.error('Failed to save profile:', err);
            this._messageService.add({
              severity: 'error',
              summary: 'Save Failed',
              detail: err.error?.message || 'An error occurred while saving your profile.',
              life: 5000,
            });
            Notiflix.Loading.remove();
          },
        });
      },
      () => {
        console.log('Say No...');
      },
    );
  }

  downloadApplicationForm() {
    console.log('Downloading application clicked');
  }

  applyForScheme() {
    this.router.navigate(['/application-form']);
  }

  getTimelineMeta(actionTaken: string = '') {
    const action = actionTaken.toUpperCase();

    if (action.includes('DISBURSED')) {
      return {
        icon: 'pi pi-check-circle',
        iconColor: 'text-emerald-600',
        nodeBg: 'bg-emerald-50 border-emerald-500 ring-emerald-100',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeLabel: 'Disbursed',
      };
    }
    if (action.includes('ADMIN_APPROVED')) {
      return {
        icon: 'pi pi-verified',
        iconColor: 'text-indigo-600',
        nodeBg: 'bg-indigo-50 border-indigo-500 ring-indigo-100',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        badgeLabel: 'Admin Approved',
      };
    }
    if (action.includes('INSTITUTE_VERIFIED')) {
      return {
        icon: 'pi pi-building',
        iconColor: 'text-blue-600',
        nodeBg: 'bg-blue-50 border-blue-500 ring-blue-100',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        badgeLabel: 'College Verified',
      };
    }
    if (action.includes('REJECTED')) {
      return {
        icon: 'pi pi-times-circle',
        iconColor: 'text-rose-600',
        nodeBg: 'bg-rose-50 border-rose-500 ring-rose-100',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        badgeLabel: 'Rejected',
      };
    }
    return {
      icon: 'pi pi-file-edit',
      iconColor: 'text-slate-600',
      nodeBg: 'bg-slate-50 border-slate-400 ring-slate-100',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      badgeLabel: 'Submitted',
    };
  }
}
