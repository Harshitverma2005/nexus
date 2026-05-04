import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, Plus, Loader2, Users } from "lucide-react";
import { type OppStatus, type OppCategory } from "@/lib/mock-data";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useInfiniteQuery, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getOpportunities, getMembers, getChannels, joinChannel, getChannelMemberships } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { loadSessionMember } from "@/lib/session";

export const Route = createFileRoute("/_app/feed")({
  component: Feed,
});

type TabType = "feed" | "discover";

const statuses: ("all" | OppStatus)[] = ["all", "validated", "in_progress", "pending", "closed"];
const categories: ("all" | OppCategory)[] = ["all", "SaaS", "Fintech", "D2C", "Enterprise", "Marketing", "Consulting", "IT", "Manufacturing"];

type DiscoverFilterType = "all" | "joined" | "unjoined";

function Feed() {
  const member = loadSessionMember();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("validated");
  const [cat, setCat] = useState<(typeof categories)[number]>("all");
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [discoverFilter, setDiscoverFilter] = useState<DiscoverFilterType>("all");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading: loadingOpps, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["opportunities", status, cat, q, activeChannel],
    queryFn: ({ pageParam = 1 }) =>
      getOpportunities({
        page: pageParam,
        status: status === "all" ? undefined : status,
        category: cat === "all" ? undefined : cat,
        search: q || undefined,
        channel: activeChannel || undefined,
        public_only: activeChannel === null ? true : undefined,
        ordering: "-created_at",
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.next) return allPages.length + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const opportunities = data?.pages.flatMap((page) => page.results) || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { data: channelsData } = useQuery({ queryKey: ["channels"], queryFn: getChannels });
  const { data: memberships } = useQuery({
    queryKey: ["channel-memberships", member?.id],
    queryFn: () => getChannelMemberships({ member: member?.id }),
    enabled: !!member?.id,
  });

  const allChannels = Array.isArray(channelsData) ? channelsData : (channelsData?.results || []);

  const joinedChannelIds = useMemo(() => {
    const list = Array.isArray(memberships) ? memberships : (memberships?.results || []);
    return new Set(list.map((m: any) => m.channel));
  }, [memberships]);

  const joinedChannels = useMemo(() => {
    return allChannels.filter((ch: any) => joinedChannelIds.has(ch.id) || ch.admin === member?.id);
  }, [allChannels, joinedChannelIds]);

  const joinMutation = useMutation({
    mutationFn: (channelId: string) => joinChannel(channelId, String(member?.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["channel-memberships"] });
      toast.success("Successfully joined the syndicate!");
    },
    onSettled: () => setJoiningId(null),
  });

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-start justify-between w-full md:w-auto">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#0F172A" }}>Exchange Feed</h1>
            <p className="text-sm mt-0.5" style={{ color: "#475569" }}>Validated deals & syndicate opportunities</p>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="size-9 rounded-lg flex items-center justify-center border transition-colors"
              style={{ border: "1px solid #E2E8F0", color: showSearch ? "#1E3A8A" : "#94A3B8", background: showSearch ? "#EFF6FF" : "#FFFFFF" }}
            >
              <Search className="size-4" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="size-9 rounded-lg flex items-center justify-center border transition-colors"
              style={{ border: "1px solid #E2E8F0", color: showFilters ? "#1E3A8A" : "#94A3B8", background: showFilters ? "#EFF6FF" : "#FFFFFF" }}
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <div className="hidden md:flex items-center gap-2 mr-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="size-9 rounded-lg flex items-center justify-center border transition-colors"
              style={{ border: "1px solid #E2E8F0", color: showSearch ? "#1E3A8A" : "#94A3B8", background: showSearch ? "#EFF6FF" : "#FFFFFF" }}
            >
              <Search className="size-4" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="size-9 rounded-lg flex items-center justify-center border transition-colors"
              style={{ border: "1px solid #E2E8F0", color: showFilters ? "#1E3A8A" : "#94A3B8", background: showFilters ? "#EFF6FF" : "#FFFFFF" }}
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("feed")}
              className="flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors text-center"
              style={{
                borderColor: activeTab === "feed" ? "#1E3A8A" : "#CBD5E1",
                color: activeTab === "feed" ? "#1E3A8A" : "#1E293B",
                background: activeTab === "feed" ? "#EFF6FF" : "transparent"
              }}
            >
              HOME
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className="flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors text-center"
              style={{
                borderColor: activeTab === "discover" ? "#1E3A8A" : "#CBD5E1",
                color: activeTab === "discover" ? "#1E3A8A" : "#1E293B",
                background: activeTab === "discover" ? "#EFF6FF" : "transparent"
              }}
            >
              DISCOVER
            </button>
          </div>

          {member?.tier !== "Member" && (
            <Link
              to="/submit"
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors mt-2 md:mt-0"
              style={{ background: "#1E3A8A", color: "#FFFFFF" }}
            >
              <Plus className="size-4" /> SUBMIT
            </Link>
          )}
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border" style={{ background: "#FFFFFF", borderColor: "#0EA5E9" }}>
              <Search className="size-4 shrink-0" style={{ color: "#0EA5E9" }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search opportunities..."
                className="bg-transparent outline-none flex-1 text-sm"
                style={{ color: "#0F172A" }}
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-6">
            <div className="rounded-xl border p-5 space-y-5" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>Status</p>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(s => (
                    <button
                      key={s} onClick={() => setStatus(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize"
                      style={{
                        background: status === s ? "#1E3A8A" : "#F8FAFC",
                        color: status === s ? "#FFFFFF" : "#475569",
                        borderColor: status === s ? "#1E3A8A" : "#E2E8F0",
                      }}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button
                      key={c} onClick={() => setCat(c)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                      style={{
                        background: cat === c ? "#0EA5E9" : "#F8FAFC",
                        color: cat === c ? "#FFFFFF" : "#475569",
                        borderColor: cat === c ? "#0EA5E9" : "#E2E8F0",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Channel Story Rings ────────────────────────────────── */}
      <AnimatePresence>
        {activeTab === "feed" && joinedChannels.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <div className="flex gap-5 overflow-x-auto pb-2 hide-scrollbar">
              <button onClick={() => setActiveChannel(null)} className="flex flex-col items-center gap-1.5 shrink-0 outline-none">
                <div
                  className="size-14 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: activeChannel === null ? "#1E3A8A" : "#F1F5F9",
                    color: activeChannel === null ? "#FFFFFF" : "#475569",
                    border: activeChannel === null ? "2.5px solid #1E3A8A" : "2px solid #E2E8F0",
                  }}
                >
                  ALL
                </div>
                <span className="text-[10px] font-semibold" style={{ color: activeChannel === null ? "#1E3A8A" : "#94A3B8" }}>Public</span>
              </button>
              {joinedChannels.map((chan: any) => {
                const isActive = activeChannel === chan.id;
                return (
                  <button key={chan.id} onClick={() => setActiveChannel(chan.id)} className="flex flex-col items-center gap-1.5 shrink-0 outline-none max-w-[64px]">
                    <div
                      className="size-14 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                      style={{
                        background: isActive ? "#1E3A8A" : "#F1F5F9",
                        color: isActive ? "#FFFFFF" : "#475569",
                        border: isActive ? "2.5px solid #0EA5E9" : "2px solid #E2E8F0",
                      }}
                    >
                      {chan.title.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-semibold text-center truncate w-full" style={{ color: isActive ? "#1E3A8A" : "#94A3B8" }}>
                      {chan.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div>
        {activeTab === "feed" ? (
          loadingOpps ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="size-8 animate-spin" style={{ color: "#0EA5E9" }} />
              <p className="text-sm font-medium" style={{ color: "#475569" }}>Fetching opportunities...</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {opportunities.map((o: any, i: number) => (
                  <OpportunityCard key={o.id} opp={{ ...o, submitterId: o.submitter }} index={i} />
                ))}
              </div>
              
              {opportunities.length === 0 && (
                <div className="rounded-xl border border-dashed p-16 text-center mt-5" style={{ borderColor: "#CBD5E1" }}>
                  <p className="text-lg font-semibold mb-1" style={{ color: "#0F172A" }}>No opportunities found</p>
                  <p className="text-sm" style={{ color: "#475569" }}>Try adjusting your filters or search terms.</p>
                </div>
              )}
              
              <div ref={loadMoreRef} className="py-6 flex justify-center">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#0EA5E9" }}>
                    <Loader2 className="size-4 animate-spin" />Loading more...
                  </div>
                ) : hasNextPage ? (
                  <button onClick={() => fetchNextPage()} className="text-sm font-semibold" style={{ color: "#475569" }}>
                    Load more →
                  </button>
                ) : opportunities.length > 0 ? (
                  <p className="text-xs" style={{ color: "#CBD5E1" }}>End of feed</p>
                ) : null}
              </div>
            </div>
          )
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border" style={{ borderColor: "#E2E8F0" }}>
              <button
                onClick={() => setDiscoverFilter("all")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${discoverFilter === "all" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"}`}
                style={discoverFilter === "all" ? { background: "#1E3A8A" } : {}}
              >
                All Syndicates
              </button>
              <button
                onClick={() => setDiscoverFilter("joined")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${discoverFilter === "joined" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"}`}
                style={discoverFilter === "joined" ? { background: "#1E3A8A" } : {}}
              >
                Joined
              </button>
              <button
                onClick={() => setDiscoverFilter("unjoined")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${discoverFilter === "unjoined" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"}`}
                style={discoverFilter === "unjoined" ? { background: "#1E3A8A" } : {}}
              >
                Discover New
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allChannels.filter((ch: any) => {
                const isJoined = joinedChannelIds.has(ch.id) || ch.admin === member?.id;
                if (discoverFilter === "joined") return isJoined;
                if (discoverFilter === "unjoined") return !isJoined;
                return true;
              }).map((ch: any) => {
              const isJoined = joinedChannelIds.has(ch.id) || ch.admin === member?.id;
              return (
                <div key={ch.id} className="rounded-xl border p-5 transition-all hover:shadow-md" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "#EFF6FF", color: "#1E3A8A" }}>
                      {ch.title.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "#475569" }}>
                      ${ch.entry_fee} Entry
                    </span>
                  </div>
                  <Link to="/channel/$id" params={{ id: String(ch.id) }} className="hover:underline">
                    <h3 className="font-semibold text-base mb-1" style={{ color: "#0F172A" }}>{ch.title}</h3>
                  </Link>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: "#475569" }}>{ch.description}</p>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
                    <span className="text-xs" style={{ color: "#94A3B8" }}>Admin: {ch.admin_details?.name || "System"}</span>
                    {isJoined ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#ECFDF5", color: "#059669" }}>✓ Joined</span>
                    ) : (
                      <button
                        onClick={() => { setJoiningId(ch.id); joinMutation.mutate(ch.id); }}
                        disabled={joiningId === ch.id}
                        className="text-xs px-4 py-1.5 disabled:opacity-50 font-semibold rounded-lg transition-colors"
                        style={{ background: "#1E3A8A", color: "#FFFFFF" }}
                      >
                        {joiningId === ch.id ? "Joining..." : "Join Syndicate"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
            {allChannels.filter((ch: any) => {
              const isJoined = joinedChannelIds.has(ch.id) || ch.admin === member?.id;
              if (discoverFilter === "joined") return isJoined;
              if (discoverFilter === "unjoined") return !isJoined;
              return true;
            }).length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed p-16 text-center" style={{ borderColor: "#CBD5E1" }}>
                <Users className="size-10 mx-auto mb-3" style={{ color: "#CBD5E1" }} />
                <p className="font-semibold" style={{ color: "#0F172A" }}>No Syndicates Found</p>
                <p className="text-sm mt-1" style={{ color: "#475569" }}>Be the first to create an exclusive network!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
