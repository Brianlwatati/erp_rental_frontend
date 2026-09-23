import { z } from "zod";

// Zod Schema matching your backend requirements
export const paymentCreateSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  paymentNumber: z.string().optional(),
  paymentDate: z.string().optional(),
  amount: z.number().gt(0, "Amount must be greater than 0"),
  paymentMethod: z.enum(["CASH", "BANK", "MPESA", "CARD", "CHEQUE", "OTHER"]),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  allocations: z
    .array(
      z.object({
        invoiceId: z.string().min(1, "Invoice ID is required"),
        amount: z.number().gt(0, "Allocation amount must be greater than 0"),
      }),
    )
    .optional(),
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;

export interface PaymentAllocation {
  id?: string;
  paymentId?: string;
  invoiceId: string;
  amount: number;
  createdAt?: string;
  invoice?: {
    invoiceNumber: string;
    total: number;
    balance: number;
  };
}

export interface Payment {
  id: string;
  companyId: string;
  tenantId: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: "CASH" | "BANK" | "MPESA" | "CARD" | "CHEQUE" | "OTHER";
  referenceNumber?: string;
  notes?: string;
  status: "PENDING" | "POSTED" | "REVERSED" | "CANCELLED";
  allocations?: PaymentAllocation[];
  createdAt: string;
}
