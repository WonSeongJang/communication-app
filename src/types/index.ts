// Re-export database types
export type {
  User,
  Notice,
  Post,
  Donation,
  Comment,
  Tables,
} from '@/lib/supabase';

import type { User, Donation } from '@/lib/supabase';

// Auth types
export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends LoginFormData {
  name: string;
  generation: number;
  occupation: string;
  phone: string;
  messengerID?: string;
  profileImage?: File;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
}

// Navigation types
export type NavItem = {
  label: string;
  path: string;
  icon?: React.ReactNode;
  requiresAuth?: boolean;
  requiresRole?: 'president' | 'member';
};

// Donation types
export interface DonationWithDonor extends Donation {
  donor?: {
    name: string;
    generation: number;
  };
}

export interface DonationSummary {
  donor_id: string;
  donor_name: string;
  donor_generation: number;
  total_amount: number;
}

export interface CreateDonationInput {
  donor_id: string;
  amount: number;
  donated_at?: string;
}
