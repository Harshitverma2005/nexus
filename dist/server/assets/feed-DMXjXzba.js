import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, Plus, Loader2, Users } from "lucide-react";
import { O as OpportunityCard } from "./OpportunityCard-BfXF6Umn.js";
import { useQueryClient, useInfiniteQuery, useQuery, useMutation } from "@tanstack/react-query";
import { c as getOpportunities, g as getChannels, b as getChannelMemberships, j as joinChannel } from "./api-CCXKq01o.js";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { l as loadSessionMember } from "./session-CGLVuiYP.js";
import "./mock-data-BQtN9d9M.js";
import "./StatusBadge-CDYb_O5T.js";
import "axios";
const statuses = ["all", "validated", "in_progress", "pending", "closed"];
const categories = ["all", "SaaS", "Fintech", "D2C", "Enterprise", "Marketing", "Consulting", "IT", "Manufacturing"];
function Feed() {
  const member = loadSessionMember();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("validated");
  const [cat, setCat] = useState("all");
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeTab, setActiveTab] = useState("feed");
  const [discoverFilter, setDiscoverFilter] = useState("all");
  const [joiningId, setJoiningId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef(null);
  const queryClient = useQueryClient();
  const {
    data,
    isLoading: loadingOpps,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["opportunities", status, cat, q, activeChannel],
    queryFn: ({
      pageParam = 1
    }) => getOpportunities({
      page: pageParam,
      status: status === "all" ? void 0 : status,
      category: cat === "all" ? void 0 : cat,
      search: q || void 0,
      channel: activeChannel || void 0,
      public_only: activeChannel === null ? true : void 0,
      ordering: "-created_at"
    }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.next) return allPages.length + 1;
      return void 0;
    },
    initialPageParam: 1
  });
  const opportunities = data?.pages.flatMap((page) => page.results) || [];
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, {
      threshold: 0.1
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const {
    data: channelsData
  } = useQuery({
    queryKey: ["channels"],
    queryFn: getChannels
  });
  const {
    data: memberships
  } = useQuery({
    queryKey: ["channel-memberships", member?.id],
    queryFn: () => getChannelMemberships({
      member: member?.id
    }),
    enabled: !!member?.id
  });
  const allChannels = Array.isArray(channelsData) ? channelsData : channelsData?.results || [];
  const joinedChannelIds = useMemo(() => {
    const list = Array.isArray(memberships) ? memberships : memberships?.results || [];
    return new Set(list.map((m) => m.channel));
  }, [memberships]);
  const joinedChannels = useMemo(() => {
    return allChannels.filter((ch) => joinedChannelIds.has(ch.id) || ch.admin === member?.id);
  }, [allChannels, joinedChannelIds]);
  const joinMutation = useMutation({
    mutationFn: (channelId) => joinChannel(channelId, String(member?.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channels"]
      });
      queryClient.invalidateQueries({
        queryKey: ["channel-memberships"]
      });
      toast.success("Successfully joined the syndicate!");
    },
    onSettled: () => setJoiningId(null)
  });
  return /* @__PURE__ */ jsxs("div", { className: "p-5 md:p-8 max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between w-full md:w-auto", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", style: {
            color: "#0F172A"
          }, children: "Exchange Feed" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm mt-0.5", style: {
            color: "#475569"
          }, children: "Validated deals & syndicate opportunities" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex md:hidden items-center gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setShowSearch(!showSearch), className: "size-9 rounded-lg flex items-center justify-center border transition-colors", style: {
            border: "1px solid #E2E8F0",
            color: showSearch ? "#1E3A8A" : "#94A3B8",
            background: showSearch ? "#EFF6FF" : "#FFFFFF"
          }, children: /* @__PURE__ */ jsx(Search, { className: "size-4" }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => setShowFilters(!showFilters), className: "size-9 rounded-lg flex items-center justify-center border transition-colors", style: {
            border: "1px solid #E2E8F0",
            color: showFilters ? "#1E3A8A" : "#94A3B8",
            background: showFilters ? "#EFF6FF" : "#FFFFFF"
          }, children: /* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-stretch md:items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-2 mr-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setShowSearch(!showSearch), className: "size-9 rounded-lg flex items-center justify-center border transition-colors", style: {
            border: "1px solid #E2E8F0",
            color: showSearch ? "#1E3A8A" : "#94A3B8",
            background: showSearch ? "#EFF6FF" : "#FFFFFF"
          }, children: /* @__PURE__ */ jsx(Search, { className: "size-4" }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => setShowFilters(!showFilters), className: "size-9 rounded-lg flex items-center justify-center border transition-colors", style: {
            border: "1px solid #E2E8F0",
            color: showFilters ? "#1E3A8A" : "#94A3B8",
            background: showFilters ? "#EFF6FF" : "#FFFFFF"
          }, children: /* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("feed"), className: "flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors text-center", style: {
            borderColor: activeTab === "feed" ? "#1E3A8A" : "#CBD5E1",
            color: activeTab === "feed" ? "#1E3A8A" : "#1E293B",
            background: activeTab === "feed" ? "#EFF6FF" : "transparent"
          }, children: "HOME" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("discover"), className: "flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors text-center", style: {
            borderColor: activeTab === "discover" ? "#1E3A8A" : "#CBD5E1",
            color: activeTab === "discover" ? "#1E3A8A" : "#1E293B",
            background: activeTab === "discover" ? "#EFF6FF" : "transparent"
          }, children: "DISCOVER" })
        ] }),
        member?.tier !== "Member" && /* @__PURE__ */ jsxs(Link, { to: "/submit", className: "flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors mt-2 md:mt-0", style: {
          background: "#1E3A8A",
          color: "#FFFFFF"
        }, children: [
          /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
          " SUBMIT"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: showSearch && /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0,
      y: -8
    }, animate: {
      opacity: 1,
      y: 0
    }, exit: {
      opacity: 0,
      y: -8
    }, className: "mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-2.5 rounded-lg border", style: {
      background: "#FFFFFF",
      borderColor: "#0EA5E9"
    }, children: [
      /* @__PURE__ */ jsx(Search, { className: "size-4 shrink-0", style: {
        color: "#0EA5E9"
      } }),
      /* @__PURE__ */ jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search opportunities...", className: "bg-transparent outline-none flex-1 text-sm", style: {
        color: "#0F172A"
      }, autoFocus: true })
    ] }) }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: showFilters && /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0,
      y: -8
    }, animate: {
      opacity: 1,
      y: 0
    }, exit: {
      opacity: 0,
      y: -8
    }, className: "mb-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border p-5 space-y-5", style: {
      background: "#FFFFFF",
      borderColor: "#E2E8F0"
    }, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-widest mb-3", style: {
          color: "#475569"
        }, children: "Status" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: statuses.map((s) => /* @__PURE__ */ jsx("button", { onClick: () => setStatus(s), className: "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize", style: {
          background: status === s ? "#1E3A8A" : "#F8FAFC",
          color: status === s ? "#FFFFFF" : "#475569",
          borderColor: status === s ? "#1E3A8A" : "#E2E8F0"
        }, children: s.replace("_", " ") }, s)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-widest mb-3", style: {
          color: "#475569"
        }, children: "Category" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((c) => /* @__PURE__ */ jsx("button", { onClick: () => setCat(c), className: "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all", style: {
          background: cat === c ? "#0EA5E9" : "#F8FAFC",
          color: cat === c ? "#FFFFFF" : "#475569",
          borderColor: cat === c ? "#0EA5E9" : "#E2E8F0"
        }, children: c }, c)) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: activeTab === "feed" && joinedChannels.length > 0 && /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, className: "mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-5 overflow-x-auto pb-2 hide-scrollbar", children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => setActiveChannel(null), className: "flex flex-col items-center gap-1.5 shrink-0 outline-none", children: [
        /* @__PURE__ */ jsx("div", { className: "size-14 rounded-full flex items-center justify-center text-xs font-bold transition-all", style: {
          background: activeChannel === null ? "#1E3A8A" : "#F1F5F9",
          color: activeChannel === null ? "#FFFFFF" : "#475569",
          border: activeChannel === null ? "2.5px solid #1E3A8A" : "2px solid #E2E8F0"
        }, children: "ALL" }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold", style: {
          color: activeChannel === null ? "#1E3A8A" : "#94A3B8"
        }, children: "Public" })
      ] }),
      joinedChannels.map((chan) => {
        const isActive = activeChannel === chan.id;
        return /* @__PURE__ */ jsxs("button", { onClick: () => setActiveChannel(chan.id), className: "flex flex-col items-center gap-1.5 shrink-0 outline-none max-w-[64px]", children: [
          /* @__PURE__ */ jsx("div", { className: "size-14 rounded-full flex items-center justify-center text-sm font-bold transition-all", style: {
            background: isActive ? "#1E3A8A" : "#F1F5F9",
            color: isActive ? "#FFFFFF" : "#475569",
            border: isActive ? "2.5px solid #0EA5E9" : "2px solid #E2E8F0"
          }, children: chan.title.slice(0, 2).toUpperCase() }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-center truncate w-full", style: {
            color: isActive ? "#1E3A8A" : "#94A3B8"
          }, children: chan.title })
        ] }, chan.id);
      })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { children: activeTab === "feed" ? loadingOpps ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 gap-3", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "size-8 animate-spin", style: {
        color: "#0EA5E9"
      } }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", style: {
        color: "#475569"
      }, children: "Fetching opportunities..." })
    ] }) : /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: opportunities.map((o, i) => /* @__PURE__ */ jsx(OpportunityCard, { opp: {
        ...o,
        submitterId: o.submitter
      }, index: i }, o.id)) }),
      opportunities.length === 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-dashed p-16 text-center mt-5", style: {
        borderColor: "#CBD5E1"
      }, children: [
        /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold mb-1", style: {
          color: "#0F172A"
        }, children: "No opportunities found" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", style: {
          color: "#475569"
        }, children: "Try adjusting your filters or search terms." })
      ] }),
      /* @__PURE__ */ jsx("div", { ref: loadMoreRef, className: "py-6 flex justify-center", children: isFetchingNextPage ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", style: {
        color: "#0EA5E9"
      }, children: [
        /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }),
        "Loading more..."
      ] }) : hasNextPage ? /* @__PURE__ */ jsx("button", { onClick: () => fetchNextPage(), className: "text-sm font-semibold", style: {
        color: "#475569"
      }, children: "Load more →" }) : opportunities.length > 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs", style: {
        color: "#CBD5E1"
      }, children: "End of feed" }) : null })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-white p-2 rounded-xl border", style: {
        borderColor: "#E2E8F0"
      }, children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setDiscoverFilter("all"), className: `px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${discoverFilter === "all" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"}`, style: discoverFilter === "all" ? {
          background: "#1E3A8A"
        } : {}, children: "All Syndicates" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setDiscoverFilter("joined"), className: `px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${discoverFilter === "joined" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"}`, style: discoverFilter === "joined" ? {
          background: "#1E3A8A"
        } : {}, children: "Joined" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setDiscoverFilter("unjoined"), className: `px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${discoverFilter === "unjoined" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"}`, style: discoverFilter === "unjoined" ? {
          background: "#1E3A8A"
        } : {}, children: "Discover New" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: allChannels.filter((ch) => {
        const isJoined = joinedChannelIds.has(ch.id) || ch.admin === member?.id;
        if (discoverFilter === "joined") return isJoined;
        if (discoverFilter === "unjoined") return !isJoined;
        return true;
      }).map((ch) => {
        const isJoined = joinedChannelIds.has(ch.id) || ch.admin === member?.id;
        return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border p-5 transition-all hover:shadow-md", style: {
          background: "#FFFFFF",
          borderColor: "#E2E8F0"
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "size-10 rounded-lg flex items-center justify-center text-sm font-bold", style: {
              background: "#EFF6FF",
              color: "#1E3A8A"
            }, children: ch.title.slice(0, 2).toUpperCase() }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-semibold px-2.5 py-0.5 rounded-full", style: {
              background: "#F1F5F9",
              color: "#475569"
            }, children: [
              "$",
              ch.entry_fee,
              " Entry"
            ] })
          ] }),
          /* @__PURE__ */ jsx(Link, { to: "/channel/$id", params: {
            id: String(ch.id)
          }, className: "hover:underline", children: /* @__PURE__ */ jsx("h3", { className: "font-semibold text-base mb-1", style: {
            color: "#0F172A"
          }, children: ch.title }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm mb-4 line-clamp-2", style: {
            color: "#475569"
          }, children: ch.description }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-3", style: {
            borderTop: "1px solid #F1F5F9"
          }, children: [
            /* @__PURE__ */ jsxs("span", { className: "text-xs", style: {
              color: "#94A3B8"
            }, children: [
              "Admin: ",
              ch.admin_details?.name || "System"
            ] }),
            isJoined ? /* @__PURE__ */ jsx("span", { className: "px-3 py-1 rounded-full text-xs font-semibold", style: {
              background: "#ECFDF5",
              color: "#059669"
            }, children: "✓ Joined" }) : /* @__PURE__ */ jsx("button", { onClick: () => {
              setJoiningId(ch.id);
              joinMutation.mutate(ch.id);
            }, disabled: joiningId === ch.id, className: "text-xs px-4 py-1.5 disabled:opacity-50 font-semibold rounded-lg transition-colors", style: {
              background: "#1E3A8A",
              color: "#FFFFFF"
            }, children: joiningId === ch.id ? "Joining..." : "Join Syndicate" })
          ] })
        ] }, ch.id);
      }) }),
      allChannels.filter((ch) => {
        const isJoined = joinedChannelIds.has(ch.id) || ch.admin === member?.id;
        if (discoverFilter === "joined") return isJoined;
        if (discoverFilter === "unjoined") return !isJoined;
        return true;
      }).length === 0 && /* @__PURE__ */ jsxs("div", { className: "col-span-full rounded-xl border border-dashed p-16 text-center", style: {
        borderColor: "#CBD5E1"
      }, children: [
        /* @__PURE__ */ jsx(Users, { className: "size-10 mx-auto mb-3", style: {
          color: "#CBD5E1"
        } }),
        /* @__PURE__ */ jsx("p", { className: "font-semibold", style: {
          color: "#0F172A"
        }, children: "No Syndicates Found" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm mt-1", style: {
          color: "#475569"
        }, children: "Be the first to create an exclusive network!" })
      ] })
    ] }) })
  ] });
}
export {
  Feed as component
};
