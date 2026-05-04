import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { f as getOpportunity, h as claimOpportunity, i as acceptClaim, k as addComment, m as closeOpportunity } from "./api-CCXKq01o.js";
import { Loader2, ArrowLeft, Clock, TrendingUp, Users, CheckCircle2, MessageSquare, ChevronRight, Send } from "lucide-react";
import { S as StatusBadge } from "./StatusBadge-CDYb_O5T.js";
import { f as formatMoney } from "./mock-data-BQtN9d9M.js";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { l as loadSessionMember } from "./session-CGLVuiYP.js";
import { R as Route } from "./router-CuJY1aKD.js";
import "axios";
import "zod";
function OppDetail() {
  const {
    id
  } = Route.useParams();
  const member = loadSessionMember();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [pitch, setPitch] = useState("");
  const [isClaimModalOpen, setClaimModalOpen] = useState(false);
  const {
    data: opp,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => getOpportunity(id)
  });
  const claimMutation = useMutation({
    mutationFn: (pitchText) => claimOpportunity({
      opportunity: id,
      claimant: String(member?.id),
      pitch: pitchText
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["opportunity", id]
      });
      toast.success("Claim submitted", {
        description: "The submitter will review your pitch."
      });
      setClaimModalOpen(false);
      setPitch("");
    },
    onError: (e) => toast.error(e.response?.data?.detail || "Failed to claim.")
  });
  const acceptMutation = useMutation({
    mutationFn: (claimId) => acceptClaim(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["opportunity", id]
      });
      toast.success("Executor selected! Deal is now In Progress.");
    }
  });
  const commentMutation = useMutation({
    mutationFn: (text) => addComment({
      opportunity: id,
      author: String(member?.id),
      text
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["opportunity", id]
      });
      setComment("");
    }
  });
  const closeMutation = useMutation({
    mutationFn: () => closeOpportunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["opportunity", id]
      });
      toast.success("Deal Closed & Points Distributed!", {
        description: "+50 pts to you and executor."
      });
    }
  });
  if (isLoading) return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center min-h-[400px] gap-3", children: [
    /* @__PURE__ */ jsx(Loader2, { className: "size-6 animate-spin", style: {
      color: "#0EA5E9"
    } }),
    /* @__PURE__ */ jsx("span", { style: {
      color: "#475569"
    }, children: "Loading opportunity..." })
  ] });
  if (isError || !opp) return /* @__PURE__ */ jsx("div", { className: "p-10 text-center", style: {
    color: "#EF4444"
  }, children: "Opportunity not found." });
  const isSubmitter = member && String(opp.submitter) === String(member.id);
  const claimers = opp.opportunity_claims || [];
  const myClaim = claimers.find((c) => String(c.claimant) === String(member?.id));
  const executorId = opp.executor;
  const confidenceColor = opp.confidence === "High" ? "#059669" : opp.confidence === "Low" ? "#EF4444" : "#B45309";
  return /* @__PURE__ */ jsxs("div", { className: "p-5 md:p-8 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/feed", className: "inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors", style: {
      color: "#475569"
    }, children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
      " Back to feed"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-[1fr_300px] gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs(motion.div, { initial: {
          opacity: 0,
          y: 16
        }, animate: {
          opacity: 1,
          y: 0
        }, className: "rounded-xl border p-6", style: {
          background: "#FFFFFF",
          borderColor: "#E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2 mb-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsx(StatusBadge, { status: opp.status }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium px-2.5 py-0.5 rounded-full", style: {
                background: "#F1F5F9",
                color: "#334155"
              }, children: opp.category }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium px-2.5 py-0.5 rounded-full", style: {
                background: "#EFF6FF",
                color: "#1D4ED8"
              }, children: opp.type }),
              opp.channel_details && /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-medium px-2.5 py-0.5 rounded-full", style: {
                background: "#F5F3FF",
                color: "#6D28D9"
              }, children: [
                "⬡ ",
                opp.channel_details.title
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", style: {
                color: "#059669"
              }, children: formatMoney(opp.value) }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider", style: {
                color: "#94A3B8"
              }, children: "Est. Value" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-2", style: {
            color: "#0F172A"
          }, children: opp.title }),
          /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed mb-6", style: {
            color: "#475569"
          }, children: opp.description }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [{
            icon: Clock,
            label: "Timeline",
            value: opp.timeline === "Yes" ? "Defined" : "TBD",
            color: opp.timeline === "Yes" ? "#059669" : "#D97706"
          }, {
            icon: TrendingUp,
            label: "Confidence",
            value: opp.confidence,
            color: confidenceColor
          }, {
            icon: Users,
            label: "Decision",
            value: opp.decision_access === "Yes" ? "Direct" : "Indirect",
            color: "#1E3A8A"
          }, {
            icon: CheckCircle2,
            label: "Budget",
            value: opp.budget_clarity === "Yes" ? "Clear" : "TBD",
            color: opp.budget_clarity === "Yes" ? "#059669" : "#D97706"
          }].map(({
            icon: Icon,
            label,
            value,
            color
          }) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg p-3", style: {
            background: "#F8FAFC",
            border: "1px solid #E2E8F0"
          }, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[10px] uppercase tracking-wider mb-1", style: {
              color: "#94A3B8"
            }, children: [
              /* @__PURE__ */ jsx(Icon, { className: "size-3" }),
              " ",
              label
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-bold", style: {
              color
            }, children: value || "—" })
          ] }, label)) })
        ] }),
        /* @__PURE__ */ jsxs(motion.div, { initial: {
          opacity: 0,
          y: 16
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          delay: 0.1
        }, className: "rounded-xl border p-5", style: {
          background: "#FFFFFF",
          borderColor: "#E2E8F0"
        }, children: [
          /* @__PURE__ */ jsxs("h2", { className: "font-bold flex items-center gap-2 mb-4", style: {
            color: "#0F172A"
          }, children: [
            /* @__PURE__ */ jsx(Users, { className: "size-4", style: {
              color: "#1E3A8A"
            } }),
            "Claimants (",
            claimers.length,
            ")"
          ] }),
          claimers.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm", style: {
            color: "#64748B"
          }, children: "No claims yet. Be the first to apply." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: claimers.map((c) => {
            const m = c.claimant_details;
            const isExecutor = executorId === m?.id;
            return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-4 space-y-2", style: {
              background: "#F8FAFC",
              borderColor: "#E2E8F0"
            }, children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "size-9 rounded-full flex items-center justify-center text-xs font-bold", style: {
                    background: "#EFF6FF",
                    color: "#1E3A8A"
                  }, children: m?.avatar || m?.name?.charAt(0) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", style: {
                      color: "#0F172A"
                    }, children: m?.name }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs", style: {
                      color: "#64748B"
                    }, children: [
                      m?.company,
                      " · ",
                      m?.score?.toLocaleString(),
                      " pts"
                    ] })
                  ] })
                ] }),
                isExecutor ? /* @__PURE__ */ jsx("span", { className: "text-xs px-3 py-1 rounded-full font-semibold", style: {
                  background: "#D1FAE5",
                  color: "#047857"
                }, children: "✓ Executor" }) : isSubmitter && opp.status === "validated" ? /* @__PURE__ */ jsx("button", { onClick: () => acceptMutation.mutate(c.id), disabled: acceptMutation.isPending, className: "text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50", style: {
                  background: "#1E3A8A",
                  color: "#FFFFFF"
                }, children: acceptMutation.isPending ? "Selecting..." : "Select Executor" }) : c.status === "rejected" ? /* @__PURE__ */ jsx("span", { className: "text-xs px-3 py-1 rounded-full font-medium", style: {
                  background: "#FEF2F2",
                  color: "#DC2626"
                }, children: "Not Selected" }) : /* @__PURE__ */ jsx("span", { className: "text-xs px-3 py-1 rounded-full font-medium", style: {
                  background: "#FEF3C7",
                  color: "#B45309"
                }, children: "Pending" })
              ] }),
              c.pitch && /* @__PURE__ */ jsxs("div", { className: "text-sm italic rounded-lg p-3", style: {
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                color: "#475569"
              }, children: [
                '"',
                c.pitch,
                '"'
              ] })
            ] }, c.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxs(motion.div, { initial: {
          opacity: 0,
          y: 16
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          delay: 0.2
        }, className: "rounded-xl border p-5", style: {
          background: "#FFFFFF",
          borderColor: "#E2E8F0"
        }, children: [
          /* @__PURE__ */ jsxs("h2", { className: "font-bold flex items-center gap-2 mb-4", style: {
            color: "#0F172A"
          }, children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "size-4", style: {
              color: "#1E3A8A"
            } }),
            "Deal Activity"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-5 overflow-x-auto", children: ["pending", "validated", "in_progress", "archived"].map((s, i) => {
            const labels = {
              pending: "Submitted",
              validated: "Validated",
              in_progress: "In Progress",
              archived: "Closed"
            };
            const order = ["pending", "validated", "in_progress", "archived"];
            const done = order.indexOf(opp.status) >= i;
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
              /* @__PURE__ */ jsx("div", { className: "size-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all", style: {
                background: done ? "#1E3A8A" : "#F1F5F9",
                color: done ? "#FFFFFF" : "#94A3B8"
              }, children: i + 1 }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px] hidden sm:block", style: {
                color: done ? "#0F172A" : "#94A3B8"
              }, children: labels[s] }),
              i < 3 && /* @__PURE__ */ jsx(ChevronRight, { className: "size-3 shrink-0", style: {
                color: "#E2E8F0"
              } })
            ] }, s);
          }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 mb-4", children: [
            (opp.comments_details || []).map((c) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "size-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold", style: {
                background: "#EFF6FF",
                color: "#1E3A8A"
              }, children: c.author_details?.avatar || c.author_details?.name?.charAt(0) || "?" }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 rounded-lg p-3", style: {
                background: "#F8FAFC",
                border: "1px solid #E2E8F0"
              }, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold", style: {
                    color: "#0F172A"
                  }, children: c.author_details?.name || "Member" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px]", style: {
                    color: "#94A3B8"
                  }, children: new Date(c.created_at || c.at).toLocaleDateString() })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm", style: {
                  color: "#475569"
                }, children: c.text })
              ] })
            ] }, c.id)),
            (opp.comments_details || []).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm", style: {
              color: "#94A3B8"
            }, children: "No comments yet. Start the conversation." })
          ] }),
          member && /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("input", { value: comment, onChange: (e) => setComment(e.target.value), placeholder: "Add a comment or update...", className: "flex-1 px-3 py-2.5 text-sm rounded-lg border outline-none", style: {
              borderColor: "#E2E8F0",
              background: "#F8FAFC",
              color: "#0F172A"
            }, onFocus: (e) => {
              e.target.style.borderColor = "#0EA5E9";
            }, onBlur: (e) => {
              e.target.style.borderColor = "#E2E8F0";
            }, onKeyDown: (e) => {
              if (e.key === "Enter" && comment) commentMutation.mutate(comment);
            }, disabled: commentMutation.isPending }),
            /* @__PURE__ */ jsx("button", { onClick: () => {
              if (comment) commentMutation.mutate(comment);
            }, disabled: commentMutation.isPending || !comment, className: "size-10 rounded-lg flex items-center justify-center disabled:opacity-50", style: {
              background: "#1E3A8A"
            }, children: /* @__PURE__ */ jsx(Send, { className: "size-4 text-white" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(motion.div, { initial: {
          opacity: 0,
          x: 16
        }, animate: {
          opacity: 1,
          x: 0
        }, className: "rounded-xl border p-4", style: {
          background: "#FFFFFF",
          borderColor: "#E2E8F0"
        }, children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider mb-3", style: {
            color: "#94A3B8"
          }, children: "Submitted by" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "size-10 rounded-full flex items-center justify-center font-bold", style: {
              background: "#EFF6FF",
              color: "#1E3A8A"
            }, children: opp.submitter_details?.avatar || opp.submitter_details?.name?.charAt(0) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", style: {
                color: "#0F172A"
              }, children: opp.submitter_details?.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs", style: {
                color: "#64748B"
              }, children: opp.submitter_details?.company }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs font-bold", style: {
                color: "#1E3A8A"
              }, children: [
                opp.submitter_details?.score?.toLocaleString(),
                " pts"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(motion.div, { initial: {
          opacity: 0,
          x: 16
        }, animate: {
          opacity: 1,
          x: 0
        }, transition: {
          delay: 0.1
        }, className: "rounded-xl border p-4 space-y-3", style: {
          background: "#FFFFFF",
          borderColor: "#E2E8F0"
        }, children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider", style: {
            color: "#94A3B8"
          }, children: "Action" }),
          opp.status === "validated" && !isSubmitter && !myClaim && /* @__PURE__ */ jsx("button", { onClick: () => setClaimModalOpen(true), className: "w-full py-3 rounded-lg font-semibold text-sm transition-colors", style: {
            background: "#1E3A8A",
            color: "#FFFFFF"
          }, children: "Claim this Opportunity" }),
          myClaim && /* @__PURE__ */ jsx("div", { className: "w-full py-3 rounded-lg border text-center text-sm font-medium", style: {
            background: "#F8FAFC",
            borderColor: "#E2E8F0",
            color: "#475569"
          }, children: myClaim.status === "pending" ? "✓ Application Submitted" : myClaim.status === "accepted" ? "🎯 You are the Executor!" : "✗ Not Selected" }),
          opp.status === "in_progress" && isSubmitter && /* @__PURE__ */ jsx("button", { onClick: () => closeMutation.mutate(), disabled: closeMutation.isPending, className: "w-full py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50", style: {
            background: "#D1FAE5",
            border: "1px solid #10B981",
            color: "#047857"
          }, children: closeMutation.isPending ? "Closing..." : "✓ Mark Deal as Closed" }),
          opp.status === "pending" && /* @__PURE__ */ jsx("div", { className: "p-3 rounded-lg text-sm text-center font-medium", style: {
            background: "#FEF3C7",
            color: "#B45309"
          }, children: "⏳ Awaiting Admin Validation" }),
          opp.status === "rejected" && /* @__PURE__ */ jsx("div", { className: "p-3 rounded-lg text-sm text-center font-medium", style: {
            background: "#FEF2F2",
            color: "#DC2626"
          }, children: "✗ This opportunity was rejected" }),
          (opp.status === "archived" || opp.status === "closed") && /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2", style: {
            background: "#D1FAE5",
            color: "#047857"
          }, children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "size-4" }),
            " Deal Closed"
          ] })
        ] }),
        opp.executor_details && /* @__PURE__ */ jsxs(motion.div, { initial: {
          opacity: 0,
          x: 16
        }, animate: {
          opacity: 1,
          x: 0
        }, transition: {
          delay: 0.2
        }, className: "rounded-xl border p-4", style: {
          background: "#FFFFFF",
          borderColor: "#E2E8F0"
        }, children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wider mb-3", style: {
            color: "#94A3B8"
          }, children: "Executor" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "size-10 rounded-full flex items-center justify-center font-bold", style: {
              background: "#D1FAE5",
              color: "#047857"
            }, children: opp.executor_details?.avatar || opp.executor_details?.name?.charAt(0) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", style: {
                color: "#0F172A"
              }, children: opp.executor_details?.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs font-medium", style: {
                color: "#059669"
              }, children: "Active Executor" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: isClaimModalOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, exit: {
        opacity: 0
      }, className: "fixed inset-0 z-40", style: {
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(4px)"
      }, onClick: () => setClaimModalOpen(false) }),
      /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        scale: 0.95
      }, animate: {
        opacity: 1,
        scale: 1
      }, exit: {
        opacity: 0,
        scale: 0.95
      }, className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 rounded-2xl border p-6", style: {
        background: "#FFFFFF",
        borderColor: "#E2E8F0",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)"
      }, children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-1", style: {
          color: "#0F172A"
        }, children: "Claim Opportunity" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm mb-5", style: {
          color: "#475569"
        }, children: "Write a short pitch explaining why you're the best person to execute this deal." }),
        /* @__PURE__ */ jsx("textarea", { value: pitch, onChange: (e) => setPitch(e.target.value), placeholder: "I have direct contacts who can close this in 30 days...", rows: 4, className: "w-full rounded-lg border px-3 py-2.5 text-sm outline-none mb-4", style: {
          borderColor: "#E2E8F0",
          color: "#0F172A",
          resize: "none"
        }, onFocus: (e) => {
          e.target.style.borderColor = "#0EA5E9";
        }, onBlur: (e) => {
          e.target.style.borderColor = "#E2E8F0";
        } }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setClaimModalOpen(false), className: "px-4 py-2 rounded-lg text-sm font-medium border", style: {
            borderColor: "#E2E8F0",
            color: "#475569"
          }, children: "Cancel" }),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            if (!pitch) return toast.error("Pitch is required.");
            claimMutation.mutate(pitch);
          }, disabled: claimMutation.isPending || !pitch, className: "px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50", style: {
            background: "#1E3A8A",
            color: "#FFFFFF"
          }, children: claimMutation.isPending ? "Submitting..." : "Submit Pitch" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  OppDetail as component
};
