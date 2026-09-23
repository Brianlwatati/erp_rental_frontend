export interface InvoiceItemCreateInput {
  description: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceCreateInput {
  tenantId: string;
  leaseId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  discount: number;
  tax: number;
  notes: string;
  items: InvoiceItemCreateInput[];
}

// Full Invoice model interface (as returned from your backend/database)
export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  description: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
  createdAt?: string;
}

export interface Invoice {
  id: string;
  companyId?: string;
  tenantId: string;
  leaseId: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status:
    | "DRAFT"
    | "ISSUED"
    | "PARTIALLY_PAID"
    | "PAID"
    | "OVERDUE"
    | "CANCELLED";
  notes?: string;
  items?: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
}
