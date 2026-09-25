// Types derived from SQL schemas
export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  serviceType?: string;
  status: "ACTIVE" | "INACTIVE";
  created_at?: string;
}

export interface Expense {
  id: string;
  company_id?: string;
  property_id?: string;
  property_name?: string;
  property_code?: string;
  building_id?: string;
  building_name?: string;
  building_code?: string;
  unit_number?: string;
  unit_id?: string;
  expense_category_id?: string;
  vendor_id?: string;
  expense_number: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method?: "CASH" | "BANK" | "MPESA" | "CARD" | "CHEQUE" | "OTHER";
  reference_number?: string;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  createdBy?: string;
  created_at?: string;
}

export interface ExpenseCreateSchema {
  propertyId?: string;
  buildingId?: string;
  unitId?: string;
  expenseCategoryId?: string;
  vendorId?: string;
  expenseNumber?: string;
  description: string;
  amount: number;
  expenseDate?: string;
  paymentMethod?: "CASH" | "BANK" | "MPESA" | "CARD" | "CHEQUE" | "OTHER";
  referenceNumber?: string;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  createdBy?: string;
  created_at?: string;
}
