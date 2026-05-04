import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AlertCircle, Sparkles, Check, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { g as getChannels, s as submitOpportunity } from "./api-CCXKq01o.js";
import { useQuery } from "@tanstack/react-query";
import { l as loadSessionMember } from "./session-CGLVuiYP.js";
import "axios";
const categories = ["SaaS", "Fintech", "D2C", "Enterprise", "Marketing", "Consulting", "IT", "Manufacturing"];
const types = ["Referral", "Introduction", "Execution Ready"];
const confidenceArr = ["Low", "Medium", "High"];
const yesNo = ["Yes", "No"];
function Dropdown({
  value,
  options,
  onChange,
  placeholder
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "relative", ref, children: [
    /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setOpen((o) => !o), className: "w-full flex items-center justify-between gap-3 transition-all", style: {
      height: 40,
      padding: "0 12px",
      borderRadius: 8,
      border: open ? "1px solid #0EA5E9" : "1px solid #E2E8F0",
      background: "#FFFFFF",
      color: value ? "#0F172A" : "#94A3B8",
      fontSize: 14,
      fontWeight: value ? 500 : 400,
      boxShadow: open ? "0 0 0 3px rgba(14,165,233,0.12)" : "none",
      cursor: "pointer"
    }, children: [
      /* @__PURE__ */ jsx("span", { children: value || placeholder || "Select..." }),
      /* @__PURE__ */ jsx(ChevronDown, { className: "size-4 transition-transform shrink-0", style: {
        color: "#94A3B8",
        transform: open ? "rotate(180deg)" : "rotate(0deg)"
      } })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0,
      y: -4
    }, animate: {
      opacity: 1,
      y: 0
    }, exit: {
      opacity: 0,
      y: -4
    }, transition: {
      duration: 0.12
    }, className: "absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden", style: {
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 8,
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
    }, children: options.map((o) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
      onChange(o);
      setOpen(false);
    }, className: "w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors", style: {
      color: value === o ? "#1E3A8A" : "#0F172A",
      background: value === o ? "#EFF6FF" : "transparent",
      fontWeight: value === o ? 600 : 400,
      cursor: "pointer"
    }, onMouseEnter: (e) => {
      if (value !== o) e.currentTarget.style.background = "#F8FAFC";
    }, onMouseLeave: (e) => {
      if (value !== o) e.currentTarget.style.background = "transparent";
    }, children: [
      o,
      value === o && /* @__PURE__ */ jsx(Check, { className: "size-4 text-blue-700" })
    ] }, o)) }) })
  ] });
}
function Pills({
  value,
  options,
  onChange
}) {
  return /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: options.map((o) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onChange(o), style: {
    padding: "6px 16px",
    borderRadius: 40,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: `1px solid ${value === o ? "#1E3A8A" : "#E2E8F0"}`,
    background: value === o ? "#1E3A8A" : "#FFFFFF",
    color: value === o ? "#FFFFFF" : "#475569",
    transition: "all 0.15s"
  }, children: o }, o)) });
}
function Field({
  label,
  children,
  hint
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium", style: {
      color: "#374151"
    }, children: label }),
    children,
    hint && /* @__PURE__ */ jsx("p", { className: "text-xs", style: {
      color: "#94A3B8"
    }, children: hint })
  ] });
}
function Submit() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [member, setMember] = useState(null);
  const [memberId, setMemberId] = useState(null);
  useEffect(() => {
    const mem = loadSessionMember();
    if (mem) {
      setMember(mem);
      setMemberId(mem.id);
    }
  }, []);
  const [form, setForm] = useState({
    title: "",
    category: "IT",
    value: "",
    type: "Referral",
    confidence: "Medium",
    timeline: "Yes",
    decision_access: "Yes",
    budget_clarity: "Yes",
    description: "",
    channel: ""
  });
  const {
    data: channelsData
  } = useQuery({
    queryKey: ["channels"],
    queryFn: getChannels
  });
  const channels = channelsData?.results || [];
  const set = (k, v) => setForm((f) => ({
    ...f,
    [k]: v
  }));
  const channelOptions = ["Public / Open Network", ...channels.map((c) => c.title)];
  const labelToId = (lbl) => {
    if (lbl === "Public / Open Network") return "";
    const ch = channels.find((c) => c.title === lbl);
    return ch ? String(ch.id) : "";
  };
  const idToLabel = (id) => {
    if (!id) return "Public / Open Network";
    const ch = channels.find((c) => String(c.id) === id);
    return ch ? ch.title : "Public / Open Network";
  };
  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Please add an opportunity name.");
      return;
    }
    if (!memberId) {
      toast.error("You must be logged in.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitOpportunity({
        ...form,
        value: parseInt(form.value) || 0,
        submitter: parseInt(memberId),
        channel: form.channel ? parseInt(form.channel) : null,
        status: "pending"
      });
      toast.success("Opportunity submitted!", {
        description: "An admin will review within 24 hours."
      });
      navigate({
        to: "/feed"
      });
    } catch (error) {
      toast.error("Submission failed", {
        description: error.response?.data?.detail || "Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (member && member.tier === "Member") {
    return /* @__PURE__ */ jsx("div", { className: "p-6 md:p-12 max-w-xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border p-8 text-center", style: {
      background: "#FFFBEB",
      borderColor: "#FDE68A"
    }, children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "size-12 mx-auto mb-4", style: {
        color: "#F59E0B"
      } }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-2", style: {
        color: "#0F172A"
      }, children: "Reputation Required" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm mb-6", style: {
        color: "#475569"
      }, children: [
        "Your account is currently a ",
        /* @__PURE__ */ jsx("strong", { style: {
          color: "#B45309"
        }, children: "Member" }),
        " tier. Only Managers and Admins can submit new opportunities."
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/feed", className: "btn-primary", style: {
        display: "inline-flex",
        margin: "0 auto"
      }, children: "Browse Available Deals" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-10 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4", style: {
        background: "#EFF6FF",
        color: "#1E3A8A"
      }, children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "size-3" }),
        "New Opportunity"
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-1", style: {
        color: "#0F172A"
      }, children: "Submit an Exchange" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm", style: {
        color: "#475569"
      }, children: [
        "Step ",
        step,
        " of 3"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-8", children: [1, 2, 3].map((s) => /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 rounded-full overflow-hidden", style: {
      background: "#E2E8F0"
    }, children: /* @__PURE__ */ jsx(motion.div, { initial: false, animate: {
      width: s <= step ? "100%" : "0%"
    }, transition: {
      duration: 0.3
    }, className: "h-full rounded-full", style: {
      background: "linear-gradient(90deg, #1E3A8A, #0EA5E9)"
    } }) }, s)) }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border", style: {
      background: "#FFFFFF",
      borderColor: "#E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "p-6 md:p-8", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        x: 12
      }, animate: {
        opacity: 1,
        x: 0
      }, exit: {
        opacity: 0,
        x: -12
      }, transition: {
        duration: 0.2
      }, className: "space-y-6", children: [
        step === 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Field, { label: "Opportunity Name *", children: /* @__PURE__ */ jsx("input", { value: form.title, onChange: (e) => set("title", e.target.value), placeholder: "e.g. Enterprise Cloud Infrastructure Deal", className: "input-field" }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-5", children: [
            /* @__PURE__ */ jsx(Field, { label: "Category", children: /* @__PURE__ */ jsx(Dropdown, { value: form.category, options: [...categories], onChange: (v) => set("category", v) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Type", children: /* @__PURE__ */ jsx(Dropdown, { value: form.type, options: [...types], onChange: (v) => set("type", v) }) })
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Target Syndicate", hint: "Leave as Public to post to the open network", children: /* @__PURE__ */ jsx(Dropdown, { value: idToLabel(form.channel), options: channelOptions, onChange: (v) => set("channel", labelToId(v)) }) }),
          /* @__PURE__ */ jsx(Field, { label: "Brief Description", children: /* @__PURE__ */ jsx("textarea", { value: form.description, onChange: (e) => set("description", e.target.value), rows: 4, placeholder: "Provide context for validators — company stage, deal scope, urgency...", className: "input-field", style: {
            height: "auto"
          } }) })
        ] }),
        step === 2 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-5", children: [
            /* @__PURE__ */ jsx(Field, { label: "Estimated Value (USD)", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 font-semibold", style: {
                color: "#059669",
                fontSize: 14
              }, children: "$" }),
              /* @__PURE__ */ jsx("input", { type: "number", value: form.value, onChange: (e) => set("value", e.target.value), placeholder: "120000", className: "input-field", style: {
                paddingLeft: 24
              } })
            ] }) }),
            /* @__PURE__ */ jsx(Field, { label: "Confidence Level", children: /* @__PURE__ */ jsx(Pills, { value: form.confidence, options: [...confidenceArr], onChange: (v) => set("confidence", v) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-5 space-y-5", style: {
            background: "#F8FAFC",
            border: "1px solid #E2E8F0"
          }, children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-widest", style: {
              color: "#475569"
            }, children: "Qualification Indicators" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-5", children: [
              /* @__PURE__ */ jsx(Field, { label: "Timeline Defined?", children: /* @__PURE__ */ jsx(Pills, { value: form.timeline, options: [...yesNo], onChange: (v) => set("timeline", v) }) }),
              /* @__PURE__ */ jsx(Field, { label: "Decision Access?", children: /* @__PURE__ */ jsx(Pills, { value: form.decision_access, options: [...yesNo], onChange: (v) => set("decision_access", v) }) }),
              /* @__PURE__ */ jsx(Field, { label: "Budget Clarity?", children: /* @__PURE__ */ jsx(Pills, { value: form.budget_clarity, options: [...yesNo], onChange: (v) => set("budget_clarity", v) }) })
            ] })
          ] })
        ] }),
        step === 3 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-widest mb-4", style: {
              color: "#475569"
            }, children: "Review Before Submitting" }),
            /* @__PURE__ */ jsx("table", { className: "w-full text-sm", children: /* @__PURE__ */ jsx("tbody", { children: [["Opportunity", form.title || "—"], ["Category", form.category], ["Type", form.type], ["Projected Value", form.value ? `$${Number(form.value).toLocaleString()}` : "—"], ["Confidence", form.confidence], ["Timeline", form.timeline], ["Decision Access", form.decision_access], ["Budget Clarity", form.budget_clarity], ["Network", idToLabel(form.channel)]].map(([k, v]) => /* @__PURE__ */ jsxs("tr", { style: {
              borderBottom: "1px solid #F1F5F9"
            }, children: [
              /* @__PURE__ */ jsx("td", { className: "py-2.5 pr-4 font-medium", style: {
                color: "#475569",
                width: "40%"
              }, children: k }),
              /* @__PURE__ */ jsx("td", { className: "py-2.5 font-semibold", style: {
                color: "#0F172A"
              }, children: v })
            ] }, k)) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-4 flex gap-3 items-start", style: {
            background: "#F0FDF4",
            border: "1px solid #BBF7D0"
          }, children: [
            /* @__PURE__ */ jsx(Check, { className: "size-5 shrink-0 mt-0.5", style: {
              color: "#10B981"
            } }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", style: {
                color: "#065F46"
              }, children: "Ready to Submit" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs mt-0.5", style: {
                color: "#047857"
              }, children: "This opportunity will enter the validation queue. Admins review within 24 hours." })
            ] })
          ] })
        ] })
      ] }, step) }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 md:px-8 py-4", style: {
        borderTop: "1px solid #F1F5F9"
      }, children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setStep((s) => Math.max(1, s - 1)), disabled: step === 1 || isSubmitting, className: "btn-secondary disabled:opacity-40", children: "Back" }),
        step < 3 ? /* @__PURE__ */ jsx("button", { onClick: () => setStep((s) => s + 1), className: "btn-primary", children: "Continue →" }) : /* @__PURE__ */ jsx("button", { onClick: handleSubmit, disabled: isSubmitting, className: "btn-success disabled:opacity-50", children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }),
          " Submitting..."
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          "Submit to Network ",
          /* @__PURE__ */ jsx(Check, { className: "size-4" })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  Submit as component
};
