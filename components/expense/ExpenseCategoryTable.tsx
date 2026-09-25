import { ExpenseCategory } from "@/types/expense";
import { Column, DataTable } from "@/components/ui/data-table";

interface ExpenseCategoryTableProps {
  categories: ExpenseCategory[];
  searchTerm: string;
  onEdit: (category: ExpenseCategory) => void;
}

export function ExpenseCategoryTable({
  categories,
  searchTerm,
  onEdit,
}: ExpenseCategoryTableProps) {
  const normalizedSearch = searchTerm.toLowerCase();
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(normalizedSearch) ||
      category.code.toLowerCase().includes(normalizedSearch),
  );

  const columns: Column<ExpenseCategory>[] = [
    {
      header: "Code",
      accessor: (category) => (
        <span className="font-mono font-semibold text-blue-600">
          {category.code}
        </span>
      ),
    },
    {
      header: "Name",
      accessor: (category) => (
        <span className="font-medium text-slate-900">{category.name}</span>
      ),
    },
    {
      header: "Description",
      accessor: (category) => (
        <span className="text-slate-500">{category.description || "—"}</span>
      ),
    },
    {
      header: "Status",
      accessor: (category) => (
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
            category.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {category.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (category) => (
        <button
          onClick={() => onEdit(category)}
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
      data={filteredCategories}
      emptyMessage="No expense categories found."
    />
  );
}
