import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { f as formatMoney } from "./mock-data-BQtN9d9M.js";
import { S as StatusBadge } from "./StatusBadge-CDYb_O5T.js";
import { motion } from "framer-motion";
const categoryBadge = (cat) => {
  const map = {
    SaaS: { bg: "#EFF6FF", text: "#1D4ED8" },
    Fintech: { bg: "#F0F9FF", text: "#0369A1" },
    D2C: { bg: "#F0FDFA", text: "#0F766E" },
    Enterprise: { bg: "#F5F3FF", text: "#6D28D9" },
    Marketing: { bg: "#FFF7ED", text: "#C2410C" },
    Consulting: { bg: "#F8FAFC", text: "#475569" },
    IT: { bg: "#EFF6FF", text: "#1E3A8A" },
    Manufacturing: { bg: "#FAFAF9", text: "#57534E" }
  };
  return map[cat] || { bg: "#F1F5F9", text: "#475569" };
};
function OpportunityCard({ opp, index = 0 }) {
  const submitter = opp.submitter_details;
  const channel = opp.channel_details;
  const catStyle = categoryBadge(opp.category);
  const confidenceColor = opp.confidence === "High" ? "#059669" : opp.confidence === "Low" ? "#EF4444" : "#B45309";
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: index * 0.04, duration: 0.25 },
      children: /* @__PURE__ */ jsx(Link, { to: "/opportunity/$id", params: { id: opp.id.toString() }, className: "block group", children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "transition-all duration-200",
          style: {
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
          },
          onMouseEnter: (e) => {
            const el = e.currentTarget;
            el.style.borderColor = "#CBD5E1";
            el.style.boxShadow = "0 8px 20px -4px rgba(0,0,0,0.08)";
            el.style.transform = "translateY(-2px)";
          },
          onMouseLeave: (e) => {
            const el = e.currentTarget;
            el.style.borderColor = "#E2E8F0";
            el.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
            el.style.transform = "translateY(0)";
          },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsx(StatusBadge, { status: opp.status }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                channel && /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-medium px-2 py-0.5 rounded-full", style: { background: "#F5F3FF", color: "#6D28D9" }, children: [
                  "⬡ ",
                  channel.title
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium px-2 py-0.5 rounded-full", style: { background: catStyle.bg, color: catStyle.text }, children: opp.category }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium px-2 py-0.5 rounded-full", style: { background: "#F1F5F9", color: "#475569" }, children: opp.type })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "h3",
              {
                className: "font-semibold mb-1.5 line-clamp-1 group-hover:text-[#1E3A8A] transition-colors",
                style: { fontSize: 16, lineHeight: "24px", color: "#0F172A" },
                children: opp.title
              }
            ),
            /* @__PURE__ */ jsx(
              "p",
              {
                className: "line-clamp-2",
                style: { fontSize: 13, lineHeight: "20px", color: "#475569" },
                children: opp.description || "No description provided."
              }
            ),
            /* @__PURE__ */ jsx("hr", { className: "my-3", style: { borderColor: "#F1F5F9" } }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                  style: { background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)" },
                  children: submitter?.avatar || "?"
                }
              ),
              /* @__PURE__ */ jsx("span", { style: { fontSize: 13, fontWeight: 500, color: "#334155" }, children: submitter?.name || "Unknown" }),
              /* @__PURE__ */ jsxs("span", { style: { fontSize: 13, fontWeight: 700, color: "#1E3A8A" }, children: [
                submitter?.score?.toLocaleString() || "0",
                " pts"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-2 text-center group-hover:scale-[1.02] transition-transform duration-200", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, fontWeight: 500, color: "#94A3B8", marginBottom: 2 }, children: "Confidence" }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 700, color: confidenceColor }, children: opp.confidence })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, fontWeight: 500, color: "#94A3B8", marginBottom: 2 }, children: "Timeline" }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 700, color: opp.timeline === "Yes" ? "#059669" : "#D97706" }, children: opp.timeline === "Yes" ? "Defined" : "TBD" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, fontWeight: 500, color: "#94A3B8", marginBottom: 2 }, children: "Est. Value" }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 700, color: "#059669" }, children: formatMoney(opp.value) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, fontWeight: 500, color: "#94A3B8", marginBottom: 2 }, children: "Cont." }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 700, color: "#334155" }, children: opp.contribution || "80%" })
              ] })
            ] })
          ]
        }
      ) })
    }
  );
}
export {
  OpportunityCard as O
};
