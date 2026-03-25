export type UserRole = "tenant" | "landlord" | "admin";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type PropertyStatus = "draft" | "active" | "rented" | "archived";
export type PropertyType = "apartment" | "house" | "studio" | "room" | "commercial";
export type ApplicationStatus = "submitted" | "under_review" | "approved" | "rejected" | "withdrawn";
export type TransactionType = "rent" | "deposit" | "refund" | "fee";
export type TransactionStatus = "pending" | "held_in_escrow" | "completed" | "failed" | "refunded";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  verification_status: VerificationStatus;
  trust_score: number;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description: string | null;
  property_type: PropertyType;
  status: PropertyStatus;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  country: string;
  rent_amount: number;
  currency: string;
  deposit_amount: number;
  bedrooms: number;
  bathrooms: number;
  size_sqm: number | null;
  is_furnished: boolean;
  allows_pets: boolean;
  images: string[];
  is_verified: boolean;
  verified_at: string | null;
  available_from: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  property_id: string;
  tenant_id: string;
  status: ApplicationStatus;
  employment_status: string | null;
  monthly_income: number | null;
  num_occupants: number;
  move_in_date: string | null;
  message: string | null;
  landlord_note: string | null;
  reviewed_at: string | null;
  trust_score_at_apply: number | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  application_id: string | null;
  property_id: string;
  payer_id: string;
  payee_id: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  platform_fee: number;
  reference: string | null;
  provider: string | null;
  escrow_released_at: string | null;
  period_start: string | null;
  period_end: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
