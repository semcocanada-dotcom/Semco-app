// ============================================================
// Database Types — Semco App
// ============================================================

export type ProviderCategory =
  | 'aba_ibi'
  | 'speech_language'
  | 'occupational_therapy'
  | 'physical_therapy'
  | 'psychology'
  | 'respite'
  | 'swimming'
  | 'social_skills'
  | 'music_therapy'
  | 'art_therapy'
  | 'assistive_technology'
  | 'other';

export type ExpenseStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export type ClaimStatus = 'submitted';

// ============================================================
// Table Row Types
// ============================================================

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  home_address: string | null;
  home_city: string | null;
  home_postal_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  date_of_birth: string | null;
  health_card_number: string | null;
  diagnosis_date: string | null;
  diagnosis_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FundingYear {
  id: string;
  child_id: string;
  label: string;
  total_budget: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Provider {
  id: string;
  name: string;
  organization: string | null;
  category: ProviderCategory;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string;
  province: string;
  postal_code: string | null;
  notes: string | null;
  is_approved_sk: boolean;
  parent_id: string | null;
  created_at: string;
  lat: number | null;
  lng: number | null;
}

export interface Expense {
  id: string;
  child_id: string;
  funding_year_id: string;
  provider_id: string | null;
  category: ProviderCategory;
  amount: number;
  description: string | null;
  expense_date: string;
  status: ExpenseStatus;
  receipt_urls: string[];
  logged_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  providers?: Pick<Provider, 'name' | 'category'> | null;
}

export interface MileageLog {
  id: string;
  child_id: string;
  funding_year_id: string;
  description: string | null;
  distance_km: number;
  rate_per_km: number;
  reimbursement_amount: number;
  trip_date: string;
  is_round_trip: boolean;
  expense_id: string | null;
  created_at: string;
}

export interface RespiteWorker {
  id: string;
  parent_id: string;
  name: string;
  phone: string | null;
  default_rate_per_hour: number | null;
  notes: string | null;
  created_at: string;
}

export interface RespiteSession {
  id: string;
  child_id: string;
  funding_year_id: string;
  session_date: string;
  provider_name: string;
  provider_phone: string | null;
  hours: number | null;
  rate_per_hour: number | null;
  amount_paid: number;
  notes: string | null;
  worker_id: string | null;
  logged_by: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  child_id: string;
  provider_id: string | null;
  title: string;
  scheduled_at: string;
  notes: string | null;
  calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  providers?: Pick<Provider, 'name' | 'category'> | null;
}

export interface MonthlyClaim {
  id: string;
  child_id: string;
  funding_year_id: string;
  month: string;             // 'YYYY-MM'
  status: ClaimStatus;
  submitted_at: string;
  total_amount: number;
  expense_ids: string[];
  mileage_ids: string[];
  expense_count: number;
  resend_message_id: string | null;
  batch_number: string | null;
  created_at: string;
}

// ============================================================
// Aggregate / UI Types
// ============================================================

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalPending: number;
  totalMileage: number;
  remaining: number;
  daysRemaining: number;
  fundingYear: FundingYear | null;
}

// ============================================================
// Supabase Database Generic
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      children: {
        Row: Child;
        Insert: Omit<Child, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Child, 'id' | 'parent_id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      funding_years: {
        Row: FundingYear;
        Insert: Omit<FundingYear, 'id' | 'created_at'>;
        Update: Partial<Omit<FundingYear, 'id' | 'child_id' | 'created_at'>>;
        Relationships: [];
      };
      providers: {
        Row: Provider;
        Insert: Omit<Provider, 'id' | 'created_at'>;
        Update: Partial<Omit<Provider, 'id' | 'created_at'>>;
        Relationships: [];
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'providers'>;
        Update: Partial<Omit<Expense, 'id' | 'child_id' | 'funding_year_id' | 'logged_by' | 'created_at' | 'updated_at' | 'providers'>>;
        Relationships: [];
      };
      mileage_logs: {
        Row: MileageLog;
        Insert: Omit<MileageLog, 'id' | 'reimbursement_amount' | 'created_at'>;
        Update: Partial<Omit<MileageLog, 'id' | 'child_id' | 'funding_year_id' | 'reimbursement_amount' | 'created_at'>>;
        Relationships: [];
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'providers'>;
        Update: Partial<Omit<Appointment, 'id' | 'child_id' | 'created_at' | 'updated_at' | 'providers'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      provider_category: ProviderCategory;
      expense_status: ExpenseStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
