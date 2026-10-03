import type { ChangeEventHandler } from "react";

interface InvoiceFinancialFieldsProps {
  discount: number | string;
  tax: number | string;
  notes: string;
  subtotal: number;
  total: number;
  displayOnlyDeposit?: number;
  readOnly?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export function InvoiceFinancialFields({
  discount,
  tax,
  notes,
  subtotal,
  total,
  displayOnlyDeposit = 0,
  readOnly = false,
  onChange,
}: InvoiceFinancialFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Discount (KES)
          </label>
          <input
            type="number"
            name="discount"
            min="0"
            value={discount}
            disabled={readOnly}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tax (KES)
          </label>
          <input
            type="number"
            name="tax"
            min="0"
            value={tax}
            disabled={readOnly}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap justify-between items-center gap-2 text-xs">
        <span className="text-slate-600">
          Subtotal: KES {subtotal.toLocaleString()}
        </span>
        {displayOnlyDeposit > 0 && (
          <span className="text-amber-700">
            First-invoice deposit (added by backend): KES{" "}
            {displayOnlyDeposit.toLocaleString()}
          </span>
        )}
        <span className="text-slate-600">
          Tax/Disc: +{tax} / -{discount}
        </span>
        <span className="text-sm font-bold text-slate-900">
          Total: KES {total.toLocaleString()}
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          rows={2}
          value={notes}
          onChange={onChange}
          placeholder="Payment instructions or terms..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
        />
      </div>
    </>
  );
}
