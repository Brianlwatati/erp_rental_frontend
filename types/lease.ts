import { Unit } from "./property";
import { Tenant } from "./tenant";

export type LeaseStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";

export interface Lease {
  id: string;
  company_id: string;
  unit_id: string;
  tenant_id: string;
  lease_number: string;
  start_date: string;
  end_date?: string | null;
  monthly_rent: number;
  deposit_amount: number;
  billing_day: number;
  status: LeaseStatus;
  termination_date?: string | null;
  termination_reason?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined properties
  unit?: Unit;
  tenant?: Tenant;
}

export interface LeaseCharge {
  id: string;
  lease_id: string;
  name: string;
  charge_type: string;
  amount: number;
  recurring: boolean;
  created_at: string;
}
