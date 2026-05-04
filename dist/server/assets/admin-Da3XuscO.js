import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { c as getOpportunities, a as getMembers, R as RESOLVED_API_BASE, u as updateOpportunityStatus, e as suspendMember } from "./api-CCXKq01o.js";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { S as StatusBadge } from "./StatusBadge-CDYb_O5T.js";
import { toast } from "sonner";
import { Shield, Loader2, Check, X, AlertTriangle, Power } from "lucide-react";
import { f as formatMoney } from "./mock-data-BQtN9d9M.js";
function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("queue");
  const [feedbackMap, setFeedbackMap] = useState({});
  const {
    data: pendingData,
    isLoading: loadingPending
  } = useQuery({
    queryKey: ["admin-pending"],
    queryFn: () => getOpportunities({
      status: "pending",
      page_size: 50
    })
  });
  const {
    data: activeData,
    isLoading: loadingActive
  } = useQuery({
    queryKey: ["admin-active"],
    queryFn: () => getOpportunities({
      status: "in_progress",
      page_size: 50
    }),
    enabled: activeTab === "active"
  });
  const {
    data: membersData,
    isLoading: loadingMembers
  } = useQuery({
    queryKey: ["admin-members"],
    queryFn: () => getMembers({
      ordering: "-score",
      page_size: 100
    }),
    enabled: activeTab === "members"
  });
  const validateMutation = useMutation({
    mutationFn: async ({
      id,
      action,
      feedback
    }) => {
      const res = await axios.post(`${RESOLVED_API_BASE}/opportunities/${id}/validate/`, {
        action,
        feedback
      });
      return res.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pending"]
      });
      queryClient.invalidateQueries({
        queryKey: ["opportunities"]
      });
      toast.success(vars.action === "approve" ? "Opportunity Approved!" : "Opportunity Rejected", {
        description: "Feed updated."
      });
    }
  });
  const forceCloseMutation = useMutation({
    mutationFn: async (id) => updateOpportunityStatus(id, "archived"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-active"]
      });
      toast.success("Deal force-closed by admin.");
    }
  });
  const suspendMutation = useMutation({
    mutationFn: async (id) => suspendMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-members"]
      });
      toast.success("Member suspended (moved to Member).");
    }
  });
  const pending = pendingData?.results || [];
  const active = activeData?.results || [];
  membersData?.results || Array.isArray(membersData) ? Array.isArray(membersData) ? membersData : [] : [];
  const tabs = [{
    id: "queue",
    label: "Validation Queue",
    count: pending.length
  }, {
    id: "active",
    label: "Active Deals"
  }, {
    id: "members",
    label: "Member Management"
  }];
  return /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto py-8 px-5", children: [
    /* @__PURE__ */ jsxs(motion.div, { initial: {
      opacity: 0,
      y: -20
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
        /* @__PURE__ */ jsx("div", { className: "size-10 rounded-xl flex items-center justify-center", style: {
          background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)"
        }, children: /* @__PURE__ */ jsx(Shield, { className: "size-5 text-white" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", style: {
          color: "#0F172A"
        }, children: "Admin Dashboard" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm ml-13", style: {
        color: "#475569"
      }, children: "Review submissions, manage active deals, and oversee members." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0 mb-6 border-b", style: {
      borderColor: "#E2E8F0"
    }, children: tabs.map((t) => /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab(t.id), className: "flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all relative", style: {
      color: activeTab === t.id ? "#1E3A8A" : "#64748B"
    }, children: [
      t.label,
      t.count !== void 0 && t.count > 0 && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold px-1.5 py-0.5 rounded-full", style: {
        background: "#FEF3C7",
        color: "#B45309"
      }, children: t.count }),
      activeTab === t.id && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 h-0.5", style: {
        background: "#1E3A8A"
      } })
    ] }, t.id)) }),
    /* @__PURE__ */ jsxs(AnimatePresence, { mode: "wait", children: [
      activeTab === "queue" && /* @__PURE__ */ jsx(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, children: loadingPending ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsx(Loader2, { className: "size-8 animate-spin", style: {
        color: "#0EA5E9"
      } }) }) : pending.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "py-16 flex flex-col items-center justify-center text-center rounded-xl border", style: {
        borderColor: "#E2E8F0",
        background: "#F8FAFC"
      }, children: [
        /* @__PURE__ */ jsx("div", { className: "size-14 rounded-full flex items-center justify-center mb-4", style: {
          background: "#D1FAE5"
        }, children: /* @__PURE__ */ jsx(Check, { className: "size-7", style: {
          color: "#059669"
        } }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold mb-1", style: {
          color: "#0F172A"
        }, children: "Validation Queue Clear" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", style: {
          color: "#475569"
        }, children: "All submitted opportunities have been reviewed." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: pending.map((opp, idx) => /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        x: -12
      }, animate: {
        opacity: 1,
        x: 0,
        transition: {
          delay: idx * 0.05
        }
      }, exit: {
        opacity: 0,
        scale: 0.96
      }, className: "rounded-xl border p-5 flex flex-col md:flex-row md:items-start gap-4", style: {
        background: "#FFFFFF",
        borderColor: "#E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold px-2.5 py-0.5 rounded-full", style: {
              background: "#FEF3C7",
              color: "#B45309"
            }, children: "Awaiting Review" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium px-2.5 py-0.5 rounded-full", style: {
              background: "#F1F5F9",
              color: "#334155"
            }, children: opp.category }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium px-2.5 py-0.5 rounded-full", style: {
              background: "#F1F5F9",
              color: "#334155"
            }, children: opp.type }),
            opp.channel && /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium px-2.5 py-0.5 rounded-full", style: {
              background: "#F5F3FF",
              color: "#6D28D9"
            }, children: "Syndicate" })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "text-base font-bold mb-1", style: {
            color: "#0F172A"
          }, children: opp.title }),
          /* @__PURE__ */ jsx("p", { className: "text-sm mb-4 line-clamp-2", style: {
            color: "#475569"
          }, children: opp.description }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2 text-xs", children: [{
            label: "Value",
            value: formatMoney(opp.value),
            color: "#059669"
          }, {
            label: "Confidence",
            value: opp.confidence,
            color: "#0F172A"
          }, {
            label: "Type",
            value: opp.type,
            color: "#0F172A"
          }, {
            label: "Submitter",
            value: opp.submitter_details?.name || "Unknown",
            color: "#1E3A8A"
          }].map(({
            label,
            value,
            color
          }) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-2.5", style: {
            background: "#F8FAFC",
            border: "1px solid #E2E8F0"
          }, children: [
            /* @__PURE__ */ jsx("div", { style: {
              color: "#94A3B8",
              marginBottom: 2
            }, children: label }),
            /* @__PURE__ */ jsx("div", { className: "font-semibold", style: {
              color
            }, children: value })
          ] }, label)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 w-full md:w-56 shrink-0", children: [
          /* @__PURE__ */ jsx("textarea", { placeholder: "Admin feedback (optional for approve, recommended for reject)...", className: "w-full rounded-lg p-2.5 text-sm outline-none border", style: {
            borderColor: "#E2E8F0",
            background: "#F8FAFC",
            color: "#0F172A",
            minHeight: 80,
            resize: "vertical"
          }, value: feedbackMap[opp.id] || "", onChange: (e) => setFeedbackMap((p) => ({
            ...p,
            [opp.id]: e.target.value
          })), onFocus: (e) => {
            e.target.style.borderColor = "#0EA5E9";
          }, onBlur: (e) => {
            e.target.style.borderColor = "#E2E8F0";
          }, disabled: validateMutation.isPending }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => validateMutation.mutate({
              id: opp.id,
              action: "reject",
              feedback: feedbackMap[opp.id] || ""
            }), disabled: validateMutation.isPending, className: "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50", style: {
              background: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FECACA"
            }, children: [
              /* @__PURE__ */ jsx(X, { className: "size-3.5" }),
              " Reject"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => validateMutation.mutate({
              id: opp.id,
              action: "approve",
              feedback: feedbackMap[opp.id] || ""
            }), disabled: validateMutation.isPending, className: "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50", style: {
              background: "#1E3A8A",
              color: "#FFFFFF"
            }, children: [
              /* @__PURE__ */ jsx(Check, { className: "size-3.5" }),
              " Approve"
            ] })
          ] })
        ] })
      ] }, opp.id)) }) }, "queue"),
      activeTab === "active" && /* @__PURE__ */ jsx(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, children: loadingActive ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsx(Loader2, { className: "size-8 animate-spin", style: {
        color: "#0EA5E9"
      } }) }) : active.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "py-16 text-center rounded-xl border", style: {
        borderColor: "#E2E8F0",
        background: "#F8FAFC"
      }, children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold", style: {
          color: "#0F172A"
        }, children: "No active deals" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm mt-1", style: {
          color: "#475569"
        }, children: "All deals are resolved or pending validation." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: active.map((opp, idx) => /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        y: 8
      }, animate: {
        opacity: 1,
        y: 0,
        transition: {
          delay: idx * 0.05
        }
      }, className: "rounded-xl border p-5 flex items-start justify-between gap-4", style: {
        background: "#FFFFFF",
        borderColor: "#E2E8F0"
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx(StatusBadge, { status: opp.status }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px]", style: {
              color: "#94A3B8"
            }, children: opp.category })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm mb-0.5", style: {
            color: "#0F172A"
          }, children: opp.title }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs", style: {
            color: "#64748B"
          }, children: [
            "Submitter: ",
            /* @__PURE__ */ jsx("strong", { children: opp.submitter_details?.name }),
            opp.executor_details && /* @__PURE__ */ jsxs(Fragment, { children: [
              " · Executor: ",
              /* @__PURE__ */ jsx("strong", { children: opp.executor_details?.name })
            ] }),
            "· Value: ",
            /* @__PURE__ */ jsx("strong", { style: {
              color: "#059669"
            }, children: formatMoney(opp.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => {
          if (confirm(`Force-close "${opp.title}"?`)) forceCloseMutation.mutate(opp.id);
        }, disabled: forceCloseMutation.isPending, className: "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50", style: {
          background: "#FEF2F2",
          color: "#DC2626",
          border: "1px solid #FECACA"
        }, children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "size-3.5" }),
          " Force Close"
        ] })
      ] }, opp.id)) }) }, "active"),
      activeTab === "members" && /* @__PURE__ */ jsx(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, children: loadingMembers ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsx(Loader2, { className: "size-8 animate-spin", style: {
        color: "#0EA5E9"
      } }) }) : /* @__PURE__ */ jsx("div", { className: "rounded-xl overflow-hidden border", style: {
        borderColor: "#E2E8F0"
      }, children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { style: {
          background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0"
        }, children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider", style: {
            color: "#475569"
          }, children: "Member" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell", style: {
            color: "#475569"
          }, children: "Tier" }),
          /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell", style: {
            color: "#475569"
          }, children: "Score" }),
          /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell", style: {
            color: "#475569"
          }, children: "Deals" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider", style: {
            color: "#475569"
          }, children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: (Array.isArray(membersData) ? membersData : membersData?.results || []).map((m) => /* @__PURE__ */ jsxs("tr", { style: {
          borderBottom: "1px solid #F1F5F9"
        }, children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "size-8 rounded-full flex items-center justify-center text-xs font-bold", style: {
              background: "#EFF6FF",
              color: "#1E3A8A"
            }, children: m.avatar || m.name.charAt(0) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold", style: {
                color: "#0F172A"
              }, children: m.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs", style: {
                color: "#94A3B8"
              }, children: m.email })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 hidden md:table-cell", children: /* @__PURE__ */ jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[11px] font-semibold", style: {
            background: m.tier === "Trusted" ? "#D1FAE5" : m.tier === "Active" ? "#EFF6FF" : "#FEF3C7",
            color: m.tier === "Trusted" ? "#047857" : m.tier === "Active" ? "#1E3A8A" : "#B45309"
          }, children: m.tier }) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center hidden md:table-cell font-semibold", style: {
            color: "#1E3A8A"
          }, children: m.score?.toLocaleString() }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center hidden md:table-cell", style: {
            color: "#475569"
          }, children: m.deals_closed }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: m.tier !== "Member" ? /* @__PURE__ */ jsxs("button", { onClick: () => {
            if (confirm(`Suspend ${m.name}?`)) suspendMutation.mutate(m.id);
          }, disabled: suspendMutation.isPending, className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50", style: {
            background: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FECACA"
          }, children: [
            /* @__PURE__ */ jsx(Power, { className: "size-3" }),
            " Suspend"
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-[11px] px-2.5 py-1 rounded-lg", style: {
            background: "#FEF3C7",
            color: "#B45309"
          }, children: "Member" }) })
        ] }, m.id)) })
      ] }) }) }, "members")
    ] })
  ] });
}
export {
  AdminDashboard as component
};
