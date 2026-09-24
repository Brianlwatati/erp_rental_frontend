"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api_client";
import { Expense, ExpenseCategory, Vendor } from "@/types/expense";
import { ExpenseModal } from "@/components/expense/modal/ExpenseModal";
import { ExpenseCategoryModal } from "@/components/expense/modal/ExpenseCategoryModal";
import { VendorModal } from "@/components/expense/modal/VendorModal";

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<
    "expenses" | "categories" | "vendors"
  >("expenses");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [expRes, catRes, venRes] = await Promise.all([
        apiFetch<Expense[]>("/expenses"),
        apiFetch<ExpenseCategory[]>("/expense-categories"),
        apiFetch<Vendor[]>("/rental-vendors"),
      ]);

      setExpenses(expRes.data || []);
      setCategories(catRes.data || []);
      setVendors(venRes.data || []);
    } catch (err) {
      console.error("Failed to load expense management data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreate = () => {
    if (activeTab === "expenses") {
      setSelectedExpense(null);
      setIsExpenseModalOpen(true);
    } else if (activeTab === "categories") {
      setSelectedCategory(null);
      setIsCategoryModalOpen(true);
    } else {
      setSelectedVendor(null);
      setIsVendorModalOpen(true);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleEditCategory = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsVendorModalOpen(true);
  };

  return (
    <div className="p-0 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Expenses & Vendors
          </h1>
          <p className="text-xs text-slate-500">
            Track operational spending, vendor directories, and category
            accounting codes.
          </p>
        </div>

        {/* Tab-driven Action Button */}
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          {activeTab === "expenses" && "+ Record Expense"}
          {activeTab === "categories" && "+ Add Category"}
          {activeTab === "vendors" && "+ Add Vendor"}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-medium">
        <button
          onClick={() => {
            setActiveTab("expenses");
            setSearchTerm("");
          }}
          className={`pb-3 border-b-2 transition ${
            activeTab === "expenses"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Expenses ({expenses.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("categories");
            setSearchTerm("");
          }}
          className={`pb-3 border-b-2 transition ${
            activeTab === "categories"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("vendors");
            setSearchTerm("");
          }}
          className={`pb-3 border-b-2 transition ${
            activeTab === "vendors"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Vendors ({vendors.length})
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
        />
      </div>

      {/* Content Panels */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading records...
          </div>
        ) : (
          <>
            {/* TAB 1: EXPENSES TABLE */}
            {activeTab === "expenses" && (
              <table className="w-full min-w-[680px] text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Expense #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Ref Code</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses
                    .filter(
                      (e) =>
                        e.description
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        e.expenseNumber
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                    )
                    .map((exp) => (
                      <tr
                        key={exp.id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="p-3 font-semibold text-slate-900">
                          {exp.expenseNumber}
                        </td>
                        <td className="p-3">
                          {new Date(exp.expenseDate).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {exp.description}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">
                            {exp.paymentMethod || "N/A"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleEditExpense(exp)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                        <td className="p-3 font-mono text-slate-500">
                          {exp.referenceNumber || "—"}
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          KES {Number(exp.amount).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              exp.status === "POSTED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : exp.status === "CANCELLED"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {/* TAB 2: CATEGORIES TABLE */}
            {activeTab === "categories" && (
              <table className="w-full min-w-[680px] text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories
                    .filter(
                      (c) =>
                        c.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        c.code.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((cat) => (
                      <tr
                        key={cat.id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="p-3 font-mono font-semibold text-blue-600">
                          {cat.code}
                        </td>
                        <td className="p-3 font-medium text-slate-900">
                          {cat.name}
                        </td>
                        <td className="p-3 text-slate-500">
                          {cat.description || "—"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              cat.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {cat.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {/* TAB 3: VENDORS TABLE */}
            {activeTab === "vendors" && (
              <table className="w-full min-w-[680px] text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Vendor Name</th>
                    <th className="p-3">Service Type</th>
                    <th className="p-3">Contact Person</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors
                    .filter(
                      (v) =>
                        v.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        (v.serviceType &&
                          v.serviceType
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())),
                    )
                    .map((ven) => (
                      <tr
                        key={ven.id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="p-3 font-semibold text-slate-900">
                          {ven.name}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-medium rounded text-[10px]">
                            {ven.serviceType || "General"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleEditVendor(ven)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                        <td className="p-3">{ven.contactPerson || "—"}</td>
                        <td className="p-3 font-mono">{ven.phone || "—"}</td>
                        <td className="p-3">{ven.email || "—"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              ven.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {ven.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={fetchAllData}
        expense={selectedExpense}
        categories={categories}
        vendors={vendors}
      />
      <ExpenseCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={fetchAllData}
        category={selectedCategory}
      />
      <VendorModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onSuccess={fetchAllData}
        vendor={selectedVendor}
      />
    </div>
  );
}
