"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  renderExpandedRow?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found.",
  renderExpandedRow,
}: DataTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<
    Record<string | number, boolean>
  >({});

  const toggleRow = (id: string | number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalColumns = renderExpandedRow ? columns.length + 1 : columns.length;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="table-scroll overflow-x-auto">
        <table className="w-full min-w-170 text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              {renderExpandedRow && <th className="w-10 px-3 py-3.5" />}
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="whitespace-nowrap px-4 py-3.5 sm:px-6"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {renderExpandedRow && <td className="px-3 py-3.5" />}
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5 sm:px-6 sm:py-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isExpanded = !!expandedRows[row.id];
                return (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      {renderExpandedRow && (
                        <td className="px-3 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleRow(row.id)}
                            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            title={isExpanded ? "Collapse Row" : "Expand Row"}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {columns.map((col, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-4 py-3.5 sm:px-6 sm:py-4"
                        >
                          {typeof col.accessor === "function"
                            ? col.accessor(row)
                            : (row[col.accessor] as React.ReactNode)}
                        </td>
                      ))}
                    </tr>

                    {renderExpandedRow && isExpanded && (
                      <tr className="bg-slate-50/80 border-t border-b border-slate-200">
                        <td colSpan={totalColumns} className="p-0">
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
