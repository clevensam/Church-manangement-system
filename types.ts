// Defined based on Section 7 of SDD and API Documentation

export type UserRole = 'admin' | 'pastor' | 'accountant' | 'jumuiya_leader';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  must_change_password: boolean;
  last_sign_in_at?: string;
  created_at?: string;
}

// Deprecated: Alias for backward compatibility if needed, but User is preferred
export type AppUser = User;
export type UserProfile = User;

export interface Expense {
  id: string;
  expense_date: string;
  description: string;
  amount: number;
}

export enum ServiceType {
  FIRST = 'Ibada ya Kwanza',
  SECOND = 'Ibada ya Pili',
  SPECIAL = 'Ibada Maalum'
}

export interface RegularOffering {
  id: string;
  service_date: string;
  service_type: ServiceType;
  amount: number;
}

export interface Fellowship {
  id: string;
  name: string;
}

export interface Donor {
  envelope_number: string; // PK
  donor_name: string;
  fellowship_id: string; // FK to Fellowship
  // Optional for UI display (fetched via join)
  fellowship_name?: string; 
}

export interface EnvelopeOffering {
  id: string;
  envelope_number: string; // FK
  amount: number;
  offering_date: string;
  bahasha_type: 'Ahadi' | 'Jengo' | string; // New Field
  // Optional expanded field for UI convenience if joining tables
  donor_name?: string; 
  fellowship_name?: string;
}

export interface JengoPledge {
    envelope_number: string;
    amount: number; // The target/pledged amount
    // Computed fields for UI
    paid_amount?: number;
    remaining_amount?: number;
    donor_name?: string;
    fellowship_name?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  recentTransactions: Array<{
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
  }>;
}