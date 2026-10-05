"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api_client";
import { Expense, ExpenseCategory, Vendor } from "@/types/expense";
import { ExpenseModal } from "@/components/expense/modal/ExpenseModal";
import { ExpenseCategoryModal } from "@/components/expense/modal/ExpenseCategoryModal";
import { VendorModal } from "@/components/expense/modal/VendorModal";
import { ExpenseCategoryTable } from "@/components/expense/ExpenseCategoryTable";
import { ExpenseTable } from "@/components/expense/ExpenseTable";
import { ExpenseTabs, ExpenseTab } from "@/components/expense/ExpenseTabs";
import { VendorTable } from "@/components/expense/VendorTable";
import { EmptyExpenseState } from "@/components/expense/EmptyExpenseState";
import { Property } from "@/types/property";

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<ExpenseTab>("expenses");

  const [properties, setProperties] = useState<Property[]>([]);
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
      const [prpRes, expRes, catRes, venRes] = await Promise.all([
        apiFetch<Property[]>("/properties"),
        apiFetch<Expense[]>("/expenses"),
        apiFetch<ExpenseCategory[]>("/expense-categories"),
        apiFetch<Vendor[]>("/rental-vendors"),
      ]);

      setProperties(prpRes.data || []);
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

  // Helper getters to evaluate whether the current active tab list is empty
  const getActiveTabTotalCount = () => {
    if (activeTab === "expenses") return expenses.length;
    if (activeTab === "categories") return categories.length;
    return vendors.length;
  };

  const getFilteredCount = () => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return getActiveTabTotalCount();

    if (activeTab === "expenses") {
      return expenses.filter(
        (exp) =>
          exp.description?.toLowerCase().includes(term) ||
          exp.amount?.toString().includes(term),
      ).length;
    }

    if (activeTab === "categories") {
      return categories.filter(
        (cat) =>
          cat.name?.toLowerCase().includes(term) ||
          cat.code?.toLowerCase().includes(term),
      ).length;
    }

    return vendors.filter(
      (ven) =>
        ven.name?.toLowerCase().includes(term) ||
        ven.email?.toLowerCase().includes(term) ||
        ven.phone?.includes(term) ||
        ven.contact_person?.toLowerCase().includes(term),
    ).length;
  };

  const totalCount = getActiveTabTotalCount();
  const filteredCount = getFilteredCount();

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
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          {activeTab === "expenses" && "+ Record Expense"}
          {activeTab === "categories" && "+ Add Category"}
          {activeTab === "vendors" && "+ Add Vendor"}
        </button>
      </div>

      <ExpenseTabs
        activeTab={activeTab}
        expenses={expenses.length}
        categories={categories.length}
        vendors={vendors.length}
        onChange={(tab) => {
          setActiveTab(tab);
          setSearchTerm("");
        }}
      />

      {/* Controls Bar — render only when total records for the tab exist */}
      {totalCount > 0 && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Content Panels / Empty View Handlers */}
      <div>
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            Loading records...
          </div>
        ) : totalCount === 0 ? (
          /* Empty database state for active tab */
          <EmptyExpenseState activeTab={activeTab} onCreateNew={handleCreate} />
        ) : filteredCount === 0 ? (
          /* Search/Filter empty state */
          <EmptyExpenseState
            activeTab={activeTab}
            onCreateNew={handleCreate}
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm("")}
          />
        ) : (
          <>
            {activeTab === "expenses" && (
              <ExpenseTable
                expenses={expenses}
                searchTerm={searchTerm}
                onEdit={handleEditExpense}
              />
            )}
            {activeTab === "categories" && (
              <ExpenseCategoryTable
                categories={categories}
                searchTerm={searchTerm}
                onEdit={handleEditCategory}
              />
            )}
            {activeTab === "vendors" && (
              <VendorTable
                vendors={vendors}
                searchTerm={searchTerm}
                onEdit={handleEditVendor}
              />
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
        properties={properties}
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
