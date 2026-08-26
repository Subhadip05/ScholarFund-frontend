import { computed, inject, Injectable, signal } from '@angular/core';
import {
  ModalType,
  UserRole,
  ScholarshipScheme,
  TimelineItem,
  ApplicationStatus,
  InstituteDto,
  ScholarshipApplicationDto,
  ApproveApplicationRequest,
  RejectApplicationRequest,
  VerifyInstituteRequest,
  RevokeInstituteRequest,
} from './types';
import { Authservice } from './auth/authservice';
import Notiflix from 'notiflix';
import { HttpClient } from '@angular/common/http';
import { FIXED_SCHOLARSHIP_AMOUNT, formatCurrency, generateUTR } from './utils/formatters';
import { Observable, of } from 'rxjs';

const STORAGE_KEY_APPS = 'scholarfund_govt_applications';
const STORAGE_KEY_INSTS = 'scholarfund_govt_institutes';

@Injectable({
  providedIn: 'root',
})
export class PortalService {
  private authservice = inject(Authservice);
  private readonly http = inject(HttpClient);

  isScrolled = false;
  mobileMenuOpen = false;
  activeModal = signal<ModalType>(null);

  userRole: UserRole = null;
  userMetadata: any = null;

  // Scholarship Database
  scholarshipSchemes: ScholarshipScheme[] = [
    {
      id: '1',
      name: 'Central Sector Scheme of Scholarship for College Students',
      ministry: 'Ministry of Education (MoE)',
      amount: '₹20,000 / Yr',
      minGPA: 70,
      maxIncome: 200000,
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

  studentTimeline: TimelineItem[] = [
    { label: 'Student Register/Login', status: 'completed', date: 'July 10, 2026' },
    { label: 'Scholarship Apply', status: 'pending', date: 'In Progress' },
    { label: 'Institute Verification', status: 'upcoming', date: 'Awaiting Application' },
    { label: 'Government Approved Scholarship', status: 'upcoming', date: 'Awaiting Verification' },
    { label: 'Money Distribute By Govt.', status: 'upcoming', date: 'Awaiting Approval' },
  ];

  // Mock Data For Govt Admin Dashboard
  initialInstitutes: InstituteDto[] = [
    {
      profileId: 101,
      email: 'nodal.officer@iitkgp.ac.in',
      officerName: 'Prof. Subhasish Chattopadhyay',
      officerPhoneNo: '+91 98310 44521',
      isVerifyByGovt: true,
      instituteName: 'Indian Institute of Technology Kharagpur',
      collegeCode: 'IIT-KGP-WB-001',
      universityAffiliation: 'Autonomous Institute of National Importance (Ministry of Education)',
      principalName: 'Prof. V. K. Tewari',
      address: 'Kharagpur, Paschim Medinipur, West Bengal 721302',
      affiliationCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/affiliations/IIT-KGP-WB-001_cert.pdf',
      registeredDate: '2025-06-10T10:00:00Z',
      aisheCode: 'U-0570',
      instituteType: 'CENTRAL_UNIVERSITY',
      verificationRemarks:
        'All AISHE & NIRF credentials verified. Statutory accreditation valid till 2030.',
      verifiedAt: '2025-06-15T14:30:00Z',
      verifiedBy: 'Dr. Rameshwar V. Joshi, IAS',
      district: 'Paschim Medinipur',
      state: 'West Bengal',
      contactNumber: '03222 255221',
      totalApplicationsCount: 42,
      approvedApplicationsCount: 38,
    },
    {
      profileId: 102,
      email: 'scholarships@jadavpuruniversity.in',
      officerName: 'Dr. Ananya Mukherjee',
      officerPhoneNo: '+91 94331 88720',
      isVerifyByGovt: true,
      instituteName: 'Jadavpur University',
      collegeCode: 'JU-KOL-WB-004',
      universityAffiliation: 'State University (UGC Approved & NAAC A++ Grade)',
      principalName: 'Prof. Buddhadeb Sau',
      address: '188, Raja S.C. Mallick Road, Jadavpur, Kolkata, West Bengal 700032',
      affiliationCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/affiliations/JU-KOL-WB-004_cert.pdf',
      registeredDate: '2025-06-12T11:20:00Z',
      aisheCode: 'U-0568',
      instituteType: 'GOVERNMENT',
      verificationRemarks: 'University Gazette and UGC 12(B) approval verified by Directorate.',
      verifiedAt: '2025-06-16T16:00:00Z',
      verifiedBy: 'Dr. Rameshwar V. Joshi, IAS',
      district: 'Kolkata',
      state: 'West Bengal',
      contactNumber: '033 2414 6666',
      totalApplicationsCount: 65,
      approvedApplicationsCount: 52,
    },
    {
      profileId: 103,
      email: 'dean.academics@heritageit.edu',
      officerName: 'Prof. Pradeep Kumar Roy',
      officerPhoneNo: '+91 98305 77112',
      isVerifyByGovt: false, // PENDING GOVT VERIFICATION!
      instituteName: 'Heritage Institute of Technology',
      collegeCode: 'HIT-KOL-WB-073',
      universityAffiliation: 'Maulana Abul Kalam Azad University of Technology (MAKAUT)',
      principalName: 'Dr. Basab Chaudhuri',
      address: '994, Chowbaga Road, Anandapur, East Kolkata Township, Kolkata, West Bengal 700107',
      affiliationCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/affiliations/HIT-KOL-WB-073_cert.pdf',
      registeredDate: '2026-08-14T09:15:00Z',
      aisheCode: 'C-6240',
      instituteType: 'PRIVATE',
      verificationRemarks: '',
      district: 'Kolkata',
      state: 'West Bengal',
      contactNumber: '033 6627 0600',
      totalApplicationsCount: 28,
      approvedApplicationsCount: 0,
    },
    {
      profileId: 104,
      email: 'nodal.officer@presiuniv.ac.in',
      officerName: 'Dr. Tanmoy Sengupta',
      officerPhoneNo: '+91 98319 90022',
      isVerifyByGovt: true,
      instituteName: 'Presidency University',
      collegeCode: 'PU-KOL-WB-002',
      universityAffiliation: 'State University of West Bengal (UGC Recognized)',
      principalName: 'Prof. Anuradha Lohia',
      address: '86/1, College Street, Bowbazar, Kolkata, West Bengal 700073',
      affiliationCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/affiliations/PU-KOL-WB-002_cert.pdf',
      registeredDate: '2025-06-18T14:40:00Z',
      aisheCode: 'U-0580',
      instituteType: 'GOVERNMENT',
      verificationRemarks: 'Heritage institution documentation authenticated.',
      verifiedAt: '2025-06-20T11:00:00Z',
      verifiedBy: 'Dr. Rameshwar V. Joshi, IAS',
      district: 'Kolkata',
      state: 'West Bengal',
      contactNumber: '033 2241 1960',
      totalApplicationsCount: 34,
      approvedApplicationsCount: 29,
    },
    {
      profileId: 105,
      email: 'scholarship.cell@nitt.edu',
      officerName: 'Dr. M. Sivasankaran',
      officerPhoneNo: '+91 94432 10982',
      isVerifyByGovt: false, // PENDING GOVT VERIFICATION!
      instituteName: 'National Institute of Technology Tiruchirappalli',
      collegeCode: 'NIT-TRY-TN-012',
      universityAffiliation: 'Autonomous Institute of National Importance (Ministry of Education)',
      principalName: 'Dr. G. Aghila',
      address: 'Tanjore Main Road, National Highway 67, Tiruchirappalli, Tamil Nadu 620015',
      affiliationCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/affiliations/NIT-TRY-TN-012_cert.pdf',
      registeredDate: '2026-08-16T12:00:00Z',
      aisheCode: 'U-0467',
      instituteType: 'CENTRAL_UNIVERSITY',
      verificationRemarks: '',
      district: 'Tiruchirappalli',
      state: 'Tamil Nadu',
      contactNumber: '0431 250 3000',
      totalApplicationsCount: 19,
      approvedApplicationsCount: 0,
    },
    {
      profileId: 106,
      email: 'admin.officer@stxavierskolkata.edu',
      officerName: 'Fr. Dominic Savio SJ',
      officerPhoneNo: '+91 98302 44321',
      isVerifyByGovt: true,
      instituteName: "St. Xavier's College (Autonomous), Kolkata",
      collegeCode: 'SXC-KOL-WB-005',
      universityAffiliation: 'University of Calcutta (Autonomous)',
      principalName: 'Rev. Dr. Dominic Savio',
      address: '30, Mother Teresa Sarani, Park Street, Kolkata, West Bengal 700016',
      affiliationCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/affiliations/SXC-KOL-WB-005_cert.pdf',
      registeredDate: '2025-07-01T10:00:00Z',
      aisheCode: 'C-11880',
      instituteType: 'GOVT_AIDED',
      verificationRemarks:
        'NAAC A++ accreditation certificate checked against official repository.',
      verifiedAt: '2025-07-05T15:30:00Z',
      verifiedBy: 'Dr. Rameshwar V. Joshi, IAS',
      district: 'Kolkata',
      state: 'West Bengal',
      contactNumber: '033 2255 1101',
      totalApplicationsCount: 51,
      approvedApplicationsCount: 46,
    },
    {
      profileId: 107,
      email: 'scholarship@technoindia.edu',
      officerName: 'Dr. Snehasis Banerjee',
      officerPhoneNo: '+91 98311 00293',
      isVerifyByGovt: false, // PENDING GOVT VERIFICATION!
      instituteName: 'Techno Main Salt Lake',
      collegeCode: 'TMSL-KOL-WB-118',
      universityAffiliation: 'Maulana Abul Kalam Azad University of Technology (MAKAUT)',
      principalName: 'Dr. Meghnad Saha Institute',
      address: 'EM-4/1, Sector V, Salt Lake, Kolkata, West Bengal 700091',
      affiliationCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/affiliations/TMSL-KOL-WB-118_cert.pdf',
      registeredDate: '2026-08-18T08:30:00Z',
      aisheCode: 'C-6235',
      instituteType: 'PRIVATE',
      verificationRemarks: '',
      district: 'North 24 Parganas',
      state: 'West Bengal',
      contactNumber: '033 2357 5683',
      totalApplicationsCount: 15,
      approvedApplicationsCount: 0,
    },
  ];

  initialApplications: ScholarshipApplicationDto[] = [
    {
      applicationId: 2026001,
      studentName: 'Aarav Debnath',
      instituteName: 'Jadavpur University',
      courseName: 'B.Tech in Computer Science and Engineering',
      academicYear: '2025-2026',
      lastQualificationMarks: 94.6,
      lastQualificationCourse: 'Higher Secondary (10+2) Pure Science',
      lastQualificationExamRollNo: 'WBCHSE-2025-992140',
      passOutBoardName: 'West Bengal Council of Higher Secondary Education (WBCHSE)',
      annualIncome: 96000.0,
      bankAccountNumber: '38901244589',
      ifscCode: 'SBIN0000093',
      bankName: 'State Bank of India',
      branchName: 'Jadavpur University Branch, Kolkata',
      status: ApplicationStatus.INSTITUTE_VERIFIED, // Pending Govt Admin approval!
      sanctionAmount: 60000,
      category: 'General',
      gender: 'Male',
      studentEmail: 'aarav.debnath25@gmail.com',
      studentPhone: '+91 98321 44019',
      district: 'Hooghly',
      state: 'West Bengal',
      applicationDate: '2026-08-05T09:30:00Z',
      instituteCollegeCode: 'JU-KOL-WB-004',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026001_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026001_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026001_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026001_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Aarav Debnath',
          actorRole: 'STUDENT',
          remarks:
            'Submitted initial scholarship application along with scanned BDO income certificate and 10+2 marksheet.',
          actionTime: '2026-08-05T09:30:00Z',
        },
        {
          actionTaken: 'Document & Physical Verification Passed',
          actionBy: 'Dr. Ananya Mukherjee (Nodal Officer)',
          actorRole: 'INSTITUTE_NODAL_OFFICER',
          remarks:
            'Verified original 10+2 marksheet, admission payment receipt of ₹12,500, and bank passbook. Forwarded to Govt Directorate for scholarship sanction.',
          actionTime: '2026-08-11T14:15:00Z',
        },
      ],
    },
    {
      applicationId: 2026002,
      studentName: 'Priya Sharma',
      instituteName: 'Indian Institute of Technology Kharagpur',
      courseName: 'Dual Degree B.Tech + M.Tech in Electrical Engineering',
      academicYear: '2025-2026',
      lastQualificationMarks: 96.2,
      lastQualificationCourse: 'Class XII (Science Stream with PCM)',
      lastQualificationExamRollNo: 'CBSE-2025-1188402',
      passOutBoardName: 'Central Board of Secondary Education (CBSE)',
      annualIncome: 140000.0,
      bankAccountNumber: '918020045581290',
      ifscCode: 'PUNB0014200',
      bankName: 'Punjab National Bank',
      branchName: 'Kharagpur Technology Branch',
      status: ApplicationStatus.ADMIN_APPROVED, // Ready for DBT Disbursement!
      sanctionAmount: 60000,
      category: 'OBC',
      gender: 'Female',
      studentEmail: 'priya.sharma.iitkgp@gmail.com',
      studentPhone: '+91 97712 88410',
      district: 'Paschim Medinipur',
      state: 'West Bengal',
      applicationDate: '2026-08-02T11:00:00Z',
      instituteCollegeCode: 'IIT-KGP-WB-001',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026002_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026002_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026002_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026002_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Priya Sharma',
          actorRole: 'STUDENT',
          remarks: 'Applied under Merit-cum-Means Higher Education Scheme.',
          actionTime: '2026-08-02T11:00:00Z',
        },
        {
          actionTaken: 'Institute Verified',
          actionBy: 'Prof. Subhasish Chattopadhyay',
          actorRole: 'INSTITUTE_NODAL_OFFICER',
          remarks:
            'Academic standing and fee structure authenticated. Recommended for full merit tier.',
          actionTime: '2026-08-07T16:00:00Z',
        },
        {
          actionTaken: 'Govt Sanction Approved',
          actionBy: 'Dr. Rameshwar V. Joshi, IAS',
          actorRole: 'GOVT_SCHOLARSHIP_OFFICER',
          remarks:
            'Sanction approved for ₹60,000 under National Technical Merit Scheme. DBT batch queued.',
          actionTime: '2026-08-16T10:45:00Z',
        },
      ],
    },
    {
      applicationId: 2026003,
      studentName: 'Subhasree Mondal',
      instituteName: 'Presidency University',
      courseName: 'M.Sc in Physics',
      academicYear: '2025-2026',
      lastQualificationMarks: 89.4,
      lastQualificationCourse: 'B.Sc (Hons) in Physics',
      lastQualificationExamRollNo: 'PU-UG-2022-0489',
      passOutBoardName: 'Presidency University Autonomous',
      annualIncome: 75000.0,
      bankAccountNumber: '20491823901',
      ifscCode: 'SBIN0000001',
      bankName: 'State Bank of India',
      branchName: 'Kolkata Main Branch',
      status: ApplicationStatus.DISBURSED, // Money credited to student bank!
      sanctionAmount: 60000,
      disbursementDate: '2026-08-18T14:20:00Z',
      utrNumber: 'DBT2026IN8849102XQ',
      category: 'SC',
      gender: 'Female',
      studentEmail: 'mondal.subhasree99@gmail.com',
      studentPhone: '+91 98741 23091',
      district: 'South 24 Parganas',
      state: 'West Bengal',
      applicationDate: '2026-07-28T10:15:00Z',
      instituteCollegeCode: 'PU-KOL-WB-002',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026003_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026003_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026003_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026003_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Subhasree Mondal',
          actorRole: 'STUDENT',
          remarks: 'Submitted with SDO Income Certificate and B.Sc Marksheet.',
          actionTime: '2026-07-28T10:15:00Z',
        },
        {
          actionTaken: 'Institute Verification Completed',
          actionBy: 'Dr. Tanmoy Sengupta',
          actorRole: 'INSTITUTE_NODAL_OFFICER',
          remarks: 'Enrolment and tuition receipt verified.',
          actionTime: '2026-08-01T12:00:00Z',
        },
        {
          actionTaken: 'Govt Admin Approved',
          actionBy: 'Dr. Rameshwar V. Joshi, IAS',
          actorRole: 'GOVT_SCHOLARSHIP_OFFICER',
          remarks:
            'Merit-cum-means eligibility criteria met. Sanctioned fixed one-time grant of ₹60,000.',
          actionTime: '2026-08-10T11:30:00Z',
        },
        {
          actionTaken: 'DBT Disbursal Executed via PFMS',
          actionBy: 'PFMS Treasury Disbursal Engine',
          actorRole: 'PFMS_TREASURY_GATEWAY',
          remarks:
            'Direct Benefit Transfer of ₹60,000 credited to SBI A/C 20491823901. UTR: DBT2026IN8849102XQ.',
          actionTime: '2026-08-18T14:20:00Z',
        },
      ],
    },
    {
      applicationId: 2026004,
      studentName: 'Tariq Anwar',
      instituteName: "St. Xavier's College (Autonomous), Kolkata",
      courseName: 'B.Com (Hons) in Accounting and Finance',
      academicYear: '2025-2026',
      lastQualificationMarks: 91.8,
      lastQualificationCourse: 'Class XII Commerce',
      lastQualificationExamRollNo: 'ISC-2025-884019',
      passOutBoardName: 'Council for the Indian School Certificate Examinations (CISCE)',
      annualIncome: 110000.0,
      bankAccountNumber: '50100488921034',
      ifscCode: 'HDFC0000014',
      bankName: 'HDFC Bank',
      branchName: 'Park Street Branch, Kolkata',
      status: ApplicationStatus.INSTITUTE_VERIFIED, // Pending Govt Admin approval!
      sanctionAmount: 60000,
      category: 'Minority',
      gender: 'Male',
      studentEmail: 'tariq.anwar.sxc@gmail.com',
      studentPhone: '+91 99031 55678',
      district: 'Kolkata',
      state: 'West Bengal',
      applicationDate: '2026-08-08T15:20:00Z',
      instituteCollegeCode: 'SXC-KOL-WB-005',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026004_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026004_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026004_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026004_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Tariq Anwar',
          actorRole: 'STUDENT',
          remarks: 'Applied under Post-Matric Minority Higher Education Grant.',
          actionTime: '2026-08-08T15:20:00Z',
        },
        {
          actionTaken: 'Institute Verified',
          actionBy: 'Fr. Dominic Savio SJ',
          actorRole: 'INSTITUTE_NODAL_OFFICER',
          remarks: 'Verified fee structure and attendance record. Recommended for sanction.',
          actionTime: '2026-08-14T11:45:00Z',
        },
      ],
    },
    {
      applicationId: 2026005,
      studentName: 'Aniket Mukherjee',
      instituteName: 'Jadavpur University',
      courseName: 'B.Tech in Mechanical Engineering',
      academicYear: '2025-2026',
      lastQualificationMarks: 84.2,
      lastQualificationCourse: 'Higher Secondary (10+2) Science',
      lastQualificationExamRollNo: 'WBCHSE-2025-771920',
      passOutBoardName: 'West Bengal Council of Higher Secondary Education (WBCHSE)',
      annualIncome: 180000.0,
      bankAccountNumber: '0482101089201',
      ifscCode: 'CNRB0000482',
      bankName: 'Canara Bank',
      branchName: 'Gariahat Branch, Kolkata',
      status: ApplicationStatus.ADMIN_APPROVED, // Ready for DBT Disbursement!
      sanctionAmount: 60000,
      category: 'General',
      gender: 'Male',
      studentEmail: 'aniket.mukh.ju@gmail.com',
      studentPhone: '+91 94320 18872',
      district: 'North 24 Parganas',
      state: 'West Bengal',
      applicationDate: '2026-08-01T14:00:00Z',
      instituteCollegeCode: 'JU-KOL-WB-004',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026005_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026005_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026005_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026005_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Aniket Mukherjee',
          actorRole: 'STUDENT',
          remarks: 'Applied with income affidavit & JEE rank card.',
          actionTime: '2026-08-01T14:00:00Z',
        },
        {
          actionTaken: 'Institute Verified',
          actionBy: 'Dr. Ananya Mukherjee',
          actorRole: 'INSTITUTE_NODAL_OFFICER',
          remarks: 'Tuition deposit receipt verified.',
          actionTime: '2026-08-06T10:00:00Z',
        },
        {
          actionTaken: 'Govt Sanction Approved',
          actionBy: 'Dr. Rameshwar V. Joshi, IAS',
          actorRole: 'GOVT_SCHOLARSHIP_OFFICER',
          remarks: 'Sanction authorized. Allocated to DBT Batch #2026-B8.',
          actionTime: '2026-08-15T15:10:00Z',
        },
      ],
    },
    {
      applicationId: 2026006,
      studentName: 'Sneha Roy Chowdhury',
      instituteName: 'Presidency University',
      courseName: 'B.A (Hons) in English Literature',
      academicYear: '2025-2026',
      lastQualificationMarks: 95.0,
      lastQualificationCourse: 'Higher Secondary (10+2) Humanities',
      lastQualificationExamRollNo: 'CBSE-2025-994812',
      passOutBoardName: 'Central Board of Secondary Education (CBSE)',
      annualIncome: 84000.0,
      bankAccountNumber: '62490182374',
      ifscCode: 'SBIN0001509',
      bankName: 'State Bank of India',
      branchName: 'College Street Branch, Kolkata',
      status: ApplicationStatus.INSTITUTE_VERIFIED, // Pending Govt Admin approval!
      sanctionAmount: 60000,
      category: 'General',
      gender: 'Female',
      studentEmail: 'sneha.roy.lit@gmail.com',
      studentPhone: '+91 98300 12984',
      district: 'Kolkata',
      state: 'West Bengal',
      applicationDate: '2026-08-10T16:45:00Z',
      instituteCollegeCode: 'PU-KOL-WB-002',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026006_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026006_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026006_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026006_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Sneha Roy Chowdhury',
          actorRole: 'STUDENT',
          remarks: 'Applied under Chief Minister Merit Scheme.',
          actionTime: '2026-08-10T16:45:00Z',
        },
        {
          actionTaken: 'Institute Verified',
          actionBy: 'Dr. Tanmoy Sengupta',
          actorRole: 'INSTITUTE_NODAL_OFFICER',
          remarks: 'Merit marks 95% confirmed. Student in top 1 percentile.',
          actionTime: '2026-08-15T11:00:00Z',
        },
      ],
    },
    {
      applicationId: 2026007,
      studentName: 'Rajesh Kumar Soren',
      instituteName: 'Indian Institute of Technology Kharagpur',
      courseName: 'B.Tech in Chemical Engineering',
      academicYear: '2025-2026',
      lastQualificationMarks: 88.0,
      lastQualificationCourse: 'Class XII (Science Stream)',
      lastQualificationExamRollNo: 'JAC-2025-449102',
      passOutBoardName: 'Jharkhand Academic Council (JAC Ranchi)',
      annualIncome: 60000.0,
      bankAccountNumber: '30491827491',
      ifscCode: 'SBIN0000202',
      bankName: 'State Bank of India',
      branchName: 'Ranchi Main Branch',
      status: ApplicationStatus.DISBURSED,
      sanctionAmount: 60000,
      disbursementDate: '2026-08-17T11:10:00Z',
      utrNumber: 'DBT2026IN7719234AB',
      category: 'ST',
      gender: 'Male',
      studentEmail: 'rajesh.soren.iitkgp@gmail.com',
      studentPhone: '+91 94311 78201',
      district: 'Ranchi',
      state: 'Jharkhand',
      applicationDate: '2026-07-25T11:00:00Z',
      instituteCollegeCode: 'IIT-KGP-WB-001',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026007_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026007_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026007_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026007_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Rajesh Kumar Soren',
          actorRole: 'STUDENT',
          remarks: 'Applied under National Tribal Fellowship Scheme.',
          actionTime: '2026-07-25T11:00:00Z',
        },
        {
          actionTaken: 'Institute Verified',
          actionBy: 'Prof. Subhasish Chattopadhyay',
          actorRole: 'INSTITUTE_NODAL_OFFICER',
          remarks: 'All certificates validated.',
          actionTime: '2026-07-30T15:00:00Z',
        },
        {
          actionTaken: 'Govt Approved',
          actionBy: 'Dr. Rameshwar V. Joshi, IAS',
          actorRole: 'GOVT_SCHOLARSHIP_OFFICER',
          remarks: 'Approved at highest tier.',
          actionTime: '2026-08-08T10:00:00Z',
        },
        {
          actionTaken: 'DBT Disbursal Executed via PFMS',
          actionBy: 'PFMS Treasury Disbursal Engine',
          actorRole: 'PFMS_TREASURY_GATEWAY',
          remarks: 'Direct Benefit Transfer credited. UTR: DBT2026IN7719234AB.',
          actionTime: '2026-08-17T11:10:00Z',
        },
      ],
    },
    {
      applicationId: 2026008,
      studentName: 'Vikram Singh Shekhawat',
      instituteName: 'Jadavpur University',
      courseName: 'B.Tech in Civil Engineering',
      academicYear: '2025-2026',
      lastQualificationMarks: 54.0,
      lastQualificationCourse: '10+2 Senior Secondary',
      lastQualificationExamRollNo: 'RBSE-2025-339102',
      passOutBoardName: 'Board of Secondary Education Rajasthan',
      annualIncome: 380000.0,
      bankAccountNumber: '9120100482910',
      ifscCode: 'UTIB0000045',
      bankName: 'Axis Bank',
      branchName: 'Jaipur Main',
      status: ApplicationStatus.ADMIN_REJECTED,
      sanctionAmount: 0,
      category: 'General',
      gender: 'Male',
      studentEmail: 'vikram.shekhawat@gmail.com',
      studentPhone: '+91 94140 33819',
      district: 'Jaipur',
      state: 'Rajasthan',
      applicationDate: '2026-08-04T12:00:00Z',
      instituteCollegeCode: 'JU-KOL-WB-004',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026008_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026008_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026008_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026008_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Vikram Singh Shekhawat',
          actorRole: 'STUDENT',
          remarks: 'Applied for merit scholarship.',
          actionTime: '2026-08-04T12:00:00Z',
        },
        {
          actionTaken: 'Institute Verified',
          actionBy: 'Dr. Ananya Mukherjee',
          actorRole: 'INSTITUTE_NODAL_OFFICER',
          remarks: 'Forwarded for govt scrutiny.',
          actionTime: '2026-08-09T14:30:00Z',
        },
        {
          actionTaken: 'Govt Rejected',
          actionBy: 'Dr. Rameshwar V. Joshi, IAS',
          actorRole: 'GOVT_SCHOLARSHIP_OFFICER',
          remarks:
            'Rejected: Annual family income ₹3,80,000 exceeds scheme ceiling of ₹2,50,000 and 10+2 marks (54%) below 60% eligibility threshold.',
          actionTime: '2026-08-14T17:00:00Z',
        },
      ],
    },
    {
      applicationId: 2026009,
      studentName: 'Ritu Sen',
      instituteName: 'Presidency University',
      courseName: 'B.Sc (Hons) in Economics',
      academicYear: '2025-2026',
      lastQualificationMarks: 92.5,
      lastQualificationCourse: 'Class XII Humanities & Economics',
      lastQualificationExamRollNo: 'CBSE-2025-667182',
      passOutBoardName: 'Central Board of Secondary Education (CBSE)',
      annualIncome: 135000.0,
      bankAccountNumber: '108849201948',
      ifscCode: 'SBIN0000001',
      bankName: 'State Bank of India',
      branchName: 'Kolkata Main Branch',
      status: ApplicationStatus.ADMIN_APPROVED, // Ready for DBT Disbursement!
      sanctionAmount: 60000,
      category: 'EWS',
      gender: 'Female',
      studentEmail: 'ritu.sen.econ@gmail.com',
      studentPhone: '+91 98314 99182',
      district: 'Howrah',
      state: 'West Bengal',
      applicationDate: '2026-08-06T10:00:00Z',
      instituteCollegeCode: 'PU-KOL-WB-002',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026009_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026009_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026009_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026009_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Ritu Sen',
          actorRole: 'STUDENT',
          remarks: 'Applied under Economically Weaker Section scheme.',
          actionTime: '2026-08-06T10:00:00Z',
        },
        {
          actionTaken: 'Institute Verified',
          actionBy: 'Dr. Tanmoy Sengupta',
          actorRole: 'INSTITUTE_NODAL_OFFICER',
          remarks: 'Verified EWS certificate and admission counterfoil.',
          actionTime: '2026-08-12T14:00:00Z',
        },
        {
          actionTaken: 'Govt Sanction Approved',
          actionBy: 'Dr. Rameshwar V. Joshi, IAS',
          actorRole: 'GOVT_SCHOLARSHIP_OFFICER',
          remarks: 'Sanctioned ₹30,000. Verified against National EWS database.',
          actionTime: '2026-08-16T11:20:00Z',
        },
      ],
    },
    {
      applicationId: 2026010,
      studentName: 'Debabrata Das',
      instituteName: 'Heritage Institute of Technology',
      courseName: 'B.Tech in Information Technology',
      academicYear: '2025-2026',
      lastQualificationMarks: 81.6,
      lastQualificationCourse: 'Higher Secondary (10+2)',
      lastQualificationExamRollNo: 'WBCHSE-2025-441299',
      passOutBoardName: 'West Bengal Council of Higher Secondary Education (WBCHSE)',
      annualIncome: 160000.0,
      bankAccountNumber: '49201948102',
      ifscCode: 'SBIN0016088',
      bankName: 'State Bank of India',
      branchName: 'Anandapur Branch',
      status: ApplicationStatus.SUBMITTED, // Waiting for institute
      sanctionAmount: 60000,
      category: 'OBC',
      gender: 'Male',
      studentEmail: 'debabrata.das.hit@gmail.com',
      studentPhone: '+91 98361 77209',
      district: 'South 24 Parganas',
      state: 'West Bengal',
      applicationDate: '2026-08-17T09:00:00Z',
      instituteCollegeCode: 'HIT-KOL-WB-073',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026010_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026010_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026010_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026010_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Debabrata Das',
          actorRole: 'STUDENT',
          remarks: 'Application submitted. Note: Institute Govt verification is still pending.',
          actionTime: '2026-08-17T09:00:00Z',
        },
      ],
    },
    {
      applicationId: 2026011,
      studentName: 'Farhana Khatun',
      instituteName: "St. Xavier's College (Autonomous), Kolkata",
      courseName: 'B.Sc (Hons) in Biotechnology',
      academicYear: '2025-2026',
      lastQualificationMarks: 93.8,
      lastQualificationCourse: 'Class XII Science (PCB)',
      lastQualificationExamRollNo: 'WBCHSE-2025-102948',
      passOutBoardName: 'West Bengal Council of Higher Secondary Education (WBCHSE)',
      annualIncome: 88000.0,
      bankAccountNumber: '20938491029',
      ifscCode: 'BARB0PARKST',
      bankName: 'Bank of Baroda',
      branchName: 'Park Street Branch',
      status: ApplicationStatus.INSTITUTE_VERIFIED, // Pending Govt Admin approval!
      sanctionAmount: 60000,
      category: 'Minority',
      gender: 'Female',
      studentEmail: 'farhana.khatun.bio@gmail.com',
      studentPhone: '+91 98319 88123',
      district: 'Murshidabad',
      state: 'West Bengal',
      applicationDate: '2026-08-11T13:30:00Z',
      instituteCollegeCode: 'SXC-KOL-WB-005',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026011_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026011_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026011_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026011_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Farhana Khatun',
          actorRole: 'STUDENT',
          remarks: 'Applied under Women in STEM Minority Scholarship.',
          actionTime: '2026-08-11T13:30:00Z',
        },
        {
          actionTaken: 'Institute Verified',
          actionBy: 'Fr. Dominic Savio SJ',
          actorRole: 'INSTITUTE_NODAL_OFFICER',
          remarks: 'Laboratory admission fees and residential domicile authenticated.',
          actionTime: '2026-08-16T15:00:00Z',
        },
      ],
    },
    {
      applicationId: 2026012,
      studentName: 'Amitava Banerjee',
      instituteName: 'Jadavpur University',
      courseName: 'B.Tech in Electronics & Telecommunication',
      academicYear: '2025-2026',
      lastQualificationMarks: 73.0,
      lastQualificationCourse: 'Higher Secondary (10+2)',
      lastQualificationExamRollNo: 'WBCHSE-2025-392019',
      passOutBoardName: 'West Bengal Council of Higher Secondary Education (WBCHSE)',
      annualIncome: 240000.0,
      bankAccountNumber: '0098101092839',
      ifscCode: 'PUNB0000100',
      bankName: 'Punjab National Bank',
      branchName: 'Garia Branch',
      status: ApplicationStatus.INSTITUTE_REJECTED,
      sanctionAmount: 0,
      category: 'General',
      gender: 'Male',
      studentEmail: 'amitava.ban@gmail.com',
      studentPhone: '+91 98305 66781',
      district: 'Kolkata',
      state: 'West Bengal',
      applicationDate: '2026-08-03T11:00:00Z',
      instituteCollegeCode: 'JU-KOL-WB-004',
      incomeCertificateUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026012_income_cert.pdf',
      hsMarksheetUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026012_hs_marksheet.pdf',
      bankPassbookUrl: 'https://scholarfund-s3.gov.in/presigned/docs/app_2026012_bank_passbook.pdf',
      admissionReceiptUrl:
        'https://scholarfund-s3.gov.in/presigned/docs/app_2026012_admission_receipt.pdf',
      timeline: [
        {
          actionTaken: 'Application Submitted',
          actionBy: 'Amitava Banerjee',
          actorRole: 'STUDENT',
          remarks: 'Initial application submitted.',
          actionTime: '2026-08-03T11:00:00Z',
        },
        {
          actionTaken: 'Institute Rejected',
          actionBy: 'Dr. Ananya Mukherjee',
          actorRole: 'INSTITUTE_NODAL_OFFICER',
          remarks:
            'Admission roll number does not match current session enrollment register. Fees voucher flagged as invalid duplicate.',
          actionTime: '2026-08-07T12:00:00Z',
        },
      ],
    },
  ];


  // =========================================================================
  // LocalStorage Helpers
  // =========================================================================

  private loadApplicationsFromStorage(): ScholarshipApplicationDto[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPS);
      return saved ? JSON.parse(saved) : this.initialApplications;
    } catch {
      return this.initialApplications;
    }
  }

  private loadInstitutesFromStorage(): InstituteDto[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INSTS);
      return saved ? JSON.parse(saved) : this.initialInstitutes;
    } catch {
      return this.initialInstitutes;
    }
  }

  private saveApplications(apps: ScholarshipApplicationDto[]) {
    this.applications.set(apps);
    try {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  private saveInstitutes(insts: InstituteDto[]) {
    this.institutes.set(insts);
    try {
      localStorage.setItem(STORAGE_KEY_INSTS, JSON.stringify(insts));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  // Government Admin workflow
  selectedDeptScheme = 'All Schemes';
  systemAlertMessage = '';
  disbursalApprovedStatus = false;

   // Reactive State Signals
  readonly applications = signal<ScholarshipApplicationDto[]>(this.loadApplicationsFromStorage());
  readonly institutes = signal<InstituteDto[]>(this.loadInstitutesFromStorage());
  readonly isLoading = signal<boolean>(false);


  constructor() {
    this.userRole = sessionStorage.getItem('user_role') as UserRole;
    const savedMetadata = sessionStorage.getItem('user_metadata');

    if (savedMetadata) {
      try {
        this.userMetadata = JSON.parse(savedMetadata);
      } catch (e) {
        console.error('Error parsing user metadata from sessionStorage', e);
      }
    }
  }

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
    Notiflix.Loading.pulse('Loading...', {});
    this.authservice.logout();
    this.userRole = null;
    this.userMetadata = null;
    Notiflix.Loading.remove();
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

  // Computed State Indicators
  readonly pendingApprovalsCount = computed(
    () =>
      this.applications().filter((a) => a.status === ApplicationStatus.INSTITUTE_VERIFIED).length,
  );

  readonly pendingInstitutesCount = computed(
    () => this.institutes().filter((i) => !i.isVerifyByGovt).length,
  );

  readonly readyForDisburseCount = computed(
    () => this.applications().filter((a) => a.status === ApplicationStatus.ADMIN_APPROVED).length,
  );

  readonly totalDisbursedCount = computed(
    () => this.applications().filter((a) => a.status === ApplicationStatus.DISBURSED).length,
  );

  readonly totalDisbursedAmount = computed(() =>
    this.applications()
      .filter((a) => a.status === ApplicationStatus.DISBURSED)
      .reduce((acc, a) => acc + (a.sanctionAmount || FIXED_SCHOLARSHIP_AMOUNT), 0),
  );

  // =========================================================================
  // API Fetch Methods (Future Backend Endpoints)
  // =========================================================================

  // =========================================================================
  // 1. Govt Admin Approves Scholarship Application (Fixed ₹60k Grant)
  // =========================================================================
  approveApplication(
    applicationId: number,
    sanctionAmount?: number,
    remarks?: string,
  ): Observable<boolean> {
    const finalAmount = sanctionAmount || FIXED_SCHOLARSHIP_AMOUNT;
    const now = new Date().toISOString();

    const payload: ApproveApplicationRequest = {
      applicationId,
      sanctionAmount: finalAmount,
      remarks:
        remarks ||
        `Scholarship grant sanctioned for ₹${finalAmount}. Queued for electronic DBT transfer.`,
    };

    // Update local reactive state immediately
    const updated = this.applications().map((app) => {
      if (app.applicationId === applicationId) {
        return {
          ...app,
          status: ApplicationStatus.ADMIN_APPROVED,
          sanctionAmount: finalAmount,
          timeline: [
            ...app.timeline,
            {
              actionTaken: 'Govt Sanction Approved',
              actorRole: 'GOVT_SCHOLARSHIP_OFFICER',
              remarks: payload.remarks || '',
              actionTime: now,
            },
          ],
        };
      }
      return app;
    });

    // this.saveApplications(updated);

    // If connected to remote backend, forward to API

    return of(true);
  }

  // =========================================================================
  // 2. Govt Admin Rejects Scholarship Application
  // =========================================================================
  rejectApplication(applicationId: number, reason: string): Observable<boolean> {
    const now = new Date().toISOString();

    const payload: RejectApplicationRequest = {
      applicationId,
      reason: reason || 'Application rejected by Govt Scholarship Officer after document review.',
    };

    const updated = this.applications().map((app) => {
      if (app.applicationId === applicationId) {
        return {
          ...app,
          status: ApplicationStatus.ADMIN_REJECTED,
          sanctionAmount: 0,
          timeline: [
            ...app.timeline,
            {
              actionTaken: 'Govt Admin Rejected',
              actorRole: 'GOVT_SCHOLARSHIP_OFFICER',
              remarks: payload.reason,
              actionTime: now,
            },
          ],
        };
      }
      return app;
    });

    // this.saveApplications(updated);

    return of(true);
  }

  // =========================================================================
  // 3. Disburse Single Application via DBT
  // =========================================================================
  disburseSingle(applicationId: number): Observable<boolean> {
    const targetApp = this.applications().find((a) => a.applicationId === applicationId);
    if (!targetApp) return of(false);

    const utr = generateUTR();
    const now = new Date().toISOString();
    const amount = targetApp.sanctionAmount || FIXED_SCHOLARSHIP_AMOUNT;

    const updated = this.applications().map((app) => {
      if (app.applicationId === applicationId) {
        return {
          ...app,
          status: ApplicationStatus.DISBURSED,
          disbursementDate: now,
          utrNumber: utr,
          timeline: [
            ...app.timeline,
            {
              actionTaken: 'DBT Disbursal Executed via PFMS',
              actionBy: 'PFMS Treasury Disbursal Gateway',
              actorRole: 'PFMS_TREASURY_GATEWAY',
              remarks: `Electronic DBT Transfer of ${formatCurrency(amount)} successful. Bank Ref UTR: ${utr}. Credited to A/C: ${app.bankAccountNumber}.`,
              actionTime: now,
            },
          ],
        };
      }
      return app;
    });

    this.saveApplications(updated);

    //API Error disbursing application

    return of(true);
  }

  // =========================================================================
  // 4. Batch Disburse Applications
  // =========================================================================
  disburseBatch(disbursedIds: number[]): Observable<boolean> {
    const now = new Date().toISOString();

    const updated = this.applications().map((app) => {
      if (disbursedIds.includes(app.applicationId)) {
        const utr = generateUTR();
        const amount = app.sanctionAmount || FIXED_SCHOLARSHIP_AMOUNT;
        return {
          ...app,
          status: ApplicationStatus.DISBURSED,
          disbursementDate: now,
          utrNumber: utr,
          timeline: [
            ...app.timeline,
            {
              actionTaken: 'Batch DBT Transfer Executed',
              actionBy: 'PFMS Electronic Treasury Gateway',
              actorRole: 'PFMS_TREASURY_GATEWAY',
              remarks: `Bulk batch disbursement successful. Credited ${formatCurrency(amount)} to ${app.bankAccountNumber}. UTR: ${utr}.`,
              actionTime: now,
            },
          ],
        };
      }
      return app;
    });

    this.saveApplications(updated);
    //API Error executing batch disbursement:

    return of(true);
  }

  // =========================================================================
  // 5. Govt Verifies & Clears Institute Accreditation
  // =========================================================================
  verifyInstitute(profileId: number, remarks?: string): Observable<boolean> {
    const now = new Date().toISOString();

    const payload: VerifyInstituteRequest = {
      profileId,
      remarks:
        remarks ||
        'AISHE credentials and statutory university affiliation verified by Directorate.',
    };

    const updated = this.institutes().map((inst) => {
      if (inst.profileId === profileId) {
        return {
          ...inst,
          isVerifyByGovt: true,
          verifiedAt: now,
          verificationRemarks: payload.remarks,
        };
      }
      return inst;
    });

    // this.saveInstitutes(updated);
    //API Error verifying institute

    return of(true);
  }

  // =========================================================================
  // 6. Revoke Institute Verification
  // =========================================================================
  revokeInstitute(profileId: number, remarks?: string): Observable<boolean> {
    const payload: RevokeInstituteRequest = {
      profileId,
      remarks: remarks || 'Verification revoked pending annual AISHE re-accreditation check.',
    };

    const updated = this.institutes().map((inst) => {
      if (inst.profileId === profileId) {
        return {
          ...inst,
          isVerifyByGovt: false,
          verificationRemarks: payload.remarks,
        };
      }
      return inst;
    });

    this.saveInstitutes(updated);
    //API Error revoking institute

    return of(true);
  }

  // =========================================================================
  // Reset Mock Database to Seed State
  // =========================================================================
  resetDatabase() {
    this.saveApplications(this.initialApplications);
    this.saveInstitutes(this.initialInstitutes);
  }
}
