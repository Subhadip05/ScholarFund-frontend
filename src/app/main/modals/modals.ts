import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { PortalService } from '../../../shared/portal.service';


@Component({
  selector: 'app-modals',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modals.html',
  styleUrl: './modals.css',
})
export class Modals {

  public portalService = inject(PortalService);

  // Student Login States
  loginEmail = new FormControl("");
  loginOtpSent = false;
  loginOtpCode = "";
  loginOtpInput = new FormControl("");
  loginOtpError = "";

  // Student Register States
  registerName = new FormControl("Amit Kumar Patel");
  registerEmail = new FormControl("amit.patel@outlook.com");
  registerMobile = new FormControl("+91 94523 11842");
  registerCategory = new FormControl("OBC");
  registerIncome = new FormControl("240000");
  registerGPA = new FormControl("8.8");
  registerOtpSent = false;
  registerOtpCode = "";
  registerOtpInput = new FormControl("");
  registerOtpError = "";

  // College Admin States
  collegeNodalId = new FormControl("nodal.officer@iitd.ac.in");
  collegeOtpSent = false;
  collegeOtpCode = "";
  collegeOtpInput = new FormControl("");
  collegeOtpError = "";
  collegeShowRegisterForm = false;
  collegeContactName = new FormControl("");
  collegePhone = new FormControl("");

  // Govt Admin States
  govtDept = new FormControl("Ministry of Education (MoE)");
  govtEmail = new FormControl("director-schol@nic.in");
  govtPassphrase = new FormControl("official-token-nic");

  getHeaderConfig() {
    const current = this.portalService.activeModal();
    
    switch (current) {
      case 'student-login':
        return {
          bg: 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800',
          icon: 'pi pi-graduation-cap',
          title: 'Student Access Gateway',
          desc: 'Direct secure OTP authentication portal'
        };
      case 'register':
        return {
          bg: 'bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900',
          icon: 'pi pi-user',
          title: 'New Student Registration',
          desc: 'Instant secure email verification'
        };
      case 'college-login':
        return {
          bg: 'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950',
          icon: 'pi pi-building',
          title: 'Institutional Nodal Desk',
          desc: 'Nodal verification officer secure gateway'
        };
      case 'eligibility-checker':
        return {
          bg: 'bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-800',
          icon: 'pi pi-verified',
          title: 'Scholarship Eligibility Criteria',
          desc: 'Official qualification requirements checklist'
        };
      case 'govt-login':
      default:
        return {
          bg: 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800',
          icon: 'pi pi-briefcase',
          title: 'Central State Directorate',
          desc: 'Authorized department clearance console'
        };
    }
  }

  closeModal() {
    this.portalService.closeModal();
    this.resetOtpStates();
  }

  resetOtpStates() {
    this.loginOtpSent = false;
    this.loginOtpCode = "";
    this.loginOtpInput.setValue("");
    this.loginOtpError = "";

    this.registerOtpSent = false;
    this.registerOtpCode = "";
    this.registerOtpInput.setValue("");
    this.registerOtpError = "";

    this.collegeOtpSent = false;
    this.collegeOtpCode = "";
    this.collegeOtpInput.setValue("");
    this.collegeOtpError = "";
    this.collegeShowRegisterForm = false;
  }

  // Action methods
  sendStudentLoginOtp() {
    if (!this.loginEmail.value) {
      this.loginOtpError = "Please enter your email first.";
      return;
    }
    this.loginOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.loginOtpSent = true;
    this.loginOtpError = "";
  }

  onStudentLoginSubmit(event: Event) {
    event.preventDefault();
    if (!this.loginOtpSent) {
      this.loginOtpError = "Please click 'Send OTP' first.";
      return;
    }
    if (this.loginOtpInput.value !== this.loginOtpCode) {
      this.loginOtpError = "Invalid OTP entered. Please try again.";
      return;
    }

    this.portalService.currentUser = this.loginEmail.value;
    this.portalService.userRole = 'student';
    this.portalService.userMetadata = {
      name: this.loginEmail.value === "john.doe@academic.edu" ? "John Doe" : this.loginEmail.value?.split("@")[0],
      email: this.loginEmail.value,
      category: "OBC",
      income: 240000,
      gpa: 8.8,
      regNo: "REG-2026-9048",
      college: "Indian Institute of Technology, Delhi"
    };

    this.closeModal();
  }

  sendRegisterOtp() {
    if (!this.registerName.value || !this.registerEmail.value || !this.registerMobile.value) {
      this.registerOtpError = "Please fill out all fields: Name, Email, and Phone Number.";
      return;
    }
    this.registerOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.registerOtpSent = true;
    this.registerOtpError = "";
  }

  onRegisterSubmit(event: Event) {
    event.preventDefault();
    if (!this.registerOtpSent) {
      this.registerOtpError = "Please click 'Send OTP' first.";
      return;
    }
    if (this.registerOtpInput.value !== this.registerOtpCode) {
      this.registerOtpError = "Invalid OTP entered. Please try again.";
      return;
    }

    this.portalService.currentUser = this.registerEmail.value;
    this.portalService.userRole = 'student';
    this.portalService.userMetadata = {
      name: this.registerName.value || "New Scholar",
      email: this.registerEmail.value,
      category: this.registerCategory.value,
      income: Number(this.registerIncome.value),
      gpa: Number(this.registerGPA.value),
      regNo: "REG-2026-" + Math.floor(1000 + Math.random() * 9000),
      college: "State Technological University"
    };

    this.portalService.studentTimeline = [
      { label: "Student Register/Login", status: "completed", date: "Just now" },
      { label: "Scholarship Apply", status: "pending", date: "Awaiting Submission" },
      { label: "Institute Verification", status: "upcoming", date: "Awaiting Application" },
      { label: "Government Approved Scholarship", status: "upcoming", date: "Awaiting Verification" },
      { label: "Money Distribute By Govt.", status: "upcoming", date: "Awaiting Approval" }
    ];

    this.closeModal();
  }

  verifyCollegeEmail() {
    if (!this.collegeNodalId.value) {
      this.collegeOtpError = "Please enter your nodal email first.";
      return;
    }
    const exists = this.portalService.registeredColleges.some(
      (  c: { email: string; }) => c.email.toLowerCase() === this.collegeNodalId.value?.toLowerCase()
    );
    if (exists) {
      this.collegeOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
      this.collegeOtpSent = true;
      this.collegeOtpError = "";
    } else {
      this.collegeShowRegisterForm = true;
      this.collegeOtpError = "";
    }
  }

  sendCollegeRegisterOtp() {
    if (!this.collegeContactName.value || !this.collegePhone.value) {
      this.collegeOtpError = "Please provide Contact Person Name and Phone Number.";
      return;
    }
    this.collegeOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.collegeOtpSent = true;
    this.collegeOtpError = "";
  }

  onCollegeLoginSubmit(event: Event) {
    event.preventDefault();
    if (!this.collegeOtpSent) {
      this.collegeOtpError = "Please click 'Send OTP' first.";
      return;
    }
    if (this.collegeOtpInput.value !== this.collegeOtpCode) {
      this.collegeOtpError = "Invalid 6-digit OTP entered. Please try again.";
      return;
    }

    let matchedCollege = this.portalService.registeredColleges.find(
      ( c: { email: string; }) => c.email.toLowerCase() === this.collegeNodalId.value?.toLowerCase()
    );

    if (!matchedCollege) {
      matchedCollege = {
        email: this.collegeNodalId.value || "",
        contactPersonName: this.collegeContactName.value || "Nodal Officer",
        phone: this.collegePhone.value || "+91 99999 99999",
        code: "AISHE-C-" + Math.floor(10000 + Math.random() * 90000),
        collegeName: (this.collegeContactName.value ? `${this.collegeContactName.value} Institution` : "State Technical Institute")
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
      department: "Academic & Scholarship Division"
    };

    this.closeModal();
  }

  onGovtLoginSubmit(event: Event) {
    event.preventDefault();
    this.portalService.currentUser = this.govtEmail.value;
    this.portalService.userRole = 'govt-admin';
    this.portalService.userMetadata = {
      name: "National Scholarship Directorate",
      department: this.govtDept.value,
      email: this.govtEmail.value,
      clearance: "Level 1 Administrator"
    };
    this.closeModal();
  }
}
