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
  propertyId?: string;
  buildingId?: string;
  unitId?: string;
  expenseCategoryId?: string;
  vendorId?: string;
  expense_number: string;
  description: string;
  amount: number;
  expense_date: string;
  paymentMethod?: "CASH" | "BANK" | "MPESA" | "CARD" | "CHEQUE" | "OTHER";
  referenceNumber?: string;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  createdBy?: string;
  created_at?: string;
}
