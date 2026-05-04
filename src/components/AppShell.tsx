import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Home, PlusCircle, Trophy, User, Zap, Bell, Users, Shield, LogIn
} from "lucide-react";
import { useEffect, useState } from "react";
import { currentUser } from "@/lib/mock-data";
import type { Member } from "@/lib/mock-data";
import { loadSessionMember, clearSessionMember } from "@/lib/session";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationsRead } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const nav = [
  { to: "/feed",        label: "Home",        icon: Home },
  { to: "/channels",    label: "Channels",    icon: Users },
  { to: "/submit",      label: "Submit",      icon: PlusCircle },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin",       label: "Admin",       icon: Shield },
  { to: "/profile",     label: "Profile",     icon: User },
];

const dummyUser: Member = { id: "", name: "Guest", handle: "", avatar: "G", expertise: [], score: 0, dealsClosed: 0, successRate: 0, tier: "Member", joined: "" };

export function AppShell() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarUser, setSidebarUser] = useState<Member>(() => loadSessionMember() ?? dummyUser);

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

  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notificationsRes } = useQuery({
    queryKey: ["notifications", sidebarUser?.id],
    queryFn: () => getNotifications({ member: sidebarUser?.id, ordering: "-created_at", page_size: 10 }),
    enabled: !!sidebarUser?.id,
    refetchInterval: 30000, // Refetch every 30s
  });

  const notifications = (Array.isArray(notificationsRes) ? notificationsRes : notificationsRes?.results || []) as any[];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markReadMutation = useMutation({
    mutationFn: () => markNotificationsRead(sidebarUser.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", sidebarUser?.id] });
    }
  });

  const handleMarkRead = () => {
    markReadMutation.mutate();
    setShowNotifications(false);
  };

  const tierColor = (tier: string) => {
    if (tier === "Member") {
      return { bg: "#FFFBEB", text: "#B45309" }; // Member/old Probation = amber
    }
    if (tier === "Manager") {
      return { bg: "#ECFDF5", text: "#059669" }; // Manager/old Active = emerald
    }
    if (tier === "Admin") {
      return { bg: "#EFF6FF", text: "#1E3A8A" }; // Admin = deep blue
    }
    return { bg: "#F1F5F9", text: "#475569" };
  };

  return (
    <div className="min-h-screen flex w-full" style={{ background: "#F8FAFC", color: "#0F172A" }}>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      {!isAuthPage && (
        <aside
          className="hidden md:flex flex-col w-60 sticky top-0 h-screen"
          style={{
            background: "#FFFFFF",
            borderRight: "1px solid #E2E8F0",
          }}
        >
          {/* Logo */}
          <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid #E2E8F0" }}>
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="size-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)" }}
              >
                <Zap className="size-5 fill-white text-white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#0F172A", lineHeight: "1.2" }}>Nexus</div>
                <div style={{ fontWeight: 600, fontSize: 10, color: "#0EA5E9", letterSpacing: "0.12em", textTransform: "uppercase" }}>Exchange</div>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
            {nav.map((n) => {
              const active = path.startsWith(n.to);
              // Hide Submit for Member
              if (n.to === "/submit" && sidebarUser.tier === "Member") return null;
              // Hide Admin panel unless Admin
              if (n.to === "/admin" && sidebarUser.tier !== "Admin") return null;

              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: active ? "#EFF6FF" : "transparent",
                    color: active ? "#1E3A8A" : "#475569",
                    fontWeight: active ? 600 : 500,
                    borderLeft: active ? "3px solid #1E3A8A" : "3px solid transparent",
                  }}
                >
                  <n.icon className="size-[18px]" style={{ color: active ? "#1E3A8A" : "#94A3B8" }} />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* User Footer */}
          <div className="p-4 mt-auto">
            <div className="bg-white rounded-xl border p-3 flex items-center gap-3" style={{ borderColor: "#E2E8F0" }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{ background: "#EFF6FF", color: "#1D4ED8" }}
              >
                {sidebarUser.avatar || sidebarUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate" style={{ color: "#0F172A", fontSize: "15px" }}>
                  {sidebarUser.name}
                </div>
                <div className="font-bold text-sm" style={{ color: "#1E3A8A" }}>
                  {sidebarUser.score.toLocaleString()} pts
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#10B981" }}></span>
                  <span style={{ color: "#64748B", fontSize: "11px", fontWeight: 600 }}>{sidebarUser.tier}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogIn className="size-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header for Notifications and Global Search/Info (Desktop) */}
        {!isAuthPage && (
          <header className="hidden md:flex items-center justify-end px-8 py-4 bg-white border-b sticky top-0 z-30" style={{ borderColor: "#E2E8F0" }}>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors"
                style={{ color: "#475569" }}
              >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden"
                      style={{ borderColor: "#E2E8F0" }}
                    >
                      <div className="px-4 py-3 border-b flex items-center justify-between bg-slate-50" style={{ borderColor: "#E2E8F0" }}>
                        <span className="font-bold text-sm text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkRead}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-slate-400 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                if (n.opportunity) {
                                  navigate({ to: `/opportunity/${n.opportunity}` });
                                  setShowNotifications(false);
                                }
                              }}
                              className="px-4 py-3 border-b last:border-b-0 hover:bg-slate-50 transition-colors cursor-pointer"
                              style={{ borderColor: "#F1F5F9" }}
                            >
                              <div className="flex gap-3">
                                <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  n.type === 'deal_closed' ? 'bg-emerald-100 text-emerald-600' :
                                  n.type === 'claim_accepted' ? 'bg-blue-100 text-blue-600' :
                                  'bg-amber-100 text-amber-600'
                                }`}>
                                  {n.type === 'deal_closed' ? <Trophy className="size-4" /> : 
                                   n.type === 'claim_accepted' ? <Zap className="size-4" /> : 
                                   <Users className="size-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-bold text-slate-900 leading-tight">{n.title}</div>
                                  <div className="text-[12px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</div>
                                  <div className="text-[10px] text-slate-400 mt-1">
                                    {formatDistanceToNow(new Date(n.created_at || new Date()))} ago
                                  </div>
                                </div>
                                {!n.is_read && (
                                  <div className="size-2 rounded-full bg-blue-500 mt-1.5" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </header>
        )}
        {/* Mobile Top Bar */}
        {!isAuthPage && (
          <header
            className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20"
            style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}
          >
            <Link to="/" className="flex items-center gap-2">
              <div
                className="size-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1E3A8A, #0EA5E9)" }}
              >
                <Zap className="size-4 fill-white text-white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 17, color: "#0F172A" }}>Nexus</span>
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="size-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                style={{ color: "#475569" }}
              >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 size-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
                     <div className="px-4 py-2 border-b bg-slate-50 flex items-center justify-between">
                        <span className="text-xs font-bold">Notifications</span>
                        <button onClick={handleMarkRead} className="text-[10px] text-blue-600 font-bold">Clear</button>
                     </div>
                     <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                           <div className="p-4 text-center text-xs text-slate-400">No updates</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="p-3 border-b border-slate-50 flex gap-2" onClick={() => { if(n.opportunity) { navigate({to: `/opportunity/${n.opportunity}`}); setShowNotifications(false); } }}>
                               <div className="size-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                  <Bell className="size-3" />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-bold truncate">{n.title}</div>
                                  <div className="text-[10px] text-slate-500 line-clamp-1">{n.message}</div>
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        {!isAuthPage && (
          <nav
            className="md:hidden sticky bottom-0 grid grid-cols-4 z-20"
            style={{ background: "#FFFFFF", borderTop: "1px solid #E2E8F0" }}
          >
            {nav.filter((n) => {
              if (n.to === "/submit" && sidebarUser.tier === "Member") return false;
              if (n.to === "/admin") return false; // hide on mobile
              return true;
            }).slice(0, 4).map((n) => {
              const active = path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className="flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-semibold transition-colors"
                  style={{ color: active ? "#1E3A8A" : "#94A3B8" }}
                >
                  <n.icon className="size-5" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
