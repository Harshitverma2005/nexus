import { jsxs, jsx } from "react/jsx-runtime";
const statusConfig = {
  validated: { label: "Validated", bg: "#D1FAE5", text: "#047857", dot: "#10B981" },
  in_progress: { label: "In Progress", bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  pending: { label: "Pending Validation", bg: "#FEF3C7", text: "#B45309", dot: "#F59E0B" },
  closed: { label: "Deal Closed", bg: "#F0FDF4", text: "#166534", dot: "#22C55E" },
  rejected: { label: "Rejected", bg: "#FEF2F2", text: "#DC2626", dot: "#EF4444" },
  dropped: { label: "Dropped", bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  archived: { label: "Archived", bg: "#F8FAFC", text: "#64748B", dot: "#94A3B8" }
};
function StatusBadge({ status }) {
  const cfg = statusConfig[status] ?? {
    label: status,
    bg: "#F1F5F9",
    text: "#475569",
    dot: "#94A3B8"
  };
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
      style: { background: cfg.bg, color: cfg.text },
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "size-1.5 rounded-full",
            style: { background: cfg.dot }
          }
        ),
        cfg.label
      ]
    }
  );
}
export {
  StatusBadge as S
};
