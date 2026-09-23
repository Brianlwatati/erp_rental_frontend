"use client";

import React from "react";

export interface InvoiceItemInput {
  id?: string;
  description: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

interface InvoiceItemFieldsProps {
  items: InvoiceItemInput[];
  onChange: (items: InvoiceItemInput[]) => void;
  errors?: Record<string, string>;
}

const ITEM_TYPES = [
  { label: "Rent", value: "RENT" },
  { label: "Water", value: "WATER" },
  { label: "Electricity", value: "ELECTRICITY" },
  { label: "Garbage / Trash", value: "GARBAGE" },
  { label: "Parking", value: "PARKING" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Late Fee", value: "LATE_FEE" },
  { label: "Other", value: "OTHER" },
];

export function InvoiceItemFields({
  items,
  onChange,
  errors = {},
}: InvoiceItemFieldsProps) {
  const handleItemChange = (
    index: number,
    field: keyof InvoiceItemInput,
    value: string | number,
  ) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };

    // Auto calculate amount for local display
    if (field === "quantity" || field === "unitPrice") {
      const q = Number(currentItem.quantity) || 0;
      const p = Number(currentItem.unitPrice) || 0;
      currentItem.amount = Number((q * p).toFixed(2));
    }

    newItems[index] = currentItem;
    onChange(newItems);
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        description: "Monthly Rent",
        itemType: "RENT",
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-slate-700">
          Invoice Line Items <span className="text-rose-500">*</span>
        </label>
        <button
          type="button"
          onClick={addItem}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
        >
          + Add Item
        </button>
      </div>

      {errors.items && (
        <p className="text-xs text-rose-600 font-medium">{errors.items}</p>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {items.map((item, index) => {
          const rowAmount =
            item.amount ?? (item.quantity || 0) * (item.unitPrice || 0);

          return (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200"
            >
              {/* Item Type */}
              <div className="col-span-12 sm:col-span-3">
                <select
                  value={item.itemType}
                  onChange={(e) =>
                    handleItemChange(index, "itemType", e.target.value)
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-md bg-white"
                >
                  {ITEM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="col-span-12 sm:col-span-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-md bg-white"
                />
              </div>

              {/* Quantity */}
              <div className="col-span-4 sm:col-span-2">
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "quantity",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-md bg-white"
                />
              </div>

              {/* Unit Price */}
              <div className="col-span-4 sm:col-span-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "unitPrice",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-md bg-white"
                />
              </div>

              {/* Row Total & Delete */}
              <div className="col-span-4 sm:col-span-2 flex items-center justify-between pl-1">
                <span className="text-xs font-bold text-slate-800">
                  KES {rowAmount.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="text-slate-400 hover:text-rose-600 disabled:opacity-30 font-bold ml-2"
                >
                  &times;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
