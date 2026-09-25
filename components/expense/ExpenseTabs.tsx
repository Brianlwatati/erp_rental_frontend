export type ExpenseTab = "expenses" | "categories" | "vendors";

interface ExpenseTabsProps {
  activeTab: ExpenseTab;
  expenses: number;
  categories: number;
  vendors: number;
  onChange: (tab: ExpenseTab) => void;
}

export function ExpenseTabs({
  activeTab,
  expenses,
  categories,
  vendors,
  onChange,
}: ExpenseTabsProps) {
  const tabs = [
    { id: "expenses" as const, label: `Expenses (${expenses})` },
    { id: "categories" as const, label: `Categories (${categories})` },
    { id: "vendors" as const, label: `Vendors (${vendors})` },
  ];

  return (
    <div className="flex border-b border-slate-200 gap-6 text-xs font-medium">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`pb-3 border-b-2 transition ${
            activeTab === tab.id
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
