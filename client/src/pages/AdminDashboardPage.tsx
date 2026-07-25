import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { SearchBar } from "../components/SearchBar";
import { LeadTable, LeadItem } from "../components/LeadTable";
import { Footer } from "../components/Footer";
import { StatusType } from "../components/StatusBadge";
import {
  Zap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Users,
} from "lucide-react";

interface LeadsApiResponse {
  leads: LeadItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>(""); // "" for All
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const { data, isLoading, isFetching, refetch } = useQuery<LeadsApiResponse>({
    queryKey: ["leads", search, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await api.get(`/leads?${params.toString()}`);
      return res.data;
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusTabChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const statusTabs = [
    { label: "All Leads", value: "" },
    { label: "New", value: "New" },
    { label: "Contacted", value: "Contacted" },
    { label: "Closed", value: "Closed" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Admin Navbar */}
      <header className="w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-tight">
                LeadDesk Admin
              </h1>
              <p className="text-[11px] text-slate-400">Management & Pipeline Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden sm:inline-block text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleStatusTabChange(tab.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-3">
            <SearchBar value={search} onChange={handleSearchChange} />
            <button
              onClick={() => refetch()}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors shrink-0"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-brand-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Lead Summary Info */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" />
            <span>
              Total Leads: <strong className="text-slate-200">{data?.total || 0}</strong>
            </span>
          </div>
          {data && (
            <span>
              Page <strong className="text-slate-200">{data.page}</strong> of{" "}
              <strong className="text-slate-200">{data.totalPages}</strong>
            </span>
          )}
        </div>

        {/* Table Component */}
        <LeadTable leads={data?.leads || []} isLoading={isLoading} />

        {/* Pagination Control Bar */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                    pageNum === page
                      ? "bg-brand-600 text-white"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
