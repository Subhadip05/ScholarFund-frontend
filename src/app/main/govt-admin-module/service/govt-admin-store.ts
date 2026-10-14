import { computed, inject, Injectable, signal } from '@angular/core';
import {
  InstituteDto,
  ScholarshipApplicationDto,
  ApplicationStatus,
  ApplicationStatusUpdateRequest,
} from '../../../../shared/types';
import {
  FIXED_SCHOLARSHIP_AMOUNT,
  formatCurrency,
  generateUTR,
} from '../../../../shared/utils/formatters';
import Notiflix from 'notiflix';
import { Observable, of } from 'rxjs';
import { Apiservice } from '../../../../shared/api/apiservice';

@Injectable({
  providedIn: 'root',
})
export class GovtAdminStore {
  private apiService = inject(Apiservice);

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
      affiliationCertificateUrl: '',
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
      affiliationCertificateUrl: '',
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
      affiliationCertificateUrl: '',
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
      incomeCertificateUrl: '',
      hsMarksheetUrl: '',
      bankPassbookUrl: '',
      admissionReceiptUrl: '',
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
      incomeCertificateUrl: '',
      hsMarksheetUrl: '',
      bankPassbookUrl: '',
      admissionReceiptUrl: '',
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
      incomeCertificateUrl: '',
      hsMarksheetUrl: '',
      bankPassbookUrl: '',
      admissionReceiptUrl: '',
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
      incomeCertificateUrl: '',
      hsMarksheetUrl: '',
      bankPassbookUrl: '',
      admissionReceiptUrl: '',
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
      incomeCertificateUrl: '',
      hsMarksheetUrl: '',
      bankPassbookUrl: '',
      admissionReceiptUrl: '',
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
      incomeCertificateUrl: '',
      hsMarksheetUrl: '',
      bankPassbookUrl: '',
      admissionReceiptUrl: '',
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
      incomeCertificateUrl: '',
      hsMarksheetUrl: '',
      bankPassbookUrl: '',
      admissionReceiptUrl: '',
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

  // Reactive State Signals
  readonly applications = signal<ScholarshipApplicationDto[]>(this.initialApplications);
  readonly institutes = signal<InstituteDto[]>(this.initialInstitutes);
  readonly modalRemarks = signal<string>('');

  fetchAllInstitutes(): void {
    Notiflix.Loading.pulse('Fetching applications...');
    this.apiService.getAllInstitutes().subscribe({
      next: (res) => {
        console.log('Fetching all institutes list response', res);
        const apiData = res.data ?? [];

        const apiIds = new Set(apiData.map((item: any) => item.profileId || item.instituteId));

        const uniqueDemo = this.initialInstitutes.filter((demo) => !apiIds.has(demo.profileId));

        this.institutes.set([...apiData, ...uniqueDemo]);
        Notiflix.Loading.remove();
      },
      error: (err) => {
        console.log(err);
        this.institutes.set(this.initialInstitutes);
        Notiflix.Loading.remove();
      },
    });
  }

  fetchApplications(statusFilter?: ApplicationStatus): void {
    Notiflix.Loading.pulse('Fetching applications...');
    this.apiService.getApplicationsList(statusFilter).subscribe({
      next: (res) => {
        console.log('Fetching application list response', res);
        const apiData = res.data ?? [];

        const apiIds = new Set(
          apiData.map((item: any) => item.applicationId || item.applicationId),
        );

        const uniqueDemo = this.initialApplications.filter(
          (demo) => !apiIds.has(demo.applicationId),
        );

        this.applications.set([...apiData, ...uniqueDemo]);
        Notiflix.Loading.remove();
      },
      error: (err) => {
        console.log(err);
        this.applications.set(this.initialApplications);
        Notiflix.Loading.remove();
      },
    });
  }

  private saveApplications(apps: ScholarshipApplicationDto[]) {
    this.applications.set(apps);
  }

  private saveInstitutes(insts: InstituteDto[]) {
    this.institutes.set(insts);
  }

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

  // 3. Disburse Single Application via DBT
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

  // 4. Batch Disburse Applications
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

  applicationStatusUpdate(
    applicationId: number,
    targetStatus: ApplicationStatus,
    remarks: string,
  ): void {
    const statusMeta: Record<
      string,
      { actionLabel: string; timelineAction: string; buttonColor: string; dialogTitle: string }
    > = {
      [ApplicationStatus.ADMIN_APPROVED]: {
        actionLabel: 'Approve',
        timelineAction: 'Govt Sanction Approved',
        buttonColor: '#059669',
        dialogTitle: 'Approve Sanction',
      },
      [ApplicationStatus.ADMIN_REJECTED]: {
        actionLabel: 'Reject',
        timelineAction: 'Govt Rejected',
        buttonColor: '#dc2626',
        dialogTitle: 'Reject Application',
      },
      [ApplicationStatus.DISBURSED]: {
        actionLabel: 'Disburse Funds',
        timelineAction: 'Direct Benefit Transfer (DBT) Executed',
        buttonColor: '#7c3aed',
        dialogTitle: 'Confirm DBT Disbursal',
      },
    };

    const meta = statusMeta[targetStatus] ?? {
      actionLabel: 'Update',
      timelineAction: `Status changed to ${targetStatus}`,
      buttonColor: '#2563eb',
      dialogTitle: 'Update Application',
    };

    const now = new Date().toISOString();
    const payload: ApplicationStatusUpdateRequest = {
      statusAction: targetStatus,
      actionRemarks: remarks,
    };

    console.log(`Application Id: ${applicationId} and payload :`, payload);

    Notiflix.Confirm.show(
      meta.dialogTitle,
      `Are you sure you want to mark application #${applicationId} as ${targetStatus}?`,
      meta.actionLabel,
      'Cancel',
      () => {
        Notiflix.Loading.pulse('Updating status...');

        const updated = this.applications().map((app) => {
          if (app.applicationId === applicationId) {
            return {
              ...app,
              status: targetStatus,
              timeline: [
                ...(app.timeline || []),
                {
                  actionTaken: meta.timelineAction,
                  actionBy: 'Govt Admin',
                  actorRole: 'GOVT_SCHOLARSHIP_OFFICER',
                  remarks: remarks,
                  actionTime: now,
                },
              ],
            };
          }
          return app;
        });

        this.apiService.updateApplicationStatus(applicationId, payload).subscribe({
          next: (res) => {
            Notiflix.Loading.remove();

            if (res.data) {
              this.saveApplications(updated);
            }

            Notiflix.Notify.success(
              res.message || `Application #${applicationId} marked as ${targetStatus}.`,
            );
            this.modalRemarks.set('');
          },
          error: (err) => {
            Notiflix.Loading.remove();
            Notiflix.Notify.failure(
              err?.error?.message || 'Failed to update application status. Changes reverted.',
            );
          },
        });
      },
      () => {
        console.log('Cancel button clicked');
      },
      {
        okButtonBackground: meta.buttonColor,
      },
    );
  }

  handleVerifyInstitute(instituteId: number, instituteName: string): void {
    console.log('Id:', instituteId);

    Notiflix.Confirm.show(
      'Accreditation Clearance',
      `Are you sure you want to approve "${instituteName}"?`,
      'Verify & Approve',
      'Cancel',
      () => {
        Notiflix.Loading.pulse('Verifying institute...');
        const now = new Date().toISOString();

        const previousInstitutes = this.institutes();
        const updated = this.institutes().map((inst) => {
          if (inst.profileId === instituteId) {
            return {
              ...inst,
              isVerifyByGovt: true,
              verifiedAt: now,
              verificationRemarks: 'Verified by Govt Admin',
            };
          }
          return inst;
        });

        // return;
        this.apiService.verifyInstitute(instituteId).subscribe({
          next: (res) => {
            console.log('Institute update response :', res);

            Notiflix.Loading.remove();
            Notiflix.Notify.success(
              res.message || `Institute "${instituteName}" verified successfully.`,
            );
            this.saveInstitutes(updated);
          },
          error: (err) => {
            Notiflix.Loading.remove();

            this.institutes.set(previousInstitutes);

            Notiflix.Notify.failure(
              err?.error?.message || `Failed to verify "${instituteName}". Changes reverted.`,
            );
          },
        });
      },
      () => {
        console.log('Cancel clicked');
      },
      {
        okButtonBackground: '#059669',
      },
    );
  }

  // Reset Mock Database to Seed State
  resetDatabase() {
    this.saveApplications(this.initialApplications);
    this.saveInstitutes(this.initialInstitutes);
  }
}
