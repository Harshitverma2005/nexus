import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMembers, getChannels, getChannelMemberships } from "../../lib/api";
import { Trophy, Crown, Star, Award, Users, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { loadSessionMember } from "@/lib/session";

export const Route = createFileRoute("/_app/leaderboard")({
  component: Leaderboard,
});

const tierConfig: Record<string, { label: string; bg: string; text: string }> = {
  Admin:   { label: "Admin",   bg: "#D1FAE5", text: "#047857" },
  Manager:    { label: "Manager",    bg: "#EFF6FF", text: "#1E3A8A" },
  Member: { label: "Member", bg: "#FEF3C7", text: "#B45309" },
};

type TabKey = "score" | "dealsClosed" | "successRate";
const tabs: { key: TabKey; label: string; sublabel: string; icon: typeof Trophy }[] = [
  { key: "score", label: "Top Scorers", sublabel: "Total reputation points", icon: Trophy },
  { key: "dealsClosed", label: "Top Closers", sublabel: "Executor deal count",  icon: Award },
  { key: "successRate", label: "Most Trusted", sublabel: "Success rate & tier", icon: Users },
];

function Leaderboard() {
  const navigate = useNavigate();
  const member = loadSessionMember();
  const [activeTab, setActiveTab] = useState<TabKey>("score");
  const [filterChannel, setFilterChannel] = useState<string>("global");

  const { data: channelsData } = useQuery({
    queryKey: ["channels", "leaderboard"],
    queryFn: () => getChannels(),
  });
  const { data: memberChannelsData } = useQuery({
    queryKey: ["memberships", member?.id],
    queryFn: () => getChannelMemberships({ member: member?.id }),
    enabled: !!member?.id
  });
  
  const memberChannelsArray = Array.isArray(memberChannelsData) ? memberChannelsData : (memberChannelsData?.results || []);
  const joinedChannelIds = memberChannelsArray.map((m: any) => String(m.channel));

  const allChannels: any[] = (Array.isArray(channelsData) ? channelsData : (channelsData?.results || [])).filter((c: any) => 
    member?.tier === "Admin" || joinedChannelIds.includes(String(c.id))
  );

  const { data: globalRes, isLoading: globalLoading } = useQuery({
    queryKey: ["members", "leaderboard"],
    queryFn: () => getMembers({ ordering: "-score", page_size: 50 }),
    enabled: filterChannel === "global",
  });

  const { data: channelRes, isLoading: channelLoading } = useQuery({
    queryKey: ["channel-memberships", filterChannel],
    queryFn: () => getChannelMemberships({ channel: filterChannel }),
    enabled: filterChannel !== "global",
  });

  const isLoading = filterChannel === "global" ? globalLoading : channelLoading;

  let raw: any[] = [];
  if (filterChannel === "global") {
    raw = Array.isArray(globalRes) ? globalRes : (globalRes?.results || []);
  } else {
    const rawMemberships = Array.isArray(channelRes) ? channelRes : (channelRes?.results || []);
    raw = rawMemberships.map((m: any) => m.member_details).filter(Boolean);
  }

  const sorted = [...raw].sort((a, b) => {
    if (activeTab === "score") return (b.score || 0) - (a.score || 0);
    if (activeTab === "dealsClosed") return (b.dealsClosed || 0) - (a.dealsClosed || 0);
    return (b.successRate || 0) - (a.successRate || 0);
  });

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const displayValue = (u: any) => {
    if (activeTab === "score") return `${(u.score || 0).toLocaleString()} pts`;
    if (activeTab === "dealsClosed") return `${u.dealsClosed || 0} deals`;
    return `${((u.successRate || 0) * 100).toFixed(0)}% rate`;
  };

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)" }}>
            <Trophy className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#0F172A" }}>{filterChannel === "global" ? "Global Leaderboard" : "Syndicate Leaderboard"}</h1>
            <p className="text-sm" style={{ color: "#475569" }}>{filterChannel === "global" ? "Top rainmakers ranked across all categories" : "Rankings within this exclusive channel"}</p>
          </div>
        </div>

        {/* Horizontal Tab Slider for Channels */}
        <div className="w-full md:w-auto overflow-x-auto custom-scrollbar rounded-2xl">
          <div className="flex bg-slate-100 p-1 rounded-2xl relative w-max min-w-full">
            <button
              onClick={() => setFilterChannel("global")}
              className={`px-6 py-2 text-sm font-bold rounded-xl relative z-10 transition-colors whitespace-nowrap ${
                filterChannel === "global" ? "text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Global
              {filterChannel === "global" && (
                <motion.div layoutId="slider" className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-lg shadow-blue-200" />
              )}
            </button>
            
            {allChannels.map(c => (
              <button
                key={c.id}
                onClick={() => setFilterChannel(c.id)}
                className={`px-5 py-2 text-sm font-bold rounded-xl relative z-10 transition-colors whitespace-nowrap ${
                  filterChannel === c.id ? "text-white" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {c.title}
                {filterChannel === c.id && (
                  <motion.div layoutId="slider" className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-lg shadow-blue-200" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all border"
              style={{
                background: activeTab === t.key ? "#1E3A8A" : "#FFFFFF",
                color: activeTab === t.key ? "#FFFFFF" : "#475569",
                borderColor: activeTab === t.key ? "#1E3A8A" : "#E2E8F0",
              }}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="size-8 rounded-full border-2 animate-spin" style={{ borderColor: "#0EA5E9", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <>
          {/* ── Podium ── */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-4 mb-8 mt-32" style={{ height: 250 }}>
              {[1, 0, 2].map((idx) => {
                const u = top3[idx];
                if (!u) return null;
                const isFirst = idx === 0;
                const heights = [1, 0.83, 0.68];
                const h = heights[idx];
                const themes = [
                  { grad: "linear-gradient(180deg, #1E3A8A, #0EA5E9)", shadow: "0 4px 14px rgba(30,58,138,0.3)" }, // 1st (Blue)
                  { grad: "linear-gradient(180deg, #4338CA, #818CF8)", shadow: "0 4px 14px rgba(67,56,202,0.3)" }, // 2nd (Indigo)
                  { grad: "linear-gradient(180deg, #0F766E, #2DD4BF)", shadow: "0 4px 14px rgba(15,118,110,0.3)" }  // 3rd (Teal)
                ];
                const theme = themes[idx];

                return (
                  <motion.div
                    key={idx}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${h * 100}%`, opacity: 1 }}
                    transition={{ delay: isFirst ? 0.1 : idx === 1 ? 0.3 : 0.5, type: "spring", stiffness: 90 }}
                    className="flex flex-col items-center justify-end relative"
                    style={{ width: isFirst ? 160 : 130 }}
                  >
                    {/* Avatar above column */}
                    <div className="absolute flex flex-col items-center w-[120%]" style={{ bottom: "100%", paddingBottom: "12px" }}>
                      {isFirst && <Crown className="size-5 mb-1" style={{ color: "#F59E0B" }} />}
                      <div
                        className="size-12 rounded-full flex items-center justify-center text-sm font-bold text-white mb-1.5 cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all shrink-0"
                        style={{ background: theme.grad, boxShadow: theme.shadow }}
                        onClick={() => navigate({ to: `/profile/${u.id}` })}
                      >
                        {u.avatar || u.name.charAt(0)}
                      </div>
                      <div className="text-xs font-semibold text-center truncate w-full cursor-pointer hover:text-blue-600 transition-colors" 
                           style={{ color: "#0F172A" }}
                           onClick={() => navigate({ to: `/profile/${u.id}` })}
                      >
                        {u.name}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] px-1 py-0.5 rounded uppercase tracking-tighter font-bold" 
                              style={{ background: tierConfig[u.tier]?.bg || "#F1F5F9", color: tierConfig[u.tier]?.text || "#475569" }}>
                          {u.tier}
                        </span>
                        <div className="text-[11px] font-bold" style={{ color: "#0EA5E9" }}>{displayValue(u)}</div>
                      </div>
                    </div>

                    {/* Column */}
                    <div
                      className="w-full rounded-t-xl flex flex-col items-center justify-start pt-3 shadow-lg"
                      style={{ background: theme.grad, height: "100%" }}
                    >
                      <span className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>{idx + 1}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ── Data Table ── */}
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#E2E8F0" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#475569", width: 56 }}>#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: "#475569" }}>Tier</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: "#475569" }}>Deals</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>
                    {activeTab === "score" ? "Score" : activeTab === "dealsClosed" ? "Deals" : "Success Rate"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rest.map((u: any, i: number) => {
                  const rank = i + 4;
                  const isMe = member?.id === u.id;
                  const tier = tierConfig[u.tier] || tierConfig.Member;

                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      style={{ background: isMe ? "#EFF6FF" : "transparent", borderBottom: "1px solid #F1F5F9" }}
                    >
                      <td style={{ textAlign: "center", fontWeight: 700, color: "#94A3B8", width: 56, padding: "12px 16px" }}>{rank}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)" }}>
                            {u.avatar || u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm flex items-center gap-1.5" style={{ color: "#0F172A" }}>
                              <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate({ to: `/profile/${u.id}` })}>{u.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded px-1 border uppercase tracking-tighter font-bold" 
                                    style={{ background: tier.bg, color: tier.text, borderColor: tier.text + "44" }}>
                                {u.tier}
                              </span>
                              {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "#EFF6FF", color: "#1E3A8A" }}>You</span>}
                              {u.tier === "Trusted" && <Star className="size-3 fill-amber-400 text-amber-400" />}
                            </div>
                            <div className="text-xs hidden md:block" style={{ color: "#94A3B8" }}>{u.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell" style={{ padding: "12px 16px" }}>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: tier.bg, color: tier.text }}>
                          {u.tier}
                        </span>
                      </td>
                      <td className="hidden md:table-cell" style={{ textAlign: "center", color: "#475569", padding: "12px 16px" }}>
                        {u.dealsClosed || 0}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, fontSize: 15, color: "#1E3A8A", padding: "12px 16px" }}>
                        {displayValue(u)}
                      </td>
                    </motion.tr>
                  );
                })}
                {sorted.length <= 3 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8", fontSize: 13 }}>
                      No other members yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
