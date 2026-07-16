export type ModalType = 'student-login' | 'register' | 'college-login' | 'govt-login' | 'eligibility-checker' | null;
export type UserRole = 'student' | 'college-admin' | 'govt-admin' | null;

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
}

export interface VerifyOtpDto {
  email: string;
  otpCode: string;
}

export interface AdminLoginDto {
  email: string;
  password: string;
}

