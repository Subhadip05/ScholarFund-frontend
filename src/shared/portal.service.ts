import { Injectable, signal } from '@angular/core';
import {
  ModalType,
  UserRole,
  ScholarshipScheme,
  TimelineItem,
  CollegeApplication,
  RegisteredCollege,
} from './types';

@Injectable({
  providedIn: 'root',
})
export class PortalService {
  isScrolled = false;
  mobileMenuOpen = false;
  activeModal = signal<ModalType>(null);

  currentUser: string | null = null;
  userRole: UserRole = null;
  userMetadata: any = null;

  // Demo Registered Colleges
  registeredColleges: RegisteredCollege[] = [
    {
      email: 'nodal.officer@iitd.ac.in',
      contactPersonName: 'IIT Delhi Nodal Office',
      phone: '+91 98765 43210',
      code: 'AISHE-C-34190',
      collegeName: 'Indian Institute of Technology, Delhi',
    },
  ];

  // Scholarship Database
  scholarshipSchemes: ScholarshipScheme[] = [
    {
      id: '1',
      name: 'Central Sector Scheme of Scholarship for College Students',
      ministry: 'Ministry of Education (MoE)',
      amount: '₹20,000 / Yr',
      minGPA: 80,
      maxIncome: 450000,
      category: ['General', 'OBC', 'SC', 'ST'],
    },
    {
      id: '2',
      name: 'Post-Matric Scholarship Scheme for SC & ST Students',
      ministry: 'Ministry of Social Justice & Empowerment',
      amount: '₹55,000 / Yr',
      minGPA: 60,
      maxIncome: 600000,
      category: ['SC', 'ST'],
    },
    {
      id: '3',
      name: 'Merit-cum-Means Scholarship for Professional Courses',
      ministry: 'Ministry of Minority Affairs (MoMA)',
      amount: '₹30,000 / Yr',
      minGPA: 75,
      maxIncome: 250000,
      category: ['General', 'OBC', 'SC', 'ST'],
    },
    {
      id: '4',
      name: "Prime Minister's Scholarship Scheme (PMSS) for Higher Education",
      ministry: 'Ministry of Tribal Affairs',
      amount: '₹36,000 / Yr',
      minGPA: 85,
      maxIncome: 800000,
      category: ['ST', 'OBC'],
    },
    {
      id: '5',
      name: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
      ministry: 'Ministry of Education (MoE)',
      amount: '₹12,000 / Yr',
      minGPA: 70,
      maxIncome: 350000,
      category: ['General', 'OBC', 'SC', 'ST'],
    },
  ];

  // Student Dashboard Application workflow
  appliedScholarships: string[] = [];
  studentTimeline: TimelineItem[] = [
    { label: 'Student Register/Login', status: 'completed', date: 'July 10, 2026' },
    { label: 'Scholarship Apply', status: 'completed', date: 'July 11, 2026' },
    { label: 'Institute Verification', status: 'pending', date: 'In Progress' },
    { label: 'Government Approved Scholarship', status: 'upcoming', date: 'Awaiting Verification' },
    { label: 'Money Distribute By Govt.', status: 'upcoming', date: 'Awaiting Approval' },
  ];

  // College Admin workflow
  collegeApplications: CollegeApplication[] = [
    {
      id: 'SCH-902',
      name: 'Ananya Sharma',
      course: 'B.Tech CSE',
      scheme: 'Post-Matric National Scholarship',
      status: 'Pending',
      income: '₹2,40,000',
      gpa: '9.2',
    },
    {
      id: 'SCH-411',
      name: 'Rahul Kumar',
      course: 'B.Sc Physics',
      scheme: 'Merit-cum-Means Scheme',
      status: 'Pending',
      income: '₹1,80,000',
      gpa: '8.7',
    },
    {
      id: 'SCH-704',
      name: 'Priya Patel',
      course: 'MBBS',
      scheme: 'Central Sector Scheme',
      status: 'Approved',
      income: '₹4,20,000',
      gpa: '9.5',
    },
  ];

  // Government Admin workflow
  selectedDeptScheme = 'All Schemes';
  systemAlertMessage = '';
  disbursalApprovedStatus = false;

  // Eligibility Verification state
  calcIncome = 350000;
  calcCategory = 'OBC';
  calcGPA = 82;
  calcVerifiedSchemes: ScholarshipScheme[] = [];
  hasCalculated = false;

  constructor() {}


  openModal(type: ModalType) {
    console.log('Open modal type: ', type);
    this.activeModal.set(type);
    this.mobileMenuOpen = false;
  }

  closeModal() {
    console.log('close modal : ', this.activeModal());
    this.activeModal.set(null);
  }

  // Log out current session
  logout() {
    this.currentUser = null;
    this.userRole = null;
    this.userMetadata = null;
    this.appliedScholarships = [];
    this.hasCalculated = false;
  }

  // Apply for scholarship
  applyScholarship(schemeId: string) {
    if (!this.appliedScholarships.includes(schemeId)) {
      this.appliedScholarships.push(schemeId);
      this.studentTimeline = [
        { label: 'Student Register/Login', status: 'completed', date: 'July 10, 2026' },
        { label: 'Scholarship Apply', status: 'completed', date: 'Just now' },
        {
          label: 'Institute Verification',
          status: 'pending',
          date: 'In review: Scheme ' + schemeId,
        },
        {
          label: 'Government Approved Scholarship',
          status: 'upcoming',
          date: 'Awaiting Verification',
        },
        { label: 'Money Distribute By Govt.', status: 'upcoming', date: 'Awaiting Approval' },
      ];
    }
  }

  // College Actions
  approveApplication(id: string) {
    this.collegeApplications = this.collegeApplications.map((app) =>
      app.id === id ? { ...app, status: 'Approved' } : app,
    );
  }

  rejectApplication(id: string) {
    this.collegeApplications = this.collegeApplications.map((app) =>
      app.id === id ? { ...app, status: 'Rejected' } : app,
    );
  }

  // Eligibility Calculator
  calculateEligibility() {
    this.calcVerifiedSchemes = this.scholarshipSchemes.filter((scheme) => {
      const gpaPass = this.calcGPA >= scheme.minGPA;
      const incomePass = this.calcIncome <= scheme.maxIncome;
      const categoryPass = scheme.category.includes(this.calcCategory);
      return gpaPass && incomePass && categoryPass;
    });
    this.hasCalculated = true;
  }

  // Helper scroll
  scrollToSection(id: string) {
    this.mobileMenuOpen = false;
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }
}
