import { ApplicationStatus } from '../types';

export const FIXED_SCHOLARSHIP_AMOUNT = 60000; // Fixed one-time grant: 60,000 INR

export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatDateOnly = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
};

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
}

export const getStatusConfig = (status: ApplicationStatus): StatusConfig => {
  switch (status) {
    case ApplicationStatus.SUBMITTED:
      return {
        label: 'Pending Institute Verification',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500',
        description: 'Waiting for College/Institute Nodal Officer verification.',
      };
    case ApplicationStatus.INSTITUTE_VERIFIED:
      return {
        label: 'Pending Govt Sanction Review',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        dotClass: 'bg-amber-600 animate-pulse',
        description: 'Approved by Institute. Awaiting Directorate sanction approval.',
      };
    case ApplicationStatus.INSTITUTE_REJECTED:
      return {
        label: 'Rejected by Institute',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        dotClass: 'bg-slate-400',
        description: 'College rejected application due to academic or document mismatch.',
      };
    case ApplicationStatus.ADMIN_APPROVED:
      return {
        label: 'Sanctioned (Ready for DBT)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
        dotClass: 'bg-emerald-600',
        description: 'Govt grant sanctioned. Ready for PFMS electronic fund transfer.',
      };
    case ApplicationStatus.ADMIN_REJECTED:
      return {
        label: 'Rejected by Govt Directorate',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
        description: 'Application rejected by Govt Scholarship Officer.',
      };
    case ApplicationStatus.DISBURSED:
      return {
        label: 'Direct Benefit Disbursed',
        badgeClass: 'bg-purple-50 text-purple-900 border-purple-300 font-semibold',
        dotClass: 'bg-purple-600',
        description: 'Funds successfully credited to student bank account via PFMS.',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        dotClass: 'bg-slate-400',
        description: '',
      };
  }
};

export const generateUTR = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DBT${new Date().getFullYear()}IN${timestamp}${randomChars}`;
};
