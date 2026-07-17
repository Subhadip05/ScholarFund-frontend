import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PortalService } from '../../../shared/portal.service';

@Component({
  selector: 'app-modals',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modals.html',
  styleUrl: './modals.css',
})
export class Modals {
  public portalService = inject(PortalService);
  private _fb = inject(FormBuilder);

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  // Student Login States
  loginOtpSent = false;
  loginOtpCode = '';
  loginOtpError = '';

  // Student Register States
  registerOtpSent = false;
  registerOtpCode = '';
  registerOtpError = '';

  // College Admin States
  collegeNodalId = new FormControl('nodal.officer@iitd.ac.in');
  collegeOtpSent = false;
  collegeOtpCode = '';
  collegeOtpInput = new FormControl('');
  collegeOtpError = '';
  collegeShowRegisterForm = false;
  collegeContactName = new FormControl('');
  collegePhone = new FormControl('');

  // Govt Admin States
  govtDept = new FormControl('Ministry of Education (MoE)');
  govtEmail = new FormControl('director-schol@nic.in');
  govtPassphrase = new FormControl('official-token-nic');

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      otpInput: [''],
    });

    this.registerForm = this._fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      otpInput: [''],
    });
  }

  closeModal() {
    this.portalService.closeModal();
    this.resetOtpStates();
  }

  resetOtpStates() {
    this.loginOtpSent = false;
    this.loginOtpCode = '';
    this.loginOtpError = '';
    this.loginForm.get('otpInput')?.reset();

    this.registerOtpSent = false;
    this.registerOtpCode = '';
    this.registerOtpError = '';
    this.registerForm.get('otpInput')?.reset();

    this.registerForm.get('name')?.enable();
    this.registerForm.get('email')?.enable();
    this.registerForm.get('mobile')?.enable();

    this.collegeOtpSent = false;
    this.collegeOtpCode = '';
    this.collegeOtpInput.setValue('');
    this.collegeOtpError = '';
    this.collegeShowRegisterForm = false;
  }

  sendStudentLoginOtp() {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.loginOtpError = 'Please enter your email first.';
      return;
    }
    this.loginOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.loginOtpSent = true;
    this.loginOtpError = '';
  }

  onStudentLoginSubmit(event: Event) {
    event.preventDefault();
    const otpInput = this.loginForm.get('otpInput')?.value;
    const email = this.loginForm.get('email')?.value;

    if (!this.loginOtpSent) {
      this.loginOtpError = "Please click 'Send OTP' first.";
      return;
    }
    if (otpInput !== this.loginOtpCode) {
      this.loginOtpError = 'Invalid OTP entered. Please try again.';
      return;
    }

    this.portalService.currentUser = email;
    this.portalService.userRole = 'student';
    this.portalService.userMetadata = {
      name: email === 'john.doe@academic.edu' ? 'John Doe' : email?.split('@')[0],
      email: email,
      category: 'OBC',
      income: 240000,
      gpa: 8.8,
      regNo: 'REG-2026-9048',
      college: 'Indian Institute of Technology, Delhi',
    };

    this.closeModal();
  }

  sendRegisterOtp() {
    if (this.registerForm.invalid) return;

    this.registerForm.get('name')?.disable();
    this.registerForm.get('email')?.disable();
    this.registerForm.get('mobile')?.disable();

    this.registerOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.registerOtpSent = true;
    this.registerOtpError = '';
  }

  onRegisterSubmit(event: Event) {
    event.preventDefault();
    const formValues = this.registerForm.getRawValue();

    if (!this.registerOtpSent) {
      this.registerOtpError = "Please click 'Send OTP' first.";
      return;
    }
    if (formValues.otpInput !== this.registerOtpCode) {
      this.registerOtpError = 'Invalid OTP entered. Please try again.';
      return;
    }

    console.log('Student Register form value :', formValues);

    this.portalService.currentUser = formValues.email;
    this.portalService.userRole = 'student';
    this.portalService.userMetadata = {
      name: formValues.name || 'New Scholar',
      email: formValues.email,
      category: formValues.category,
      income: Number(formValues.income),
      gpa: Number(formValues.gpa),
      regNo: 'REG-2026-' + Math.floor(1000 + Math.random() * 9000),
      college: 'State Technological University',
    };

    this.portalService.studentTimeline = [
      { label: 'Student Register/Login', status: 'completed', date: 'Just now' },
      { label: 'Scholarship Apply', status: 'pending', date: 'Awaiting Submission' },
      { label: 'Institute Verification', status: 'upcoming', date: 'Awaiting Application' },
      {
        label: 'Government Approved Scholarship',
        status: 'upcoming',
        date: 'Awaiting Verification',
      },
      { label: 'Money Distribute By Govt.', status: 'upcoming', date: 'Awaiting Approval' },
    ];

    this.closeModal();
  }

  verifyCollegeEmail() {
    if (!this.collegeNodalId.value) {
      this.collegeOtpError = 'Please enter your nodal email first.';
      return;
    }
    const exists = this.portalService.registeredColleges.some(
      (c: { email: string }) => c.email.toLowerCase() === this.collegeNodalId.value?.toLowerCase(),
    );
    if (exists) {
      this.collegeOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
      this.collegeOtpSent = true;
      this.collegeOtpError = '';
    } else {
      this.collegeShowRegisterForm = true;
      this.collegeOtpError = '';
    }
  }

  sendCollegeRegisterOtp() {
    if (!this.collegeContactName.value || !this.collegePhone.value) {
      this.collegeOtpError = 'Please provide Contact Person Name and Phone Number.';
      return;
    }
    this.collegeOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.collegeOtpSent = true;
    this.collegeOtpError = '';
  }

  onCollegeLoginSubmit(event: Event) {
    event.preventDefault();
    if (!this.collegeOtpSent) {
      this.collegeOtpError = "Please click 'Send OTP' first.";
      return;
    }
    if (this.collegeOtpInput.value !== this.collegeOtpCode) {
      this.collegeOtpError = 'Invalid 6-digit OTP entered. Please try again.';
      return;
    }

    let matchedCollege = this.portalService.registeredColleges.find(
      (c: { email: string }) => c.email.toLowerCase() === this.collegeNodalId.value?.toLowerCase(),
    );

    if (!matchedCollege) {
      matchedCollege = {
        email: this.collegeNodalId.value || '',
        contactPersonName: this.collegeContactName.value || 'Nodal Officer',
        phone: this.collegePhone.value || '+91 99999 99999',
        code: 'AISHE-C-' + Math.floor(10000 + Math.random() * 90000),
        collegeName: this.collegeContactName.value
          ? `${this.collegeContactName.value} Institution`
          : 'State Technical Institute',
      };
      this.portalService.registeredColleges.push(matchedCollege);
    }

    this.portalService.currentUser = this.collegeNodalId.value;
    this.portalService.userRole = 'college-admin';
    this.portalService.userMetadata = {
      name: matchedCollege.contactPersonName,
      email: this.collegeNodalId.value,
      code: matchedCollege.code,
      college: matchedCollege.collegeName,
      department: 'Academic & Scholarship Division',
    };

    this.closeModal();
  }

  onGovtLoginSubmit(event: Event) {
    event.preventDefault();
    this.portalService.currentUser = this.govtEmail.value;
    this.portalService.userRole = 'govt-admin';
    this.portalService.userMetadata = {
      name: 'National Scholarship Directorate',
      department: this.govtDept.value,
      email: this.govtEmail.value,
      clearance: 'Level 1 Administrator',
    };
    this.closeModal();
  }

  //Modal header color fixing through ts
  getHeaderConfig() {
    const current = this.portalService.activeModal();

    switch (current) {
      case 'student-login':
        return {
          bg: 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800',
          icon: 'pi pi-graduation-cap',
          title: 'Student Access Gateway',
          desc: 'Direct secure OTP authentication portal',
        };
      case 'register':
        return {
          bg: 'bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900',
          icon: 'pi pi-user',
          title: 'New Student Registration',
          desc: 'Instant secure email verification',
        };
      case 'college-login':
        return {
          bg: 'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950',
          icon: 'pi pi-building',
          title: 'Institutional Nodal Desk',
          desc: 'Nodal verification officer secure gateway',
        };
      case 'eligibility-checker':
        return {
          bg: 'bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-800',
          icon: 'pi pi-verified',
          title: 'Scholarship Eligibility Criteria',
          desc: 'Official qualification requirements checklist',
        };
      case 'govt-login':
      default:
        return {
          bg: 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800',
          icon: 'pi pi-briefcase',
          title: 'Central State Directorate',
          desc: 'Authorized department clearance console',
        };
    }
  }
}
