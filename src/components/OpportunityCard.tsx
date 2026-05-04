import { Link } from "@tanstack/react-router";
import { formatMoney } from "@/lib/mock-data";
import { StatusBadge } from "./StatusBadge";
import { motion } from "framer-motion";

const categoryBadge = (cat: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    SaaS:          { bg: "#EFF6FF", text: "#1D4ED8" },
    Fintech:       { bg: "#F0F9FF", text: "#0369A1" },
    D2C:           { bg: "#F0FDFA", text: "#0F766E" },
    Enterprise:    { bg: "#F5F3FF", text: "#6D28D9" },
    Marketing:     { bg: "#FFF7ED", text: "#C2410C" },
    Consulting:    { bg: "#F8FAFC", text: "#475569" },
    IT:            { bg: "#EFF6FF", text: "#1E3A8A" },
    Manufacturing: { bg: "#FAFAF9", text: "#57534E" },
  };
  return map[cat] || { bg: "#F1F5F9", text: "#475569" };
};

export function OpportunityCard({ opp, index = 0 }: { opp: any; index?: number }) {
  const submitter = opp.submitter_details;
  const channel = opp.channel_details;
  const catStyle = categoryBadge(opp.category);

  const confidenceColor = opp.confidence === "High"
    ? "#059669"
    : opp.confidence === "Low"
    ? "#EF4444"
    : "#B45309";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Link to="/opportunity/$id" params={{ id: opp.id.toString() }} className="block group">
        <div
          className="transition-all duration-200"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "#CBD5E1";
            el.style.boxShadow = "0 8px 20px -4px rgba(0,0,0,0.08)";
            el.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "#E2E8F0";
            el.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
            el.style.transform = "translateY(0)";
          }}
        >
          {/* ── Badge Row ────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-3">
            <StatusBadge status={opp.status} />
            <div className="flex items-center gap-1.5">
              {channel && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#F5F3FF", color: "#6D28D9" }}>
                  ⬡ {channel.title}
                </span>
              )}
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: catStyle.bg, color: catStyle.text }}>
                {opp.category}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "#475569" }}>
                {opp.type}
              </span>
            </div>
          </div>

          {/* ── Title ────────────────────────────────────────── */}
          <h3
            className="font-semibold mb-1.5 line-clamp-1 group-hover:text-[#1E3A8A] transition-colors"
            style={{ fontSize: 16, lineHeight: "24px", color: "#0F172A" }}
          >
            {opp.title}
          </h3>

          {/* ── Description ──────────────────────────────────── */}
          <p
            className="line-clamp-2"
            style={{ fontSize: 13, lineHeight: "20px", color: "#475569" }}
          >
            {opp.description || "No description provided."}
          </p>

          {/* ── Divider ──────────────────────────────────────── */}
          <hr className="my-3" style={{ borderColor: "#F1F5F9" }} />

          {/* ── User Row ────────────────────────────────────────── */}
          <div className="flex items-center gap-2 mb-4">
            <Link 
              to="/profile/$id" 
              params={{ id: String(submitter?.id || "") }} 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div
                className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)" }}
              >
                {submitter?.avatar || (submitter?.name?.[0] || "?")}
              </div>
              <span className="flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>
                {submitter?.name || "Unknown"}
                <span className="text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold" 
                      style={{ 
                        background: submitter?.tier === "Admin" ? "#EFF6FF" : submitter?.tier === "Manager" ? "#ECFDF5" : "#F8FAFC",
                        color: submitter?.tier === "Admin" ? "#1E3A8A" : submitter?.tier === "Manager" ? "#059669" : "#64748B",
                        borderColor: submitter?.tier === "Admin" ? "#DBEAFE" : submitter?.tier === "Manager" ? "#D1FAE5" : "#E2E8F0"
                      }}>
                  {submitter?.tier || "Member"}
                </span>
              </span>
            </Link>
            <span className="ml-auto" style={{ fontSize: 13, fontWeight: 700, color: "#1E3A8A" }}>
              {submitter?.score?.toLocaleString() || "0"} pts
            </span>
          </div>

          {/* ── Metrics Grid (4 Cols) ─────────────────────────── */}
          <div className="grid grid-cols-4 gap-2 text-center group-hover:scale-[1.02] transition-transform duration-200">
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", marginBottom: 2 }}>Confidence</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: confidenceColor }}>
                {opp.confidence}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", marginBottom: 2 }}>Timeline</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: opp.timeline === "Yes" ? "#059669" : "#D97706" }}>
                {opp.timeline === "Yes" ? "Defined" : "TBD"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", marginBottom: 2 }}>Est. Value</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>
                {formatMoney(opp.value)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", marginBottom: 2 }}>Claims</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>
                {opp.opportunity_claims?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
