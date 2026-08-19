export type ModalType =
  'student-login' | 'register' | 'college-login' | 'govt-login' | 'eligibility-checker' | null;
export type UserRole = 'student' | 'college-admin' | 'GOVT' | null;

export interface ScholarshipScheme {
  id: string;
  name: string;
  ministry: string;
  amount: string;
  minGPA: number;
  maxIncome: number;
  category: string[];
}

export interface TimelineItem {
  label: string;
  status: string;
  date: string;
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
