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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TimerUtil } from '../../../shared/utils/timer.util';

@Component({
  selector: 'app-modals',
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  templateUrl: './modals.html',
  styleUrl: './modals.css',
  providers: [MessageService],
})
export class Modals {
  public portalService = inject(PortalService);
  private _authService = inject(Authservice);
  private _fb = inject(FormBuilder);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);
  private _messageService = inject(MessageService);

  studentLoginForm!: FormGroup;
  studentRegisterForm!: FormGroup;
  collegeForm!: FormGroup;
  adminLoginFrom!: FormGroup;

  // Student Login States
  studentLoginOtpSent = false;
  studentLoginOtpError = '';

  // Student Register States
  registerOtpSent = false;
  registerOtpError = '';
  studentRegisterSubmit = false;

  // College Admin States
  collegeOtpSent = false;
  collegeOtpError = '';
  collegeShowRegisterForm = false;
  submitCollegeRegister = false;

  // Govt Admin States
  adminLoginSubmit = false;

  studentTimer = new TimerUtil();
  studentRegistrationOtpTimer = new TimerUtil();
  collegeLoginTimer = new TimerUtil();

  ngOnInit() {
    this.initForms();
    this.studentLoginForm.valueChanges.subscribe(() => {
      if (this.studentLoginOtpError) {
        this.studentLoginOtpError = '';
        this._cdr.detectChanges();
      }
    });
  }

  initForms() {
    this.studentLoginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      otpCode: [''],
      role: 'STUDENT',
    });

    this.studentRegisterForm = this._fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      otpCode: [''],
      role: 'STUDENT',
    });

    this.collegeForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      contactPersonName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      otpCode: [''],
      role: 'COLLEGE',
    });

    this.adminLoginFrom = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  closeModal() {
    this.adminLoginSubmit = false;
    this.studentRegisterSubmit = false;
    this.submitCollegeRegister = false;
    this.portalService.closeModal();
    this.resetFormStates();
  }

  resetFormStates() {
    this.studentLoginOtpSent = false;
    this.studentLoginOtpError = '';
    this.studentLoginForm.get('otpCode')?.reset();

    this.registerOtpSent = false;
    this.registerOtpError = '';
    this.studentRegisterForm.reset();

    this.collegeOtpSent = false;
    this.collegeOtpError = '';
    this.collegeShowRegisterForm = false;
    this.collegeForm.reset();
  }

  sendStudentLoginOtp() {
    const email = this.studentLoginForm.get('email')?.value;

    if (!email || this.studentLoginForm.get('email')?.invalid) {
      this.studentLoginOtpError = 'Please enter a valid email first.';
      this._cdr.detectChanges();
      return;
    }

    this.studentLoginOtpError = '';
    this._cdr.detectChanges();

    Notiflix.Loading.pulse('Loading...', {});
    this._authService.requestOtp({ email: email, role: 'STUDENT' }).subscribe({
      next: (res) => {
        if (res?.status === 200) {
          this._messageService.add({
            severity: 'success',
            summary: 'OTP Sent',
            detail: res.message,
            life: 5000,
          });

          this.studentLoginOtpSent = true;
          this.startStudetOtpTimer();
          this.studentLoginForm.get('email')?.disable();
        }

        console.log('Reqest otp response', res);

        Notiflix.Loading.remove();
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.studentLoginOtpSent = false;
        this.studentLoginOtpError =
          err.error?.message || 'Failed to send OTP. Please try again after some time.';
        this._cdr.detectChanges();
        Notiflix.Loading.remove();

        if (err?.error?.code === 'USER_NOT_FOUND') {
          this.portalService.openModal('register');
          this._messageService.add({
            severity: 'info',
            summary: 'User Not Found',
            detail: 'Please register yourself first.',
            life: 5000,
          });
        }
      },
    });
  }

  onStudentLoginSubmit(event: Event) {
    event.preventDefault();

    const otpCode = this.studentLoginForm.get('otpCode')?.value;

    if (!this.studentLoginOtpSent) {
      this.studentLoginOtpError = "Please click 'Send OTP' first.";
      this._cdr.detectChanges();
      return;
    }

    if (!otpCode || otpCode.length != 6) {
      this.studentLoginOtpError = 'Please enter the 6-digit OTP sent to your email.';
      this._cdr.detectChanges();
      return;
    }

    this.studentLoginOtpError = '';
    this._cdr.detectChanges();

    const loginPayload = this.studentLoginForm.getRawValue();
    Notiflix.Loading.pulse('Loading...', {});

    this._authService.verifyOtpAndLogin(loginPayload).subscribe({
      next: (res) => {
        console.log('Student login response :', res);
        this._authService.saveTokens(res.data?.accessToken, res.data?.refreshToken);

        this.portalService.userRole = 'student';

        this.portalService.userMetadata = {
          name: res.data?.fullName,
          email: res.data?.email,
          phoneNo: res.data?.phoneNo,
        };

        sessionStorage.setItem('user_role', 'student');
        sessionStorage.setItem('user_metadata', JSON.stringify(this.portalService.userMetadata));

        this.closeModal();
        this.studentLoginForm.reset();
        Notiflix.Loading.remove();

        this._router.navigate(['/student']);
      },
      error: (err) => {
        this.studentLoginOtpError = err.error?.message || 'Invalid OTP entered. Please try again.';
        this._cdr.detectChanges();

        Notiflix.Loading.remove();
        this._messageService.add({
          severity: 'error',
          summary: 'Student Login Failed',
          detail: err.error?.message,
          life: 5000,
        });
      },
    });
  }

  studentRegisterOtp() {
    this.studentRegisterSubmit = true;

    if (this.studentRegisterForm.invalid) return;
    const registrationPayload = this.studentRegisterForm.getRawValue();
    console.log('Student Registration and request for otp. ', registrationPayload);

    Notiflix.Loading.pulse('Loading...', {});
    this._authService.registerStudent(registrationPayload).subscribe({
      next: (res) => {
        console.log('Student registration otp response', res);

        this._messageService.add({
          severity: 'success',
          summary: 'OTP Sent',
          detail: res.message,
          life: 5000,
        });

        this.studentRegisterForm.get('fullName')?.disable();
        this.studentRegisterForm.get('email')?.disable();
        this.studentRegisterForm.get('phoneNumber')?.disable();

        this.registerOtpSent = true;
        this.registerStudentOtpTimer();
        Notiflix.Loading.remove();
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.registerOtpSent = false;
        this.registerOtpError =
          err.error?.message || 'Failed to send OTP. Please try again after some time.';
        this._messageService.add({
          severity: 'error',
          summary: 'OTP Request Failed',
          detail: 'Failed to send otp. Please try again after some time.',
          life: 5000,
        });
        this._cdr.detectChanges();
        Notiflix.Loading.remove();
      },
    });
  }

  onStudentRegisterSubmit(event: Event) {
    event.preventDefault();
    const formValues = this.studentRegisterForm.getRawValue();

    if (!formValues.otpCode) {
      this.registerOtpError = "Please enter 'OTP' first.";
      return;
    }

    if (!formValues.otpCode || formValues.otpCode.length != 6) {
      this.registerOtpError = 'Please enter the 6-digit OTP sent to your email.';
      this._cdr.detectChanges();
      return;
    }

    console.log('Student Register form value :', formValues);

    this._authService.verifyOtpAndLogin(formValues).subscribe({
      next: (res) => {
        console.log('Student otp verify response :', res);
        this._authService.saveTokens(res.data?.accessToken, res.data?.refreshToken);

        this.portalService.userRole = 'student';

        this.portalService.userMetadata = {
          name: res.data?.fullName,
          email: res.data?.email,
          phoneNo: res.data?.phoneNo,
        };

        sessionStorage.setItem('user_role', 'student');
        sessionStorage.setItem('user_metadata', JSON.stringify(this.portalService.userMetadata));

        this.closeModal();
        this.studentRegisterForm.reset();
        Notiflix.Loading.remove();

        this._router.navigate(['/student']);
      },
      error: (err) => {
        this.registerOtpError = err.error?.message || 'Invalid OTP entered. Please try again.';
        this._cdr.detectChanges();

        Notiflix.Loading.remove();
        this._messageService.add({
          severity: 'error',
          summary: 'OTP Verification Failed',
          detail: err.error?.message,
          life: 5000,
        });
      },
    });
  }

  requestCollegeLoginOTP() {
    const email = this.collegeForm.get('email')?.value;

    if (!email || this.collegeForm.get('email')?.invalid) {
      this.collegeOtpError = 'Please enter a valid institute email first.';
      this._cdr.detectChanges();
      return;
    }

    this._cdr.detectChanges();
    this.collegeOtpError = '';

    Notiflix.Loading.pulse('Loading...', {});
    this._authService.requestOtp({ email: email, role: 'COLLEGE' }).subscribe({
      next: (res) => {
        console.log('Reqest otp response', res);

        if (res?.status === 200) {
          this.collegeOtpSent = true;
          this.collegeForm.get('email')?.disable();

          this._messageService.add({
            severity: 'success',
            summary: 'OTP Sent',
            detail: res?.message,
            life: 5000,
          });

          this.collegeOtpError = '';
          this.startCollageLoginTimer();
          Notiflix.Loading.remove();
          this._cdr.detectChanges();
        }
      },
      error: (err) => {
        console.log('Institute Login error:', err);

        if (err?.status === 404 && err?.error?.code === 'USER_NOT_FOUND') {
          this._messageService.add({
            severity: 'info',
            summary: 'Institute Not Found',
            detail: 'Please complete registration first.',
            life: 5000,
          });
          this.collegeShowRegisterForm = true;
        }
        if (err?.status === 500 && err?.error?.code === 'USER_EXIST_DIFF_ROLE') {
          this._messageService.add({
            severity: 'warn',
            summary: 'User Exists',
            detail: err?.error?.message,
            life: 5000,
          });
        }
        this.collegeOtpSent = false;
        this.collegeOtpError = 'Failed to send OTP';
        Notiflix.Loading.remove();
        this._cdr.detectChanges();
      },
    });
  }

  requestCollegeRegisterOtp() {
    this.submitCollegeRegister = true;

    if (this.collegeForm.invalid) return;
    const registerCollegePayload = this.collegeForm.getRawValue();
    console.log('Institute Registration and request for otp payload:', registerCollegePayload);

    Notiflix.Loading.pulse('Loading...', {});
    this._authService.registerCollege(registerCollegePayload).subscribe({
      next: (res) => {
        console.log('Institute registration otp response', res);

        this._messageService.add({
          severity: 'success',
          summary: 'OTP Sent',
          detail: res.message,
          life: 5000,
        });

        this.collegeForm.get('contactPersonName')?.disable();
        this.collegeForm.get('email')?.disable();
        this.collegeForm.get('phoneNumber')?.disable();

        this.collegeOtpSent = true;
        this.collegeOtpError = '';
        this.startCollageLoginTimer();
        Notiflix.Loading.remove();
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.collegeOtpSent = false;
        this.collegeOtpError =
          err.error?.message || 'Failed to send OTP. Please try again after some time.';
        this._messageService.add({
          severity: 'error',
          summary: 'OTP Request Failed',
          detail: 'Failed to send otp. Please try again after some time.',
          life: 5000,
        });
        this._cdr.detectChanges();
        Notiflix.Loading.remove();
      },
    });
  }

  onCollegeVerifyOTPSubmit(event: Event) {
    event.preventDefault();
    const otpCode = this.collegeForm.get('otpCode')?.value;
    if (!this.collegeOtpSent) {
      this.collegeOtpError = "Please click 'Send OTP' first.";
      this._cdr.detectChanges();
      return;
    }

    if (!otpCode || otpCode.length != 6) {
      this.collegeOtpError = 'Please enter the 6-digit OTP sent to your email.';
      this._cdr.detectChanges();
      return;
    }

    this.collegeOtpError = '';
    this._cdr.detectChanges();

    const otpVerifyPayload = this.collegeForm.getRawValue();
    console.log('Institute otp verify payload:', otpVerifyPayload);

    Notiflix.Loading.pulse('Loading...', {});
    this._authService.verifyOtpAndLogin(otpVerifyPayload).subscribe({
      next: (res) => {
        console.log('College login response :', res);
        this._authService.saveTokens(res.data?.accessToken, res.data?.refreshToken);

        this.portalService.userRole = 'college-admin';

        this.portalService.userMetadata = {
          name: res.data?.fullName,
          email: res.data?.email,
          phoneNo: res.data?.phoneNo,
        };

        sessionStorage.setItem('user_role', 'college-admin');
        sessionStorage.setItem('user_metadata', JSON.stringify(this.portalService.userMetadata));

        this.closeModal();
        this.collegeOtpError = '';
        this.collegeForm.reset();
        Notiflix.Loading.remove();

        this._router.navigate(['/college']);
      },
      error: (err) => {
        this.collegeOtpError = err.error?.message || 'Invalid OTP entered. Please try again.';
        this._cdr.detectChanges();

        Notiflix.Loading.remove();
        this._messageService.add({
          severity: 'error',
          summary: 'Institute Login Failed',
          detail: err.error?.message,
          life: 5000,
        });
      },
    });
  }

  onGovtLoginSubmit(event: Event) {
    event.preventDefault();
    this.adminLoginSubmit = true;

    if (this.adminLoginFrom.invalid) return;

    const adminloginPayload = this.adminLoginFrom.value;
    console.log('Admin Login form value: ', adminloginPayload);
    // return;

    Notiflix.Loading.pulse('Loading...', {});
    this._authService.adminLogin(adminloginPayload).subscribe({
      next: (res) => {
        console.log('Admin login response :', res);
        this._authService.saveTokens(res.data.accessToken, res.data.refreshToken);

        this.portalService.userRole = 'GOVT';
        this.portalService.userMetadata = {
          name: res.data?.fullName,
          email: res.data?.email,
        };

        sessionStorage.setItem('user_role', 'GOVT');
        sessionStorage.setItem('user_metadata', JSON.stringify(this.portalService.userMetadata));

        this.closeModal();
        Notiflix.Loading.remove();

        this.adminLoginFrom.reset();
        this._router.navigate(['/government']);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Admin login failed. Please try again.';
        console.log(errorMsg);
        Notiflix.Loading.remove();
        this._messageService.add({
          severity: 'error',
          summary: 'Admin Login Failed',
          detail: errorMsg,
          life: 5000,
        });
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

  startStudetOtpTimer() {
    this.studentLoginForm.get('otpCode')?.enable();
    this.studentLoginOtpError = '';

    this.studentTimer.start(300, () => {
      this.studentLoginOtpError = 'Your OTP has expired. Please request a new one.';
      this.studentLoginForm.get('otpCode')?.disable();
      this._cdr.markForCheck();
    });
  }

  registerStudentOtpTimer() {
    this.studentRegisterForm.get('otpCode')?.enable();
    this.registerOtpError = '';

    this.studentRegistrationOtpTimer.start(300, () => {
      this.registerOtpError = 'Your OTP has expired. Please request a new one.';
      this.registerOtpSent = false;
      this.studentRegisterForm.get('otpCode')?.disable();
      this._cdr.markForCheck();
    });
  }

  startCollageLoginTimer() {
    this.collegeForm.get('otpCode')?.enable();
    this.collegeOtpError = '';

    this.collegeLoginTimer.start(300, () => {
      this.collegeOtpError = 'Your OTP has expired. Please request a new one.';
      this.collegeOtpSent = false;
      this.collegeForm.get('otpCode')?.disable();
      this._cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.studentTimer.stop();
    this.studentRegistrationOtpTimer.stop();
    this.collegeLoginTimer.stop();
  }
}
