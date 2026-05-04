import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { g as getChannels, a as getMembers, b as getChannelMemberships } from "./api-CCXKq01o.js";
import { Trophy, Filter, Award, Users, Crown, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { l as loadSessionMember } from "./session-CGLVuiYP.js";
import "axios";
const tierConfig = {
  Admin: {
    label: "Admin",
    bg: "#D1FAE5",
    text: "#047857"
  },
  Manager: {
    label: "Manager",
    bg: "#EFF6FF",
    text: "#1E3A8A"
  },
  Member: {
    label: "Member",
    bg: "#FEF3C7",
    text: "#B45309"
  }
};
const tabs = [{
  key: "score",
  label: "Top Scorers",
  sublabel: "Total reputation points",
  icon: Trophy
}, {
  key: "deals_closed",
  label: "Top Closers",
  sublabel: "Executor deal count",
  icon: Award
}, {
  key: "success_rate",
  label: "Most Trusted",
  sublabel: "Success rate & tier",
  icon: Users
}];
function Leaderboard() {
  const member = loadSessionMember();
  const [activeTab, setActiveTab] = useState("score");
  const [filterChannel, setFilterChannel] = useState("global");
  const {
    data: channelsData
  } = useQuery({
    queryKey: ["channels", "leaderboard"],
    queryFn: () => getChannels()
  });
  const allChannels = Array.isArray(channelsData) ? channelsData : channelsData?.results || [];
  const {
    data: globalRes,
    isLoading: globalLoading
  } = useQuery({
    queryKey: ["members", "leaderboard"],
    queryFn: () => getMembers({
      ordering: "-score",
      page_size: 50
    }),
    enabled: filterChannel === "global"
  });
  const {
    data: channelRes,
    isLoading: channelLoading
  } = useQuery({
    queryKey: ["channel-memberships", filterChannel],
    queryFn: () => getChannelMemberships({
      channel: filterChannel
    }),
    enabled: filterChannel !== "global"
  });
  const isLoading = filterChannel === "global" ? globalLoading : channelLoading;
  let raw = [];
  if (filterChannel === "global") {
    raw = Array.isArray(globalRes) ? globalRes : globalRes?.results || [];
  } else {
    const rawMemberships = Array.isArray(channelRes) ? channelRes : channelRes?.results || [];
    raw = rawMemberships.map((m) => m.member_details).filter(Boolean);
  }
  const sorted = [...raw].sort((a, b) => {
    if (activeTab === "score") return (b.score || 0) - (a.score || 0);
    if (activeTab === "deals_closed") return (b.deals_closed || 0) - (a.deals_closed || 0);
    return (b.success_rate || 0) - (a.success_rate || 0);
  });
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const displayValue = (u) => {
    if (activeTab === "score") return `${(u.score || 0).toLocaleString()} pts`;
    if (activeTab === "deals_closed") return `${u.deals_closed || 0} deals`;
    return `${((u.success_rate || 0) * 100).toFixed(0)}% rate`;
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-5 md:p-8 max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "size-11 rounded-xl flex items-center justify-center", style: {
          background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)"
        }, children: /* @__PURE__ */ jsx(Trophy, { className: "size-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", style: {
            color: "#0F172A"
          }, children: filterChannel === "global" ? "Global Leaderboard" : "Syndicate Leaderboard" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", style: {
            color: "#475569"
          }, children: filterChannel === "global" ? "Top rainmakers ranked across all categories" : "Rankings within this exclusive channel" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border rounded-xl px-3 py-1.5 bg-white", style: {
        borderColor: "#E2E8F0"
      }, children: [
        /* @__PURE__ */ jsx(Filter, { className: "size-4 text-slate-400" }),
        /* @__PURE__ */ jsxs("select", { value: filterChannel, onChange: (e) => setFilterChannel(e.target.value), className: "bg-transparent border-none outline-none text-sm font-semibold text-slate-700 min-w-[140px] appearance-none cursor-pointer", children: [
          /* @__PURE__ */ jsx("option", { value: "global", children: "Global Ranking" }),
          allChannels.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.title }, c.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-8 overflow-x-auto pb-1", children: tabs.map((t) => {
      const Icon = t.icon;
      return /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab(t.key), className: "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all border", style: {
        background: activeTab === t.key ? "#1E3A8A" : "#FFFFFF",
        color: activeTab === t.key ? "#FFFFFF" : "#475569",
        borderColor: activeTab === t.key ? "#1E3A8A" : "#E2E8F0"
      }, children: [
        /* @__PURE__ */ jsx(Icon, { className: "size-4" }),
        t.label
      ] }, t.key);
    }) }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsx("div", { className: "size-8 rounded-full border-2 animate-spin", style: {
      borderColor: "#0EA5E9",
      borderTopColor: "transparent"
    } }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      top3.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex items-end justify-center gap-3 mb-10", style: {
        height: 220
      }, children: [1, 0, 2].map((idx) => {
        const u = top3[idx];
        if (!u) return null;
        const isFirst = idx === 0;
        const heights = [0.83, 1, 0.68];
        const h = heights[idx];
        return /* @__PURE__ */ jsxs(motion.div, { initial: {
          height: 0,
          opacity: 0
        }, animate: {
          height: `${h * 100}%`,
          opacity: 1
        }, transition: {
          delay: isFirst ? 0.1 : idx === 1 ? 0.3 : 0.5,
          type: "spring",
          stiffness: 90
        }, className: "flex flex-col items-center justify-end relative", style: {
          width: isFirst ? 140 : 120
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "absolute flex flex-col items-center", style: {
            top: -90
          }, children: [
            isFirst && /* @__PURE__ */ jsx(Crown, { className: "size-5 mb-1", style: {
              color: "#F59E0B"
            } }),
            /* @__PURE__ */ jsx("div", { className: "size-12 rounded-full flex items-center justify-center text-sm font-bold text-white mb-1.5", style: {
              background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)",
              boxShadow: isFirst ? "0 4px 14px rgba(30,58,138,0.3)" : "none"
            }, children: u.avatar || u.name.charAt(0) }),
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-center truncate max-w-[110px]", style: {
              color: "#0F172A"
            }, children: u.name }),
            /* @__PURE__ */ jsx("div", { className: "text-[11px] font-bold", style: {
              color: "#0EA5E9"
            }, children: displayValue(u) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full rounded-t-xl flex flex-col items-center justify-start pt-3", style: {
            background: isFirst ? "linear-gradient(180deg, #1E3A8A, #0EA5E9)" : "#F1F5F9",
            height: "100%"
          }, children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", style: {
            color: isFirst ? "#FFFFFF" : "#CBD5E1"
          }, children: idx + 1 }) })
        ] }, idx);
      }) }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl overflow-hidden border", style: {
        borderColor: "#E2E8F0"
      }, children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { style: {
          background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0"
        }, children: [
          /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider", style: {
            color: "#475569",
            width: 56
          }, children: "#" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider", style: {
            color: "#475569"
          }, children: "Member" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell", style: {
            color: "#475569"
          }, children: "Tier" }),
          /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell", style: {
            color: "#475569"
          }, children: "Deals" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider", style: {
            color: "#475569"
          }, children: activeTab === "score" ? "Score" : activeTab === "deals_closed" ? "Deals" : "Success Rate" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          rest.map((u, i) => {
            const rank = i + 4;
            const isMe = member?.id === u.id;
            const tier = tierConfig[u.tier] || tierConfig.Member;
            return /* @__PURE__ */ jsxs(motion.tr, { initial: {
              opacity: 0,
              x: -8
            }, animate: {
              opacity: 1,
              x: 0
            }, transition: {
              delay: 0.3 + i * 0.04
            }, style: {
              background: isMe ? "#EFF6FF" : "transparent",
              borderBottom: "1px solid #F1F5F9"
            }, children: [
              /* @__PURE__ */ jsx("td", { style: {
                textAlign: "center",
                fontWeight: 700,
                color: "#94A3B8",
                width: 56,
                padding: "12px 16px"
              }, children: rank }),
              /* @__PURE__ */ jsx("td", { style: {
                padding: "12px 16px"
              }, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ jsx("div", { className: "size-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0", style: {
                  background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)"
                }, children: u.avatar || u.name.charAt(0) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "font-semibold text-sm flex items-center gap-1.5", style: {
                    color: "#0F172A"
                  }, children: [
                    u.name,
                    isMe && /* @__PURE__ */ jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full font-bold", style: {
                      background: "#EFF6FF",
                      color: "#1E3A8A"
                    }, children: "You" }),
                    u.tier === "Trusted" && /* @__PURE__ */ jsx(Star, { className: "size-3 fill-amber-400 text-amber-400" })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs hidden md:block", style: {
                    color: "#94A3B8"
                  }, children: u.company })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "hidden md:table-cell", style: {
                padding: "12px 16px"
              }, children: /* @__PURE__ */ jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[11px] font-semibold", style: {
                background: tier.bg,
                color: tier.text
              }, children: u.tier }) }),
              /* @__PURE__ */ jsx("td", { className: "hidden md:table-cell", style: {
                textAlign: "center",
                color: "#475569",
                padding: "12px 16px"
              }, children: u.deals_closed || 0 }),
              /* @__PURE__ */ jsx("td", { style: {
                textAlign: "right",
                fontWeight: 700,
                fontSize: 15,
                color: "#1E3A8A",
                padding: "12px 16px"
              }, children: displayValue(u) })
            ] }, u.id);
          }),
          sorted.length <= 3 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, style: {
            textAlign: "center",
            padding: "32px 0",
            color: "#94A3B8",
            fontSize: 13
          }, children: "No other members yet." }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  Leaderboard as component
};
