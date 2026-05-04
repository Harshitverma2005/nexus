import { jsxs, jsx } from "react/jsx-runtime";
import { Award, TrendingUp, CheckCircle2, Target } from "lucide-react";
import { o as opportunities, c as currentUser } from "./mock-data-BQtN9d9M.js";
import { O as OpportunityCard } from "./OpportunityCard-BfXF6Umn.js";
import "@tanstack/react-router";
import "./StatusBadge-CDYb_O5T.js";
import "framer-motion";
function Profile() {
  const myOpps = opportunities.filter((o) => o.submitterId === currentUser.id || o.executorId === currentUser.id);
  const tierProgress = currentUser.tier === "Admin" ? 100 : currentUser.tier === "Manager" ? 65 : 25;
  return /* @__PURE__ */ jsxs("div", { className: "p-5 md:p-8 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden animate-slide-up", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-aurora opacity-40 pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col md:flex-row md:items-center gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "size-24 rounded-2xl bg-gradient-neon flex items-center justify-center text-background font-display font-bold text-3xl glow-neon", children: currentUser.avatar }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-display font-bold", children: currentUser.name }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs px-2.5 py-1 rounded-full bg-gradient-neon text-background font-semibold flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Award, { className: "size-3" }),
              " ",
              currentUser.tier
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground mb-3", children: [
            currentUser.handle,
            " · Joined ",
            currentUser.joined
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: currentUser.expertise.map((e) => /* @__PURE__ */ jsx("span", { className: "text-xs px-3 py-1 rounded-full bg-violet/15 text-violet border border-violet/30", children: e }, e)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", children: [{
      icon: TrendingUp,
      label: "Reputation",
      value: currentUser.score.toLocaleString(),
      accent: "text-neon"
    }, {
      icon: CheckCircle2,
      label: "Deals closed",
      value: currentUser.dealsClosed.toString(),
      accent: "text-violet"
    }, {
      icon: Target,
      label: "Success rate",
      value: `${currentUser.successRate}%`,
      accent: "text-amber"
    }, {
      icon: Award,
      label: "Tier",
      value: currentUser.tier,
      accent: "text-neon"
    }].map((s, i) => /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-5 hover-lift hover-lift-hover animate-slide-up", style: {
      animationDelay: `${i * 50}ms`
    }, children: [
      /* @__PURE__ */ jsx(s.icon, { className: `size-5 mb-2 ${s.accent}` }),
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-display font-bold", children: s.value }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground uppercase tracking-wider", children: s.label })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl p-6 mb-6 animate-slide-up", style: {
      animationDelay: "200ms"
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Tier progression" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Member → Manager → Admin" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-3 bg-secondary rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-gradient-neon glow-neon transition-all duration-1000", style: {
        width: `${tierProgress}%`
      } }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground mt-2", children: [
        /* @__PURE__ */ jsx("span", { children: "Member" }),
        /* @__PURE__ */ jsx("span", { children: "Manager" }),
        /* @__PURE__ */ jsx("span", { className: "text-neon font-semibold", children: "Admin" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("h2", { className: "text-xl font-display font-bold mb-4", children: [
      "Your opportunities (",
      myOpps.length,
      ")"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: myOpps.map((o, i) => /* @__PURE__ */ jsx(OpportunityCard, { opp: o, index: i }, o.id)) }),
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-display font-bold mt-8 mb-4", children: "Recent activity" }),
    /* @__PURE__ */ jsx("div", { className: "glass rounded-2xl p-2", children: [{
      txt: "Closed deal: Healthcare RCM Consulting",
      pts: "+250",
      at: "2 days ago"
    }, {
      txt: "Claimed: Performance Marketing Agency",
      pts: "+10",
      at: "3 days ago"
    }, {
      txt: "Submitted: Enterprise SaaS Deal",
      pts: "+5",
      at: "5 days ago"
    }, {
      txt: "Tier promoted to Admin",
      pts: "+500",
      at: "1 week ago"
    }].map((a, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg hover:bg-secondary/40 transition-colors", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "size-2 rounded-full bg-neon animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm", children: a.txt })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-neon font-semibold", children: a.pts }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: a.at })
      ] })
    ] }, i)) })
  ] });
}
export {
  Profile as component
};
