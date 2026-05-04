import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { g as getChannels, b as getChannelMemberships, c as getOpportunities } from "./api-CCXKq01o.js";
import { Loader2, ArrowLeft, Users, Briefcase } from "lucide-react";
import { O as OpportunityCard } from "./OpportunityCard-BfXF6Umn.js";
import { a as Route } from "./router-CuJY1aKD.js";
import "axios";
import "./mock-data-BQtN9d9M.js";
import "./StatusBadge-CDYb_O5T.js";
import "framer-motion";
import "zod";
function ChannelDetailScreen() {
  const {
    id
  } = Route.useParams();
  const {
    data: channelsData,
    isLoading: loadingChannel
  } = useQuery({
    queryKey: ["channels"],
    queryFn: getChannels
  });
  const allChannels = Array.isArray(channelsData) ? channelsData : channelsData?.results || [];
  const channel = allChannels.find((c) => String(c.id) === String(id));
  const {
    data: membershipsData,
    isLoading: loadingMembers
  } = useQuery({
    queryKey: ["channel-memberships-by-channel", id],
    queryFn: () => getChannelMemberships({
      channel: id
    }),
    enabled: !!id
  });
  const memberships = Array.isArray(membershipsData) ? membershipsData : membershipsData?.results || [];
  const {
    data: oppsData,
    isLoading: loadingOpps
  } = useQuery({
    queryKey: ["channel-opportunities", id],
    queryFn: () => getOpportunities({
      channel: id,
      page_size: 10
    }),
    enabled: !!id
  });
  const opportunities = Array.isArray(oppsData) ? oppsData : oppsData?.results || [];
  if (loadingChannel) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx(Loader2, { className: "size-8 animate-spin text-primary" }) });
  }
  if (!channel) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-red-500 font-medium", children: "Channel not found." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-5 md:p-8 max-w-5xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs(Link, { to: "/channels", className: "inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium mb-4", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
        " Back to My Syndicates"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "size-16 rounded-xl flex items-center justify-center text-xl font-bold bg-blue-50 text-blue-900 border border-blue-100", children: channel.title.slice(0, 2).toUpperCase() }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-slate-900", children: channel.title }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-600 mt-1 max-w-2xl", children: channel.description }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700", children: [
              "$",
              channel.entry_fee,
              " Entry"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-slate-500", children: [
              "Admin ",
              /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-700", children: channel.admin_details?.name || "System" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold flex items-center gap-2 text-slate-900 mb-4", children: [
          /* @__PURE__ */ jsx(Users, { className: "size-5 text-blue-600" }),
          " Syndicate Members (",
          memberships.length,
          ")"
        ] }),
        loadingMembers ? /* @__PURE__ */ jsx("div", { className: "flex justify-center p-4", children: /* @__PURE__ */ jsx(Loader2, { className: "size-5 animate-spin text-slate-400" }) }) : memberships.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "No members found." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: memberships.map((m) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "size-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-800", children: m.member_details?.name?.charAt(0) || "?" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-slate-900", children: m.member_details?.name || "Unknown" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: m.member_details?.tier || "Active" })
            ] })
          ] }),
          m.member === channel.admin && /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full", children: "Admin" })
        ] }, m.id)) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-sm min-h-[400px]", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold flex items-center gap-2 text-slate-900 mb-6", children: [
          /* @__PURE__ */ jsx(Briefcase, { className: "size-5 text-emerald-600" }),
          " Exclusive Opportunities"
        ] }),
        loadingOpps ? /* @__PURE__ */ jsx("div", { className: "flex justify-center p-10", children: /* @__PURE__ */ jsx(Loader2, { className: "size-6 animate-spin text-slate-400" }) }) : opportunities.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-10 rounded-lg border border-dashed border-slate-300 bg-slate-50", children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-600 font-medium", children: "No opportunities listed yet." }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Submit the first deal to this syndicate." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4", children: opportunities.map((o, i) => /* @__PURE__ */ jsx(OpportunityCard, { opp: {
          ...o,
          submitterId: o.submitter
        }, index: i }, o.id)) })
      ] }) })
    ] })
  ] });
}
export {
  ChannelDetailScreen as component
};
