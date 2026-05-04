import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, useRouterState, Link, Outlet } from "@tanstack/react-router";
import { Zap, Home, Users, PlusCircle, Trophy, Shield, User, LogIn, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { c as currentUser } from "./mock-data-BQtN9d9M.js";
import { l as loadSessionMember, c as clearSessionMember } from "./session-CGLVuiYP.js";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as Toaster$1 } from "sonner";
const nav = [
  { to: "/feed", label: "Home", icon: Home },
  { to: "/channels", label: "Channels", icon: Users },
  { to: "/submit", label: "Submit", icon: PlusCircle },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin", label: "Admin", icon: Shield },
  { to: "/profile", label: "Profile", icon: User }
];
function AppShell() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarUser, setSidebarUser] = useState(currentUser);
  const isAuthPage = path === "/login" || path === "/register" || path === "/";
  useEffect(() => {
    const user = loadSessionMember();
    if (!user && !isAuthPage) {
      navigate({ to: "/login" });
      return;
    }
    setSidebarUser(user ?? currentUser);
  }, [path, isAuthPage, navigate]);
  const handleLogout = () => {
    clearSessionMember();
    navigate({ to: "/login" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex w-full", style: { background: "#F8FAFC", color: "#0F172A" }, children: [
    !isAuthPage && /* @__PURE__ */ jsxs(
      "aside",
      {
        className: "hidden md:flex flex-col w-60 sticky top-0 h-screen",
        style: {
          background: "#FFFFFF",
          borderRight: "1px solid #E2E8F0"
        },
        children: [
          /* @__PURE__ */ jsx("div", { className: "px-5 pt-6 pb-5", style: { borderBottom: "1px solid #E2E8F0" }, children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5 group", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "size-9 rounded-xl flex items-center justify-center",
                style: { background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)" },
                children: /* @__PURE__ */ jsx(Zap, { className: "size-5 fill-white text-white" })
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 18, color: "#0F172A", lineHeight: "1.2" }, children: "Nexus" }),
              /* @__PURE__ */ jsx("div", { style: { fontWeight: 600, fontSize: 10, color: "#0EA5E9", letterSpacing: "0.12em", textTransform: "uppercase" }, children: "Exchange" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("nav", { className: "flex-1 px-3 py-4 flex flex-col gap-0.5", children: nav.map((n) => {
            const active = path.startsWith(n.to);
            if (n.to === "/submit" && sidebarUser.tier === "Member") return null;
            if (n.to === "/admin" && sidebarUser.tier !== "Admin") return null;
            return /* @__PURE__ */ jsxs(
              Link,
              {
                to: n.to,
                className: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                style: {
                  background: active ? "#EFF6FF" : "transparent",
                  color: active ? "#1E3A8A" : "#475569",
                  fontWeight: active ? 600 : 500,
                  borderLeft: active ? "3px solid #1E3A8A" : "3px solid transparent"
                },
                children: [
                  /* @__PURE__ */ jsx(n.icon, { className: "size-[18px]", style: { color: active ? "#1E3A8A" : "#94A3B8" } }),
                  n.label
                ]
              },
              n.to
            );
          }) }),
          /* @__PURE__ */ jsx("div", { className: "p-4 mt-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border p-3 flex items-center gap-3", style: { borderColor: "#E2E8F0" }, children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                style: { background: "#EFF6FF", color: "#1D4ED8" },
                children: sidebarUser.avatar || sidebarUser.name.charAt(0)
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold truncate", style: { color: "#0F172A", fontSize: "15px" }, children: sidebarUser.name }),
              /* @__PURE__ */ jsxs("div", { className: "font-bold text-sm", style: { color: "#1E3A8A" }, children: [
                sidebarUser.score.toLocaleString(),
                " pts"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50", children: [
                /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full", style: { background: "#10B981" } }),
                /* @__PURE__ */ jsx("span", { style: { color: "#64748B", fontSize: "11px", fontWeight: 600 }, children: sidebarUser.tier })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleLogout,
                  className: "p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors",
                  title: "Logout",
                  children: /* @__PURE__ */ jsx(LogIn, { className: "size-4 rotate-180" })
                }
              )
            ] })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      !isAuthPage && /* @__PURE__ */ jsxs(
        "header",
        {
          className: "md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20",
          style: { background: "#FFFFFF", borderBottom: "1px solid #E2E8F0" },
          children: [
            /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "size-8 rounded-lg flex items-center justify-center",
                  style: { background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)" },
                  children: /* @__PURE__ */ jsx(Zap, { className: "size-4 fill-white text-white" })
                }
              ),
              /* @__PURE__ */ jsx("span", { style: { fontWeight: 700, fontSize: 17, color: "#0F172A" }, children: "Nexus" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "size-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors",
                style: { color: "#475569" },
                children: /* @__PURE__ */ jsx(Bell, { className: "size-5" })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -8 },
          transition: { duration: 0.2 },
          className: "h-full",
          children: /* @__PURE__ */ jsx(Outlet, {})
        },
        path
      ) }) }),
      !isAuthPage && /* @__PURE__ */ jsx(
        "nav",
        {
          className: "md:hidden sticky bottom-0 grid grid-cols-4 z-20",
          style: { background: "#FFFFFF", borderTop: "1px solid #E2E8F0" },
          children: nav.filter((n) => {
            if (n.to === "/submit" && sidebarUser.tier === "Member") return false;
            if (n.to === "/admin") return false;
            return true;
          }).slice(0, 4).map((n) => {
            const active = path.startsWith(n.to);
            return /* @__PURE__ */ jsxs(
              Link,
              {
                to: n.to,
                className: "flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-semibold transition-colors",
                style: { color: active ? "#1E3A8A" : "#94A3B8" },
                children: [
                  /* @__PURE__ */ jsx(n.icon, { className: "size-5" }),
                  n.label
                ]
              },
              n.to
            );
          })
        }
      )
    ] })
  ] });
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function AppLayout() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(AppShell, {}),
    /* @__PURE__ */ jsx(Toaster, { theme: "dark", position: "top-right" })
  ] });
}
export {
  AppLayout as component
};
