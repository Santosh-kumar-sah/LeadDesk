import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { StatusBadge, StatusType } from "./StatusBadge";
import { ChevronDown, ChevronUp, Mail, DollarSign, Calendar, MessageSquare, Loader2 } from "lucide-react";

export interface LeadItem {
  _id: string;
  name: string;
  email: string;
  budgetRange: string;
  message: string;
  status: StatusType;
  createdAt: string;
}

interface LeadTableProps {
  leads: LeadItem[];
  isLoading: boolean;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, isLoading }) => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusMutation = useMutation<
    any,
    Error,
    { id: string; status: StatusType },
    { previousData?: any }
  >({
    mutationFn: async ({ id, status }) => {
      const res = await api.patch(`/leads/${id}/status`, { status });
      return res.data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["leads"] });
      const previousData = queryClient.getQueryData(["leads"]);

      queryClient.setQueriesData({ queryKey: ["leads"] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          leads: old.leads.map((l: LeadItem) =>
            l._id === id ? { ...l, status } : l
          ),
        };
      });

      return { previousData };
    },
    onError: (_err: unknown, _variables: unknown, context: { previousData?: any } | undefined) => {
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: ["leads"] }, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatBudget = (range: string) => {
    switch (range) {
      case "<1k":
        return "Under ₹50k";
      case "1k-5k":
        return "₹50k - ₹2L";
      case "5k-20k":
        return "₹2L - ₹10L";
      case "20k+":
        return "₹10L+";
      default:
        return range;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-3" />
        <p className="text-xs font-medium">Fetching lead database...</p>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="w-full py-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-200">No leads found</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No records match your search criteria or filter status.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-xl">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Lead Name</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Budget</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date Submitted</th>
              <th className="py-3.5 px-4">Message</th>
              <th className="py-3.5 px-4 text-right">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {leads.map((lead) => {
              const isExpanded = expandedId === lead._id;
              const isMessageLong = lead.message.length > 60;
              const truncatedMsg = isMessageLong
                ? `${lead.message.substring(0, 60)}...`
                : lead.message;

              return (
                <tr key={lead._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-semibold text-slate-100 whitespace-nowrap">
                    {lead.name}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{lead.email}</span>
                    </a>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[11px]">
                      {formatBudget(lead.budgetRange)}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <p className="text-slate-300 leading-relaxed">
                      {isExpanded ? lead.message : truncatedMsg}
                    </p>
                    {isMessageLong && (
                      <button
                        onClick={() => toggleExpand(lead._id)}
                        className="text-brand-400 hover:text-brand-300 text-[11px] font-medium mt-1 flex items-center gap-0.5"
                      >
                        {isExpanded ? (
                          <>
                            Show Less <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Read Full Message <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        statusMutation.mutate({
                          id: lead._id,
                          status: e.target.value as StatusType,
                        })
                      }
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 font-medium cursor-pointer"
                    >
                      <option value="New" className="bg-slate-900 text-slate-200">New</option>
                      <option value="Contacted" className="bg-slate-900 text-slate-200">Contacted</option>
                      <option value="Closed" className="bg-slate-900 text-slate-200">Closed</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="block md:hidden divide-y divide-slate-800">
        {leads.map((lead) => {
          const isExpanded = expandedId === lead._id;
          const isMessageLong = lead.message.length > 80;
          const truncatedMsg = isMessageLong
            ? `${lead.message.substring(0, 80)}...`
            : lead.message;

          return (
            <div key={lead._id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{lead.name}</h4>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-xs text-brand-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{lead.email}</span>
                  </a>
                </div>
                <StatusBadge status={lead.status} />
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  {formatBudget(lead.budgetRange)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(lead.createdAt)}
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                {isExpanded ? lead.message : truncatedMsg}
                {isMessageLong && (
                  <button
                    onClick={() => toggleExpand(lead._id)}
                    className="text-brand-400 hover:text-brand-300 block font-medium mt-1.5"
                  >
                    {isExpanded ? "Collapse" : "Expand"}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                <select
                  value={lead.status}
                  onChange={(e) =>
                    statusMutation.mutate({
                      id: lead._id,
                      status: e.target.value as StatusType,
                    })
                  }
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
