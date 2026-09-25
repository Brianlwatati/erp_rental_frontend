"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api_client";
import { Property, Building, Unit } from "@/types/property";
import { Tenant } from "@/types/tenant";
import { Expense, Vendor } from "@/types/expense";
import { MaintenanceCostModal } from "@/components/maintenance/MaintenanceCostModal";
import { MaintenanceRequestModal } from "@/components/maintenance/MaintenanceRequestModal";

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  unit_id?: string;
  tenant_id?: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  reported_at: string;
  resolved_at?: string;
  assigned_vendor_id?: string;
  created_at: string;
}

export interface MaintenanceCost {
  id: string;
  maintenance_request_id: string;
  vendor_id?: string;
  description: string;
  amount: number;
  expense_id?: string;
  created_at: string;
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MaintenanceRequest | null>(null);
  const [selectedCostRequest, setSelectedCostRequest] =
    useState<MaintenanceRequest | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [
        requestRes,
        propertyRes,
        buildingRes,
        tenantRes,
        vendorRes,
        expenseRes,
      ] = await Promise.all([
        apiFetch<MaintenanceRequest[]>("/maintenance-requests"),
        apiFetch<Property[]>("/properties"),
        apiFetch<Building[]>("/buildings/all").catch(() => ({ data: [] })),
        apiFetch<Tenant[]>("/tenants"),
        apiFetch<Vendor[]>("/rental-vendors"),
        apiFetch<Expense[]>("/expenses"),
      ]);

      setRequests(requestRes.data || []);
      setProperties(propertyRes.data || []);
      setBuildings(buildingRes.data || []);
      setTenants(tenantRes.data || []);
      setVendors(vendorRes.data || []);
      setExpenses(expenseRes.data || []);
    } catch (err) {
      console.error("Failed to fetch maintenance requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openNewRequest = () => {
    setSelectedRequest(null);
    setIsRequestModalOpen(true);
  };

  const openEditRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setIsRequestModalOpen(true);
  };

  const openCostModal = (request: MaintenanceRequest) => {
    setSelectedCostRequest(request);
    setIsCostModalOpen(true);
  };

  const propertyOptions = properties.map((property) => ({
    id: property.id,
    name: property.name,
  }));
  const buildingOptions = buildings.map((building) => ({
    id: building.id,
    name: building.name,
  }));
  const unitOptions = units.map((unit) => ({
    id: unit.id,
    name: unit.unit_number,
  }));
  const tenantOptions = tenants.map((tenant) => ({
    id: tenant.id,
    name: `${tenant.first_name} ${tenant.last_name}`,
  }));
  const vendorOptions = vendors.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
  }));
  const expenseOptions = expenses.map((expense) => ({
    id: expense.id,
    name: `${expense.expenseNumber} - ${expense.description}`,
  }));

  const requestForModal = selectedRequest
    ? {
        id: selectedRequest.id,
        propertyId: selectedRequest.property_id,
        unitId: selectedRequest.unit_id,
        tenantId: selectedRequest.tenant_id,
        title: selectedRequest.title,
        description: selectedRequest.description,
        priority: selectedRequest.priority,
      }
    : null;

  const getPriorityBadge = (priority: MaintenanceRequest["priority"]) => {
    const styles = {
      LOW: "bg-slate-100 text-slate-700 border-slate-200",
      MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
      HIGH: "bg-amber-50 text-amber-700 border-amber-200",
      URGENT: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
    };
    return (
      <span
        className={`px-2 py-0.5 text-[10px] rounded-full border ${styles[priority]}`}
      >
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: MaintenanceRequest["status"]) => {
    const styles = {
      OPEN: "bg-amber-50 text-amber-700 border-amber-200",
      ASSIGNED: "bg-purple-50 text-purple-700 border-purple-200",
      IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
      COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
    };
    return (
      <span
        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${styles[status]}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchesPriority =
      priorityFilter === "ALL" || req.priority === priorityFilter;
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.description &&
        req.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="p-0 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Maintenance Management
          </h1>
          <p className="text-xs text-slate-500">
            Track work orders, vendor assignments, and maintenance costs.
          </p>
        </div>
        <button
          onClick={openNewRequest}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          + New Maintenance Request
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Search by title or details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
        />

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No maintenance requests found.
          </div>
        ) : (
          <table className="w-full min-w-170 text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Title & Description</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Reported At</th>
                <th className="p-3">Resolved At</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3 max-w-xs">
                    <div className="font-semibold text-slate-900">
                      {req.title}
                    </div>
                    {req.description && (
                      <div className="text-[11px] text-slate-500 truncate">
                        {req.description}
                      </div>
                    )}
                  </td>
                  <td className="p-3">{getPriorityBadge(req.priority)}</td>
                  <td className="p-3">{getStatusBadge(req.status)}</td>
                  <td className="p-3">
                    {new Date(req.reported_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    {req.resolved_at
                      ? new Date(req.resolved_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => openCostModal(req)}
                      className="text-emerald-600 hover:text-emerald-800 font-semibold text-xs"
                    >
                      + Add Cost
                    </button>
                    <button
                      onClick={() => openEditRequest(req)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <MaintenanceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={fetchRequests}
        request={requestForModal}
        properties={propertyOptions}
        units={unitOptions}
        tenants={tenantOptions}
      />
      <MaintenanceCostModal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        onSuccess={fetchRequests}
        requestId={selectedCostRequest?.id || ""}
        requestTitle={selectedCostRequest?.title}
        vendors={vendorOptions}
        expenses={expenseOptions}
      />
    </div>
  );
}
