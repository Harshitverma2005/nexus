import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOpportunity, claimOpportunity, acceptClaim, addComment, closeOpportunity } from "../../lib/api";
import { ArrowLeft, Clock, MessageSquare, Send, TrendingUp, Users, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import { formatMoney } from "@/lib/mock-data";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { loadSessionMember } from "@/lib/session";
import { format } from "date-fns";

const roleStyles = (role: string) => {
  switch (role) {
    case "Admin": return { bg: "#EFF6FF", text: "#1E3A8A", border: "#DBEAFE" };
    case "Manager": return { bg: "#ECFDF5", text: "#059669", border: "#D1FAE5" };
    default: return { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" };
  }
};

function RoleBadge({ role }: { role: string }) {
  const styles = roleStyles(role);
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider" 
          style={{ background: styles.bg, color: styles.text, borderColor: styles.border }}>
      {role ?? "Member"}
    </span>
  );
}



export const Route = createFileRoute("/_app/opportunity/$id")({
  component: OppDetail,
});

function OppDetail() {
  const { id } = Route.useParams();
  const member = loadSessionMember();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [pitch, setPitch] = useState("");
  const [isClaimModalOpen, setClaimModalOpen] = useState(false);

  const { data: opp, isLoading, isError } = useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => getOpportunity(id),
  });

  const claimMutation = useMutation({
    mutationFn: (pitchText: string) => claimOpportunity({ opportunity: id, claimant: String(member?.id), pitch: pitchText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunity", id] });
      toast.success("Claim submitted", { description: "The submitter will review your pitch." });
      setClaimModalOpen(false);
      setPitch("");
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || "Failed to claim."),
  });

  const acceptMutation = useMutation({
    mutationFn: (claimId: string) => acceptClaim(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunity", id] });
      toast.success("Executor selected! Deal is now In Progress.");
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) => addComment({ opportunity: id, author: String(member?.id), text, source_url: sourceUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunity", id] });
      setComment("");
      setSourceUrl("");
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => closeOpportunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunity", id] });
      toast.success("Deal Closed & Points Distributed!", { description: "+50 pts to you and executor." });
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px] gap-3">
      <Loader2 className="size-6 animate-spin" style={{ color: "#0EA5E9" }} />
      <span style={{ color: "#475569" }}>Loading opportunity...</span>
    </div>
  );

  if (isError || !opp) return (
    <div className="p-10 text-center" style={{ color: "#EF4444" }}>Opportunity not found.</div>
  );

  const isSubmitter = member && String(opp.submitter) === String(member.id);
  const claimers = opp.opportunity_claims || [];
  const myClaim = claimers.find((c: any) => String(c.claimant) === String(member?.id));
  const executorId = opp.executor;

  const confidenceColor = opp.confidence === "High" ? "#059669" : opp.confidence === "Low" ? "#EF4444" : "#B45309";

  if (opp.status === "closed" || opp.status === "archived") {
    return (
      <div className="p-5 md:p-8 w-full max-w-3xl mx-auto flex flex-col min-h-[80vh] relative overflow-hidden">
        {/* Confetti cannons from 4 corners */}
        <div className="absolute inset-0 pointer-events-none z-0">
           {[
             { x: "0%", y: "0%", angle: 45 },
             { x: "100%", y: "0%", angle: 135 },
             { x: "0%", y: "100%", angle: -45 },
             { x: "100%", y: "100%", angle: -135 }
           ].map((pos, i) => (
             <div key={i} className="absolute" style={{ left: pos.x, top: pos.y }}>
                <AnimatePresence>
                  {[...Array(20)].map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                      animate={{ 
                        scale: [0, 1, 0.5, 0],
                        x: Math.cos(pos.angle * Math.PI / 180 + (Math.random() - 0.5) * 0.8) * (200 + Math.random() * 300),
                        y: Math.sin(pos.angle * Math.PI / 180 + (Math.random() - 0.5) * 0.8) * (200 + Math.random() * 300) + 100, // gravity
                        opacity: [1, 1, 0]
                      }}
                      transition={{ duration: 2.5, ease: "easeOut", delay: i * 0.2 + j * 0.05 }}
                      className="absolute size-2 rounded-sm"
                      style={{ 
                        background: ["#FFD700", "#FF6B6B", "#4DABF7", "#51CF66", "#FCC419"][j % 5],
                        transform: `rotate(${Math.random() * 360}deg)`
                      }}
                    />
                  ))}
                </AnimatePresence>
             </div>
           ))}
        </div>

        <Link
          to="/feed"
          className="self-start inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors z-10"
          style={{ color: "#475569" }}
        >
          <ArrowLeft className="size-4" /> Back to feed
        </Link>
        <div className="mt-8 z-10">
          <div className="bg-white border rounded-[24px] p-7 w-full shadow-sm hover:shadow-lg transition-shadow duration-200" style={{ borderColor: "#E2E8F0" }}>
            {/* Success banner */}
            <div className="flex items-center gap-3 rounded-2xl p-4 mb-6" style={{ background: "#ECFDF5", borderLeft: "4px solid #10B981" }}>
              <div className="size-7 rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ background: "#10B981" }}>✓</div>
              <div>
                <strong style={{ color: "#065F46" }}>Network Value Unlocked!</strong>
                <div className="text-sm" style={{ color: "#047857" }}>Deal closed successfully · Points awarded to executor & submitter</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex justify-between items-baseline mb-6">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Timeline</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "#F1F5F9", color: "#0F172A" }}>
                TBD → Defined
              </span>
            </div>

            {/* Steps */}
            <div className="flex justify-between mb-8 pb-2">
              {["Submitted", "Validated", "In Progress", "Closed"].map((s) => (
                <div key={s} className="text-center flex-1 text-xs font-semibold relative" style={{ color: "#1E3A8A" }}>
                  <div className="text-lg mb-1">●</div>
                  {s}
                </div>
              ))}
            </div>

            {/* Two Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">📋 Participants</div>
                 <div className="bg-slate-50 rounded-2xl p-3 space-y-0">
                    <div className="flex items-start gap-3 p-2 border-b border-slate-200">
                      <div className="size-7 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: "#EFF6FF", color: "#1E3A8A" }}>
                        {opp.submitter_details?.avatar || "S"}
                      </div>
                      <div>
                        <strong className="text-sm inline-flex items-center gap-2 text-slate-900">{opp.submitter_details?.name} <RoleBadge role={opp.submitter_details?.tier} /></strong>
                        <div className="text-xs text-slate-500">Submitter</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2">
                      <div className="size-7 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-50 text-emerald-700">
                        {opp.executor_details?.avatar || "E"}
                      </div>
                      <div>
                        <strong className="text-sm inline-flex items-center gap-2 text-slate-900">{opp.executor_details?.name} <RoleBadge role={opp.executor_details?.tier} /></strong>
                        <div className="text-xs text-emerald-600 font-medium">Executor</div>
                      </div>
                    </div>
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">🌐 Network Value</div>
                 <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center h-[calc(100%-1.75rem)] border border-slate-100">
                     <div className="text-sm italic text-slate-600 font-medium text-center">
                       "{opp.title}" fully executed and finalized in the network.
                     </div>
                 </div>
              </div>
            </div>

            <hr className="my-6 border-slate-200" />
            
            <div className="flex justify-between items-center sm:flex-row flex-col gap-3">
               <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Points Distributed</span>
               <div className="flex gap-2">
                 <span className="px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide" style={{ background: "#1E3A8A" }}>+50 pts Executor</span>
                 <span className="px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide" style={{ background: "#1E3A8A" }}>+50 pts Submitter</span>
               </div>
            </div>

            <div className="flex gap-3 mt-8 flex-wrap">
               <button className="px-5 py-2.5 rounded-full text-sm font-semibold bg-blue-900 text-white cursor-default ml-auto">✔️ Deal Closed (Done)</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      <Link
        to="/feed"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors"
        style={{ color: "#475569" }}
      >
        <ArrowLeft className="size-4" /> Back to feed
      </Link>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* ── Main Column ─────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Title Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border p-6" style={{ background: "#FFFFFF", borderColor: "#E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {/* Badge Row */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={opp.status} />
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "#334155" }}>{opp.category}</span>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{opp.type}</span>
                {opp.channel_details && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "#F5F3FF", color: "#6D28D9" }}>⬡ {opp.channel_details.title}</span>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: "#059669" }}>{formatMoney(opp.value)}</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: "#94A3B8" }}>Est. Value</div>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2" style={{ color: "#0F172A" }}>{opp.title}</h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#475569" }}>{opp.description}</p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Clock, label: "Timeline", value: opp.timeline === "Yes" ? "Defined" : "TBD", color: opp.timeline === "Yes" ? "#059669" : "#D97706" },
                { icon: TrendingUp, label: "Confidence", value: opp.confidence, color: confidenceColor },
                { icon: Users, label: "Decision", value: opp.decision_access === "Yes" ? "Direct" : "Indirect", color: "#1E3A8A" },
                { icon: MessageSquare, label: "Claims", value: `${claimers.length} active`, color: "#1E3A8A" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-lg p-3" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider mb-1" style={{ color: "#94A3B8" }}>
                    <Icon className="size-3" /> {label}
                  </div>
                  <div className="text-sm font-bold" style={{ color }}>{value || "—"}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Claims Section */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border p-5" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
            <h2 className="font-bold flex items-center gap-2 mb-4" style={{ color: "#0F172A" }}>
              <Users className="size-4" style={{ color: "#1E3A8A" }} />
              Claimants ({claimers.length})
            </h2>
            {claimers.length === 0 ? (
              <p className="text-sm" style={{ color: "#64748B" }}>No claims yet. Be the first to apply.</p>
            ) : (
              <div className="space-y-3">
                {claimers.map((c: any) => {
                  const m = c.claimant_details;
                  const isExecutor = executorId === m?.id;
                  return (
                    <div key={c.id} className="rounded-lg border p-4 space-y-2" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#EFF6FF", color: "#1E3A8A" }}>
                            {m?.avatar || m?.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: "#0F172A" }}>{m?.name}</div>
                            <div className="text-xs" style={{ color: "#64748B" }}>{m?.company} · {m?.score?.toLocaleString()} pts</div>
                          </div>
                        </div>
                        {isExecutor ? (
                          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "#D1FAE5", color: "#047857" }}>✓ Executor</span>
                        ) : isSubmitter && opp.status === "validated" ? (
                          <button
                            onClick={() => acceptMutation.mutate(c.id)}
                            disabled={acceptMutation.isPending}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            style={{ background: "#1E3A8A", color: "#FFFFFF" }}
                          >
                            {acceptMutation.isPending ? "Selecting..." : "Select Executor"}
                          </button>
                        ) : c.status === "rejected" ? (
                          <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "#FEF2F2", color: "#DC2626" }}>Not Selected</span>
                        ) : (
                          <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "#FEF3C7", color: "#B45309" }}>Pending</span>
                        )}
                      </div>
                      {c.pitch && (
                        <div className="text-sm italic rounded-lg p-3" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569" }}>
                          "{c.pitch}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Activity Log & Comments */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border p-5" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
            <h2 className="font-bold flex items-center gap-2 mb-4" style={{ color: "#0F172A" }}>
              <MessageSquare className="size-4" style={{ color: "#1E3A8A" }} />
              Deal Activity
            </h2>

            {/* Status Timeline */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto">
              {["pending", "validated", "in_progress", "archived"].map((s, i) => {
                const labels: Record<string, string> = { pending: "Submitted", validated: "Validated", in_progress: "In Progress", archived: "Closed" };
                const order = ["pending", "validated", "in_progress", "archived"];
                const done = order.indexOf(opp.status) >= i;
                return (
                  <div key={s} className="flex items-center gap-1 shrink-0">
                    <div className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all" style={{ background: done ? "#1E3A8A" : "#F1F5F9", color: done ? "#FFFFFF" : "#94A3B8" }}>{i + 1}</div>
                    <span className="text-[11px] hidden sm:block" style={{ color: done ? "#0F172A" : "#94A3B8" }}>{labels[s]}</span>
                    {i < 3 && <ChevronRight className="size-3 shrink-0" style={{ color: "#E2E8F0" }} />}
                  </div>
                );
              })}
            </div>

            {/* Comments List */}
            <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {(opp.comments_details || []).map((c: any) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  key={c.id} 
                  className="flex gap-3"
                >
                  <div className="size-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#EFF6FF", color: "#1E3A8A" }}>
                    {c.author_details?.avatar || c.author_details?.name?.[0] || "M"}
                  </div>
                  <div className="flex-1 rounded-2xl p-3" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: "#0F172A" }}>{c.author_details?.name}</span>
                        <RoleBadge role={c.author_details?.tier || "Member"} />
                      </div>
                      <span className="text-[10px]" style={{ color: "#94A3B8" }}>{format(new Date(c.created_at || c.at), "MMM d, HH:mm")}</span>
                    </div>
                    <p className="text-sm" style={{ color: "#475569" }}>{c.text}</p>
                    {c.source_url && (
                       <a href={c.source_url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline mt-2 inline-block bg-blue-50 px-2 py-1 rounded">
                          🔗 View Source of Truth
                       </a>
                    )}
                  </div>
                </motion.div>
              ))}
              {(opp.comments_details || []).length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="size-8 mx-auto text-slate-200 mb-2" />
                  <p className="text-sm" style={{ color: "#94A3B8" }}>No comments yet. Start the conversation.</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            {member && (
              <div className="flex flex-col gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment or update..."
                  className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                  style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#0F172A" }}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#0EA5E9"; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E2E8F0"; }}
                  disabled={commentMutation.isPending}
                />
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2.5 text-sm rounded-lg border flex items-center gap-2" style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#0F172A" }}>
                    <span className="text-slate-400">🔗</span>
                    <input
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="Source of truth URL (optional, e.g. Google Drive/Docs)"
                      className="flex-1 bg-transparent border-none outline-none"
                      disabled={commentMutation.isPending}
                      onKeyDown={(e) => { if (e.key === "Enter" && comment) commentMutation.mutate(comment); }}
                    />
                  </div>
                  <button
                    onClick={() => { if (comment) commentMutation.mutate(comment); }}
                    disabled={commentMutation.isPending || !comment}
                    className="size-11 rounded-lg flex items-center justify-center disabled:opacity-50"
                    style={{ background: "#1E3A8A" }}
                  >
                    <Send className="size-4 text-white" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="space-y-4">
          {/* Submitter Card */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border p-4" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8" }}>Submitted by</div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full flex items-center justify-center font-bold" style={{ background: "#EFF6FF", color: "#1E3A8A" }}>
                {opp.submitter_details?.avatar || opp.submitter_details?.name?.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: "#0F172A" }}>{opp.submitter_details?.name}</div>
                <div className="text-xs" style={{ color: "#64748B" }}>{opp.submitter_details?.company}</div>
                <div className="text-xs font-bold" style={{ color: "#1E3A8A" }}>{opp.submitter_details?.score?.toLocaleString()} pts</div>
              </div>
            </div>
          </motion.div>

          {/* Action Card */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border p-4 space-y-3" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>Action</div>

            {opp.status === "validated" && !isSubmitter && !myClaim && member?.tier !== "Admin" && (
              <button
                onClick={() => setClaimModalOpen(true)}
                className="w-full py-3 rounded-lg font-semibold text-sm transition-colors"
                style={{ background: "#1E3A8A", color: "#FFFFFF" }}
              >
                Claim this Opportunity
              </button>
            )}

            {myClaim && (
              <div className="w-full py-3 rounded-lg border text-center text-sm font-medium" style={{ background: "#F8FAFC", borderColor: "#E2E8F0", color: "#475569" }}>
                {myClaim.status === "pending" ? "✓ Application Submitted" : myClaim.status === "accepted" ? "🎯 You are the Executor!" : "✗ Not Selected"}
              </div>
            )}

            {opp.status === "in_progress" && isSubmitter && (
              <button
                onClick={() => closeMutation.mutate()}
                disabled={closeMutation.isPending}
                className="w-full py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
                style={{ background: "#D1FAE5", border: "1px solid #10B981", color: "#047857" }}
              >
                {closeMutation.isPending ? "Closing..." : "✓ Mark Deal as Closed"}
              </button>
            )}

            {(opp.status === "pending") && (
              <div className="p-3 rounded-lg text-sm text-center font-medium" style={{ background: "#FEF3C7", color: "#B45309" }}>
                ⏳ Awaiting Admin Validation
              </div>
            )}

            {opp.status === "rejected" && (
              <div className="p-3 rounded-lg text-sm text-center font-medium" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                ✗ This opportunity was rejected
              </div>
            )}

            {(opp.status === "archived" || opp.status === "closed") && (
              <div className="p-3 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2" style={{ background: "#D1FAE5", color: "#047857" }}>
                <CheckCircle2 className="size-4" /> Deal Closed
              </div>
            )}
          </motion.div>

          {/* Executor card if selected */}
          {opp.executor_details && (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border p-4" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8" }}>Executor</div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full flex items-center justify-center font-bold" style={{ background: "#D1FAE5", color: "#047857" }}>
                  {opp.executor_details?.avatar || opp.executor_details?.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "#0F172A" }}>{opp.executor_details?.name}</div>
                  <div className="text-xs font-medium" style={{ color: "#059669" }}>Active Executor</div>
                </div>
              </div>
            </motion.div>
          )}
        </aside>
      </div>

      {/* Claim Modal */}
      <AnimatePresence>
        {isClaimModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
              onClick={() => setClaimModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 rounded-2xl border p-6"
              style={{ background: "#FFFFFF", borderColor: "#E2E8F0", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
            >
              <h2 className="text-xl font-bold mb-1" style={{ color: "#0F172A" }}>Claim Opportunity</h2>
              <p className="text-sm mb-5" style={{ color: "#475569" }}>Write a short pitch explaining why you're the best person to execute this deal.</p>

              <textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="I have direct contacts who can close this in 30 days..."
                rows={4}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none mb-4"
                style={{ borderColor: "#E2E8F0", color: "#0F172A", resize: "none" }}
                onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#0EA5E9"; }}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#E2E8F0"; }}
              />

              <div className="flex gap-3 justify-end">
                <button onClick={() => setClaimModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: "#E2E8F0", color: "#475569" }}>
                  Cancel
                </button>
                <button
                  onClick={() => { if (!pitch) return toast.error("Pitch is required."); claimMutation.mutate(pitch); }}
                  disabled={claimMutation.isPending || !pitch}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ background: "#1E3A8A", color: "#FFFFFF" }}
                >
                  {claimMutation.isPending ? "Submitting..." : "Submit Pitch"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
