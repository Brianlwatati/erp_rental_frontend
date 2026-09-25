import { Vendor } from "@/types/expense";
import { Column, DataTable } from "@/components/ui/data-table";

interface VendorTableProps {
  vendors: Vendor[];
  searchTerm: string;
  onEdit: (vendor: Vendor) => void;
}

export function VendorTable({ vendors, searchTerm, onEdit }: VendorTableProps) {
  const normalizedSearch = searchTerm.toLowerCase();
  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(normalizedSearch) ||
      (vendor.serviceType || "").toLowerCase().includes(normalizedSearch),
  );

  const columns: Column<Vendor>[] = [
    {
      header: "Vendor Name",
      accessor: (vendor) => (
        <span className="font-semibold text-slate-900">{vendor.name}</span>
      ),
    },
    {
      header: "Service Type",
      accessor: (vendor) => (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-medium rounded text-[10px]">
          {vendor.serviceType || "General"}
        </span>
      ),
    },
    {
      header: "Contact Person",
      accessor: (vendor) => vendor.contactPerson || "—",
    },
    {
      header: "Phone",
      accessor: (vendor) => (
        <span className="font-mono">{vendor.phone || "—"}</span>
      ),
    },
    { header: "Email", accessor: (vendor) => vendor.email || "—" },
    {
      header: "Status",
      accessor: (vendor) => (
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
            vendor.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {vendor.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (vendor) => (
        <button
          onClick={() => onEdit(vendor)}
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
      data={filteredVendors}
      emptyMessage="No vendors found."
    />
  );
}
