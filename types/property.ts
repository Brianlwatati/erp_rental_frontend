export interface Property {
  id: string;
  company_id: string;
  name: string;
  code: string;
  property_type?: string;
  address?: string;
  city?: string;
  county?: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
  buildings?: Building[];
  units?: Unit[];
}

export interface Building {
  id: string;
  property_id: string;
  name: string;
  code: string;
  floors?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UnitType {
  id: string;
  company_id: string;
  name: string;
  code: string;
  bedrooms: number;
  bathrooms: number;
  description?: string;
}

export interface Unit {
  id: string;
  building_id: string;
  unit_type_id?: string;
  unit_number: string;
  floor?: number;
  monthly_rent: number;
  deposit_amount: number;
  status: "VACANT" | "OCCUPIED" | "RESERVED" | "MAINTENANCE" | "INACTIVE";
  description?: string;
  created_at: string;
  updated_at: string;
  building?: Building;
  unit_type?: UnitType;
}
