import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOpportunities, getMembers, suspendMember, updateOpportunityStatus, removeClaim, getChannels } from "../../lib/api";
import axios from "axios";
import { RESOLVED_API_BASE } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { StatusBadge } from "../../components/StatusBadge";
import { toast } from "sonner";
import { Shield, Check, X, Users, Loader2, AlertTriangle, Power } from "lucide-react";
import { formatMoney } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"queue" | "active" | "members">("queue");
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  // Queries
  const { data: pendingData, isLoading: loadingPending } = useQuery({
    queryKey: ["admin-pending"],
    queryFn: () => getOpportunities({ status: "pending", page_size: 50 }),
  });

  const { data: activeData, isLoading: loadingActive } = useQuery({
    queryKey: ["admin-active"],
    queryFn: () => getOpportunities({ status: "in_progress", page_size: 50 }),
    enabled: activeTab === "active",
  });

  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ["admin-members"],
    queryFn: () => getMembers({ ordering: "-score", page_size: 100 }),
    enabled: activeTab === "members",
  });

  // Mutations
  const validateMutation = useMutation({
    mutationFn: async ({ id, action, feedback }: { id: string; action: string; feedback: string }) => {
      const res = await axios.post(`${RESOLVED_API_BASE}/opportunities/${id}/validate/`, { action, feedback });
      return res.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending"] });
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      toast.success(vars.action === "approve" ? "Opportunity Approved!" : "Opportunity Rejected", { description: "Feed updated." });
    },
  });

  const forceCloseMutation = useMutation({
    mutationFn: async (id: string) => updateOpportunityStatus(id, "archived"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-active"] });
      toast.success("Deal force-closed by admin.");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (id: string) => suspendMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      toast.success("Member suspended (moved to Member).");
    },
  });

  const memberStr = localStorage.getItem("member");
  const member = memberStr ? JSON.parse(memberStr) : null;

  const { data: channelsData } = useQuery({
    queryKey: ["admin-channels"],
    queryFn: () => getChannels(),
  });
  const allChannels = Array.isArray(channelsData) ? channelsData : (channelsData?.results || []);

  const rawPending = pendingData?.results || [];
  const pending = rawPending.filter((opp: any) => {
    if (!opp.channel && !opp.channel_details) return member?.tier === "Admin"; 
    if (!member?.id) return false;

    const channelObj = allChannels.find((c: any) => String(c.id) === String(opp.channel) || String(c.id) === String(opp.channel_details?.id));
    
    return String(opp.channel_details?.admin) === String(member.id) || 
           String(opp.channel_details?.admin_details?.id) === String(member.id) || 
           String(channelObj?.admin) === String(member.id) || 
           String(channelObj?.admin_details?.id) === String(member.id);
  });

  const rawActive = activeData?.results || [];
  const active = rawActive.filter((opp: any) => {
    if (!opp.channel && !opp.channel_details) return member?.tier === "Admin"; 
    if (!member?.id) return false;

    const channelObj = allChannels.find((c: any) => String(c.id) === String(opp.channel) || String(c.id) === String(opp.channel_details?.id));
    
    return String(opp.channel_details?.admin) === String(member.id) || 
           String(opp.channel_details?.admin_details?.id) === String(member.id) || 
           String(channelObj?.admin) === String(member.id) || 
           String(channelObj?.admin_details?.id) === String(member.id);
  });

  const members = membersData?.results || Array.isArray(membersData) ? (Array.isArray(membersData) ? membersData : []) : [];

  const tabs = [
    { id: "queue", label: "Validation Queue", count: pending.length },
    { id: "active", label: "Active Deals" },
    { id: "members", label: "Member Management" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)" }}>
            <Shield className="size-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#0F172A" }}>Admin Dashboard</h1>
        </div>
        <p className="text-sm ml-13" style={{ color: "#475569" }}>
          Review submissions, manage active deals, and oversee members.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-6 border-b" style={{ borderColor: "#E2E8F0" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all relative"
            style={{ color: activeTab === t.id ? "#1E3A8A" : "#64748B" }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#B45309" }}>{t.count}</span>
            )}
            {activeTab === t.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "#1E3A8A" }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Validation Queue ───────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "queue" && (
          <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loadingPending ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-8 animate-spin" style={{ color: "#0EA5E9" }} />
              </div>
            ) : pending.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center rounded-xl border" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
                <div className="size-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#D1FAE5" }}>
                  <Check className="size-7" style={{ color: "#059669" }} />
                </div>
                <h2 className="text-lg font-bold mb-1" style={{ color: "#0F172A" }}>Validation Queue Clear</h2>
                <p className="text-sm" style={{ color: "#475569" }}>All submitted opportunities have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((opp: any, idx: number) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="rounded-xl border p-5 flex flex-col md:flex-row md:items-start gap-4"
                    style={{ background: "#FFFFFF", borderColor: "#E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#B45309" }}>Awaiting Review</span>
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "#334155" }}>{opp.category}</span>
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "#334155" }}>{opp.type}</span>
                        {opp.channel && <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "#F5F3FF", color: "#6D28D9" }}>Syndicate</span>}
                      </div>
                      <h3 className="text-base font-bold mb-1" style={{ color: "#0F172A" }}>{opp.title}</h3>
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: "#475569" }}>{opp.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {[
                          { label: "Value", value: formatMoney(opp.value), color: "#059669" },
                          { label: "Confidence", value: opp.confidence, color: "#0F172A" },
                          { label: "Type", value: opp.type, color: "#0F172A" },
                          { label: "Submitter", value: opp.submitter_details?.name || "Unknown", color: "#1E3A8A" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="rounded-lg p-2.5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                            <div style={{ color: "#94A3B8", marginBottom: 2 }}>{label}</div>
                            <div className="font-semibold" style={{ color }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-56 shrink-0">
                      <textarea
                        placeholder="Admin feedback (optional for approve, recommended for reject)..."
                        className="w-full rounded-lg p-2.5 text-sm outline-none border"
                        style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#0F172A", minHeight: 80, resize: "vertical" }}
                        value={feedbackMap[opp.id] || ""}
                        onChange={(e) => setFeedbackMap((p) => ({ ...p, [opp.id]: e.target.value }))}
                        onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#0EA5E9"; }}
                        onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E2E8F0"; }}
                        disabled={validateMutation.isPending}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => validateMutation.mutate({ id: opp.id, action: "reject", feedback: feedbackMap[opp.id] || "" })}
                          disabled={validateMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
                        >
                          <X className="size-3.5" /> Reject
                        </button>
                        <button
                          onClick={() => validateMutation.mutate({ id: opp.id, action: "approve", feedback: feedbackMap[opp.id] || "" })}
                          disabled={validateMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          style={{ background: "#1E3A8A", color: "#FFFFFF" }}
                        >
                          <Check className="size-3.5" /> Approve
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Active Deals (Force-Close / SLA) ─────────────────── */}
        {activeTab === "active" && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loadingActive ? (
              <div className="flex justify-center py-16"><Loader2 className="size-8 animate-spin" style={{ color: "#0EA5E9" }} /></div>
            ) : active.length === 0 ? (
              <div className="py-16 text-center rounded-xl border" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
                <p className="font-semibold" style={{ color: "#0F172A" }}>No active deals</p>
                <p className="text-sm mt-1" style={{ color: "#475569" }}>All deals are resolved or pending validation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {active.map((opp: any, idx: number) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                    className="rounded-xl border p-5 flex items-start justify-between gap-4"
                    style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={opp.status} />
                        <span className="text-[11px]" style={{ color: "#94A3B8" }}>{opp.category}</span>
                      </div>
                      <h3 className="font-semibold text-sm mb-0.5" style={{ color: "#0F172A" }}>{opp.title}</h3>
                      <div className="text-xs" style={{ color: "#64748B" }}>
                        Submitter: <strong>{opp.submitter_details?.name}</strong>
                        {opp.executor_details && <> · Executor: <strong>{opp.executor_details?.name}</strong></>}
                        · Value: <strong style={{ color: "#059669" }}>{formatMoney(opp.value)}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => { if (confirm(`Force-close "${opp.title}"?`)) forceCloseMutation.mutate(opp.id); }}
                      disabled={forceCloseMutation.isPending}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
                    >
                      <AlertTriangle className="size-3.5" /> Force Close
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Member Management ─────────────────────────────────── */}
        {activeTab === "members" && (
          <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loadingMembers ? (
              <div className="flex justify-center py-16"><Loader2 className="size-8 animate-spin" style={{ color: "#0EA5E9" }} /></div>
            ) : (
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#E2E8F0" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>Member</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: "#475569" }}>Tier</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: "#475569" }}>Score</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: "#475569" }}>Deals</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(membersData) ? membersData : (membersData?.results || [])).map((m: any) => (
                      <tr key={m.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#EFF6FF", color: "#1E3A8A" }}>
                              {m.avatar || m.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold" style={{ color: "#0F172A" }}>{m.name}</div>
                              <div className="text-xs" style={{ color: "#94A3B8" }}>{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{
                              background: m.tier === "Trusted" ? "#D1FAE5" : m.tier === "Active" ? "#EFF6FF" : "#FEF3C7",
                              color: m.tier === "Trusted" ? "#047857" : m.tier === "Active" ? "#1E3A8A" : "#B45309",
                            }}>
                            {m.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell font-semibold" style={{ color: "#1E3A8A" }}>{m.score?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center hidden md:table-cell" style={{ color: "#475569" }}>{m.deals_closed}</td>
                        <td className="px-4 py-3 text-right">
                          {m.tier !== "Member" ? (
                            <button
                              onClick={() => { if (confirm(`Suspend ${m.name}?`)) suspendMutation.mutate(m.id); }}
                              disabled={suspendMutation.isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50"
                              style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
                            >
                              <Power className="size-3" /> Suspend
                            </button>
                          ) : (
                            <span className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: "#FEF3C7", color: "#B45309" }}>Member</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
