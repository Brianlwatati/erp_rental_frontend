import { Expense } from "@/types/expense";
import { Column, DataTable } from "@/components/ui/data-table";

interface ExpenseTableProps {
  expenses: Expense[];
  searchTerm: string;
  onEdit: (expense: Expense) => void;
}

export function ExpenseTable({
  expenses,
  searchTerm,
  onEdit,
}: ExpenseTableProps) {
  const normalizedSearch = searchTerm.toLowerCase();
  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(normalizedSearch) ||
      expense.expense_number.toLowerCase().includes(normalizedSearch),
  );

  const columns: Column<Expense>[] = [
    {
      header: "Expense #",
      accessor: (expense) => (
        <span className="font-semibold text-slate-900">
          {expense.expense_number}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (expense) =>
        new Date(expense.expense_date).toLocaleDateString(),
    },
    {
      header: "Description",
      accessor: (expense) => (
        <span className="font-medium text-slate-800">
          {expense.description}
        </span>
      ),
    },
    {
      header: "Method",
      accessor: (expense) => (
        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">
          {expense.paymentMethod || "N/A"}
        </span>
      ),
    },
    {
      header: "Ref Code",
      accessor: (expense) => (
        <span className="font-mono text-slate-500">
          {expense.referenceNumber || "—"}
        </span>
      ),
    },
    {
      header: "Amount",
      accessor: (expense) => (
        <span className="font-bold text-slate-900">
          KES {Number(expense.amount).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (expense) => (
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
            expense.status === "POSTED"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : expense.status === "CANCELLED"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {expense.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (expense) => (
        <button
          onClick={() => onEdit(expense)}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={filteredExpenses}
      emptyMessage="No expenses found."
    />
  );
}
