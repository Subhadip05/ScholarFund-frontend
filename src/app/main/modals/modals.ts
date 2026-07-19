import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PortalService } from '../../../shared/portal.service';
import { Router } from '@angular/router';
import Notiflix from 'notiflix';
import { Authservice } from '../../../shared/auth/authservice';

@Component({
  selector: 'app-modals',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modals.html',
  styleUrl: './modals.css',
})
export class Modals {
  public portalService = inject(PortalService);
  private authService = inject(Authservice);
  private _fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loginForm!: FormGroup;
  studentRegisterForm!: FormGroup;
  collageLoginForm!: FormGroup;
  adminLoginFrom!: FormGroup;

  // Student Login States
  loginOtpSent = false;
  loginOtpError = '';

  // Student Register States
  registerOtpSent = false;
  registerOtpCode = '';
  registerOtpError = '';
  studentRegisterSubmit = false;

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
  adminLoginSubmit = false;

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      otpCode: [''],
    });

    this.studentRegisterForm = this._fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      otpCode: [''],
    });

    this.collageLoginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      otpCode: [''],
    });

    this.adminLoginFrom = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  closeModal() {
    this.adminLoginSubmit = false;
    this.studentRegisterSubmit = false;
    this.portalService.closeModal();
    this.resetOtpStates();
  }

  resetOtpStates() {
    this.loginOtpSent = false;
    this.loginOtpError = '';
    this.loginForm.get('otpCode')?.reset();

    this.registerOtpSent = false;
    this.registerOtpCode = '';
    this.registerOtpError = '';
    this.studentRegisterForm.get('otpCode')?.reset();

    this.studentRegisterForm.get('fullName')?.enable();
    this.studentRegisterForm.get('email')?.enable();
    this.studentRegisterForm.get('phoneNumber')?.enable();

    this.collegeOtpSent = false;
    this.collegeOtpCode = '';
    this.collegeOtpInput.setValue('');
    this.collegeOtpError = '';
    this.collegeShowRegisterForm = false;
  }

  sendStudentLoginOtp() {
    const email = this.loginForm.get('email')?.value;

    if (!email || this.loginForm.get('email')?.invalid) {
      this.loginOtpError = 'Please enter a valid email first.';
      return;
    }

    this.loginOtpError = '';

    Notiflix.Loading.pulse('Loading...', {});
    this.authService.requestOtp({ email: email }).subscribe({
      next: (res) => {
        console.log('Reqest otp response', res.message);

        this.loginOtpSent = true;
        Notiflix.Loading.remove();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loginOtpSent = false;
        this.loginOtpError = err.error?.message || 'Failed to send OTP. Please try again.';
        Notiflix.Loading.remove();
        this.cdr.detectChanges();
      },
    });
  }

  onStudentLoginSubmit(event: Event) {
    event.preventDefault();

    const email = this.loginForm.get('email')?.value;
    const otpCode = this.loginForm.get('otpCode')?.value;

    if (!this.loginOtpSent) {
      this.loginOtpError = "Please click 'Send OTP' first.";
      return;
    }

    if (!otpCode || otpCode.length != 6) {
      this.loginOtpError = 'Please enter the 6-digit OTP sent to your email.';
      return;
    }

    const loginPayload = this.loginForm.value;
    Notiflix.Loading.pulse('Loading...', {});

    this.authService.verifyOtpAndLogin(loginPayload).subscribe({
      next: (res) => {
        console.log('Student login response :', res);
        this.authService.saveTokens(res.data.accessToken, res.data.refreshToken);

        this.portalService.currentUser = email;
        this.portalService.userRole = 'student';

        this.portalService.userMetadata = {
          name: email.split('@')[0],
          email: email,
          category: 'OBC',
          income: 240000,
          gpa: 8.8,
          regNo: 'REG-2026-9048',
          college: 'Indian Institute of Technology, Delhi',
        };

        localStorage.setItem('user_role', 'student');
        localStorage.setItem('user_metadata', JSON.stringify(this.portalService.userMetadata));

        this.closeModal();
        Notiflix.Loading.remove();

        this.router.navigate(['/student']);
      },
      error: (err) => {
        this.loginOtpError = err.error?.message || 'Invalid OTP entered. Please try again.';
        Notiflix.Loading.remove();
      },
    });
  }

  studentRegisterOtp() {
    this.studentRegisterSubmit = true;

    if (this.studentRegisterForm.invalid) return;
    console.log(
      'Student Registration and request for otp. ',
      this.studentRegisterForm.getRawValue(),
    );

    this.studentRegisterForm.get('fullName')?.disable();
    this.studentRegisterForm.get('email')?.disable();
    this.studentRegisterForm.get('phoneNumber')?.disable();

    this.registerOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.registerOtpSent = true;
    this.registerOtpError = '';
  }

  onStudentRegisterSubmit(event: Event) {
    event.preventDefault();
    const formValues = this.studentRegisterForm.getRawValue();

    if (!this.registerOtpSent) {
      this.registerOtpError = "Please click 'Send OTP' first.";
      return;
    }
    if (formValues.otpCode !== this.registerOtpCode) {
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

    this.studentRegisterForm.reset();
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
    this.router.navigate(['/college']);
  }

  onGovtLoginSubmit(event: Event) {
    event.preventDefault();
    this.adminLoginSubmit = true;

    if (this.adminLoginFrom.invalid) return;

    const adminloginPayload = this.adminLoginFrom.value;
    console.log('Admin Login form value: ', adminloginPayload);
    // return;

    Notiflix.Loading.pulse('Loading...', {});
    this.authService.adminLogin(adminloginPayload).subscribe({
      next: (res) => {
        console.log('Admin login response :', res);
        this.authService.saveTokens(res.data.accessToken, res.data.refreshToken);

        this.portalService.currentUser = 'Ministry of Education (MoE)';
        this.portalService.userRole = 'GOVT';
        this.portalService.userMetadata = {
          name: 'National Scholarship Directorate',
          department: 'Ministry of Education (MoE)',
          email: this.adminLoginFrom.get('email')?.value,
          clearance: 'Level 1 Administrator',
        };

        localStorage.setItem('user_role', 'GOVT');
        localStorage.setItem('user_metadata', JSON.stringify(this.portalService.userMetadata));

        this.closeModal();
        Notiflix.Loading.remove();

        this.adminLoginFrom.reset();
        this.router.navigate(['/government']);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Admin login failed. Please try again.';
        console.log(errorMsg);
        Notiflix.Loading.remove();
      },
    });
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
