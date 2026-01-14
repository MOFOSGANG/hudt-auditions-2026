
export enum AppStatus {
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  AUDITION_SCHEDULED = 'Audition Scheduled',
  ACCEPTED = 'Accepted',
  WAITLISTED = 'Waitlisted',
  NOT_SELECTED = 'Not Selected'
}

export enum Page {
  HOME = 'home',
  APPLY = 'apply',
  CONFIRMATION = 'confirmation',
  CHECK_STATUS = 'check-status',
  FAQ = 'faq',
  ADMIN_LOGIN = 'admin-login',
  ADMIN_DASHBOARD = 'admin-dashboard'
}

export interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  level: string;
  talents: string[];
  instruments?: string;
  otherTalents?: string;
  experience: 'Yes' | 'No';
  experienceDetails?: string;
  motivation: string;
  gain: string;
  availability: string[];
  preferredSlot?: string;
  status: AppStatus;
  submissionDate: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
