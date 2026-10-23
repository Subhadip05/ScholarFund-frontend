export type ModalType =
  'student-login' | 'register' | 'college-login' | 'govt-login' | 'eligibility-checker' | null;
export type UserRole = 'STUDENT' | 'COLLEGE' | 'GOVT' | null;

export type MainTab = 'APPLICATIONS' | 'INSTITUTES' | 'DISBURSEMENTS';
export type DocType =
  'INCOME' | 'MARKSHEET' | 'BANK_PASSBOOK' | 'ADMISSION_RECEIPT' | 'AFFILIATION_CERTIFICATE';

export interface ScholarshipScheme {
  id: string;
  name: string;
  ministry: string;
  amount: string;
  minGPA: number;
  maxIncome: number;
  category: string[];
}

export interface CollegeApplication {
  id: string;
  name: string;
  course: string;
  scheme: string;
  status: string;
  income: string;
  gpa: string;
}

export interface RegisteredCollege {
  email: string;
  contactPersonName: string;
  phone: string;
  code: string;
  collegeName: string;
}

// ------------------------ For Auth Service ------------------------
export interface ApiResponse<T> {
  status: number;
  code: string;
  message: string;
  data: T;
  data2: T;
  recordCount: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  fullName: string;
  email: string;
  phoneNo: string;
}

export interface RegisterStudentDto {
  email: string;
  fullName: string;
  phoneNumber: string;
}

export interface RegisterCollegeDto {
  email: string;
  contactPersonName: string;
  phoneNumber: string;
}

export interface RequestOtpDto {
  email: string;
  role: 'STUDENT' | 'COLLEGE';
}

export interface VerifyOtpDto {
  email: string;
  otpCode: string;
  role: 'STUDENT' | 'COLLEGE';
}

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface StudentProfileDto {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  aadhaarNumber: string;
  isWestBengalResident: boolean;
  aadhaarFileId: number;
  selfImageFileId: number;
  selfSignatureFileId: number;
}
export interface StudentProfileResponse {
  profileId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  aadhaarNumber: string;
  isWestBengalResident: boolean;
  isApplicationSubmitted: boolean;

  // AWS Presigned URLs - 15 mintues valid
  aadhaarDocumentUrl: string;
  selfImageDocUrl: string;
  selfSignatureUrl: string;
}

export interface InstituteProfileResponse {
  profileId: number;
  email: string;
  instituteName: string;
  collegeCode: string;
  universityAffiliation: string;
  principalName: string;
  address: string;
  affiliationCertificateUrl: string;
}

export interface DocumentUploadResponse {
  documentId: number;
  documentUrl: string;
}

export interface ApplicationSubmitRequest {
  instituteId: number;
  courseName: string;
  academicYear: string;
  lastQualificationMarks: number;
  lastQualificationCourse: string;
  lastQualificationExamRollNo: string;
  passOutBoardName: string;
  annualIncome: number;
  bankAccountNumber: string;
  ifscCode: string;

  incomeFileId: number;
  hsMarksheetFileId: number;
  bankPassbookFileId: number;
  admissionReceiptFileId: number;
}

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  INSTITUTE_VERIFIED = 'INSTITUTE_VERIFIED',
  INSTITUTE_REJECTED = 'INSTITUTE_REJECTED',
  ADMIN_APPROVED = 'ADMIN_APPROVED',
  ADMIN_REJECTED = 'ADMIN_REJECTED',
  DISBURSED = 'DISBURSED',
}
export interface StatusActionMeta {
  title: string;
  message: string;
  confirmText: string;
  buttonColor: string;
  severity: 'success' | 'warn' | 'error' | 'info';
  successSummary: string;
}

export const STATUS_ACTION_CONFIG: Partial<Record<ApplicationStatus, StatusActionMeta>> = {
  [ApplicationStatus.INSTITUTE_VERIFIED]: {
    title: 'Verify Application',
    message:
      'Are you sure you want to verify and forward this application to Government Nodal Officers?',
    confirmText: 'Verify & Approve',
    buttonColor: '#059669',
    severity: 'success',
    successSummary: 'Application Verified',
  },
  [ApplicationStatus.INSTITUTE_REJECTED]: {
    title: 'Reject Application',
    message: 'Are you sure you want to reject this student application?',
    confirmText: 'Reject',
    buttonColor: '#ef4444',
    severity: 'warn',
    successSummary: 'Application Rejected',
  },
  [ApplicationStatus.ADMIN_APPROVED]: {
    title: 'Grant Sanction Clearance',
    message: 'Approve and clear this application for direct benefit disbursement?',
    confirmText: 'Sanction Grant',
    buttonColor: '#2563eb',
    severity: 'success',
    successSummary: 'Sanction Approved',
  },
  [ApplicationStatus.ADMIN_REJECTED]: {
    title: 'Government Rejection',
    message: 'Reject this application at the State Directorate clearance level?',
    confirmText: 'Reject Application',
    buttonColor: '#dc2626',
    severity: 'error',
    successSummary: 'Application Disqualified',
  },
  [ApplicationStatus.DISBURSED]: {
    title: 'Confirm DBT Release',
    message: 'Execute direct treasury disbursement for this candidate?',
    confirmText: 'Mark Disbursed',
    buttonColor: '#7c3aed',
    severity: 'info',
    successSummary: 'Disbursement Released',
  },
};

export interface ApplicationHistoryDto {
  actionTaken: string;
  actionBy: string;
  actorRole: string;
  remarks: string;
  actionTime: string;
}
export interface ApplicationResponse {
  applicationId: number;
  studentName: string;
  instituteName: string;
  courseName: string;
  academicYear: string;
  lastQualificationMarks: number;
  lastQualificationCourse: string;
  lastQualificationExamRollNo: string;
  passOutBoardName: string;
  annualIncome: number;
  bankAccountNumber: string;
  ifscCode: string;
  status: ApplicationStatus;

  incomeCertificateUrl: string;
  hsMarksheetUrl: string;
  bankPassbookUrl: string;
  admissionReceiptUrl: string;
  timeline: ApplicationHistoryDto[];
}

export interface InstituteProfileDto {
  instituteName: string;
  collegeCode: string;
  universityAffiliation: string;
  principalName: string;
  officerPhoneNo: string;
  officerName: string;
  address: string;
  affiliationCertificateFileId: number;
}
export interface InstituteProfileResponse {
  profileId: number;
  email: string;
  officerName: string;
  officerPhoneNo: string;
  instituteName: string;
  isVerifyByGovt: boolean;
  collegeCode: string;
  universityAffiliation: string;
  principalName: string;
  address: string;
  affiliationCertificateUrl: string;
}

export interface ApplicationStatusUpdateRequest {
  statusAction: ApplicationStatus;
  actionRemarks?: string;
}

export interface ScholarshipApplicationDto {
  applicationId: number; // Long
  studentName: string;
  instituteName: string;
  courseName: string;
  academicYear: string;
  lastQualificationMarks: number; // Double
  lastQualificationCourse: string;
  lastQualificationExamRollNo: string;
  passOutBoardName: string;
  annualIncome: number; // Double
  bankAccountNumber: string;
  ifscCode: string;
  status: ApplicationStatus;

  // AWS Presigned URLs for frontend display
  incomeCertificateUrl: string;
  hsMarksheetUrl: string;
  bankPassbookUrl: string;
  admissionReceiptUrl: string;

  timeline: ApplicationHistoryDto[];

  // Additional metadata for govt administrative operations
  sanctionAmount?: number;
  bankName?: string;
  branchName?: string;
  disbursementDate?: string;
  utrNumber?: string;
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Minority';
  gender?: 'Male' | 'Female' | 'Other';
  studentEmail?: string;
  studentPhone?: string;
  district?: string;
  state?: string;
  applicationDate?: string;
  instituteCollegeCode?: string;
}

export interface InstituteDto {
  profileId: number; // Long
  email: string;
  officerName: string;
  officerPhoneNo: string;
  isVerifyByGovt: boolean;
  instituteName: string;
  collegeCode: string;
  universityAffiliation: string;
  principalName: string;
  address: string;
  affiliationCertificateUrl: string;

  // Additional helper fields
  registeredDate?: string;
  aisheCode?: string;
  instituteType?: 'GOVERNMENT' | 'GOVT_AIDED' | 'PRIVATE' | 'CENTRAL_UNIVERSITY';
  verificationRemarks?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  district?: string;
  state?: string;
  contactNumber?: string;
  totalApplicationsCount?: number;
  approvedApplicationsCount?: number;
}

export interface ApplicationStatusUpdateRequest {
  statusAction: ApplicationStatus;
  actionRemarks?: string;
}
