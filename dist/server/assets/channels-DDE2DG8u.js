import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { g as getChannels, b as getChannelMemberships, d as createChannel, j as joinChannel } from "./api-CCXKq01o.js";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { l as loadSessionMember } from "./session-CGLVuiYP.js";
import "axios";
const containerVariants = {
  hidden: {
    opacity: 0
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};
function ChannelsScreen() {
  const member = loadSessionMember();
  const queryClient = useQueryClient();
  const [joiningId, setJoiningId] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newChannel, setNewChannel] = useState({
    title: "",
    description: "",
    entry_fee: "0.00"
  });
  const {
    data: response,
    isLoading
  } = useQuery({
    queryKey: ["channels"],
    queryFn: () => getChannels()
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
  const createMutation = useMutation({
    mutationFn: (payload) => createChannel({
      ...payload,
      admin: String(member?.id)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channels"]
      });
      queryClient.invalidateQueries({
        queryKey: ["channel-memberships"]
      });
      setCreateModalOpen(false);
      setNewChannel({
        title: "",
        description: "",
        entry_fee: "0.00"
      });
      toast.success("Channel created successfully!");
    }
  });
  useMutation({
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
  const allChannels = Array.isArray(response) ? response : response?.results || [];
  const joinedChannelIds = useMemo(() => {
    const list = Array.isArray(memberships) ? memberships : memberships?.results || [];
    return new Set(list.map((m) => m.channel));
  }, [memberships]);
  const channels = useMemo(() => {
    return allChannels.filter((ch) => joinedChannelIds.has(ch.id) || ch.admin === member?.id);
  }, [allChannels, joinedChannelIds, member?.id]);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl py-8 px-4", children: [
    /* @__PURE__ */ jsxs(motion.div, { initial: {
      opacity: 0,
      y: -20
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-display font-bold text-gradient mb-2", children: "My Syndicates" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: "Exclusive networks you are a member of or managing." })
      ] }),
      member?.tier !== "Probation" && /* @__PURE__ */ jsx("button", { onClick: () => {
        if (!member) toast.error("Please log in first.");
        else setCreateModalOpen(true);
      }, className: "bg-secondary/40 text-secondary-foreground border border-border px-4 py-2 rounded-lg font-medium hover:bg-secondary/60 transition-colors", children: "+ Create Channel" })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "glass p-6 rounded-2xl h-48 animate-pulse bg-white/5" }, i)) }) : /* @__PURE__ */ jsxs(motion.div, { variants: containerVariants, initial: "hidden", animate: "show", className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
      channels.map((ch) => /* @__PURE__ */ jsx(motion.div, { variants: itemVariants, className: "glass p-6 rounded-2xl flex flex-col hover-lift-hover", children: /* @__PURE__ */ jsxs(Link, { to: "/channel/$id", params: {
        id: String(ch.id)
      }, className: "block h-full cursor-pointer hover:no-underline", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-foreground", children: ch.title }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium px-2 py-1 bg-violet/20 text-violet-300 rounded-md", children: [
              "$",
              ch.entry_fee
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground line-clamp-3", children: ch.description })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Admin: ",
            ch.admin_details?.name || "System"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "bg-primary/20 text-primary-300 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest border border-primary/20", children: "Joined" })
        ] })
      ] }) }, ch.id)),
      channels.length === 0 && /* @__PURE__ */ jsxs("div", { className: "col-span-full py-20 text-center glass rounded-[2.5rem] border border-dashed border-border/50", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xl font-bold mb-2", children: "No Syndicates Joined Yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-8", children: "Discover and join exclusive networks from the Live Feed." }),
        /* @__PURE__ */ jsx(Link, { to: "/feed", className: "inline-flex px-8 py-3 bg-gradient-neon text-background font-black rounded-2xl hover:opacity-90 transition-all uppercase tracking-wider text-xs shadow-xl shadow-primary/20", children: "Go to Discovery →" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: isCreateModalOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, exit: {
        opacity: 0
      }, className: "fixed inset-0 bg-background/80 backdrop-blur-sm z-40", onClick: () => setCreateModalOpen(false) }),
      /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        scale: 0.95
      }, animate: {
        opacity: 1,
        scale: 1
      }, exit: {
        opacity: 0,
        scale: 0.95
      }, className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-6 glass rounded-2xl border border-neon/30 shadow-2xl", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-display font-bold mb-4", children: "Create a Channel" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold mb-1 block", children: "Channel Name" }),
            /* @__PURE__ */ jsx("input", { value: newChannel.title, onChange: (e) => setNewChannel((p) => ({
              ...p,
              title: e.target.value
            })), placeholder: "e.g. NYC Tech CTOs", className: "w-full bg-background border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-neon/50" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold mb-1 block", children: "Description" }),
            /* @__PURE__ */ jsx("textarea", { value: newChannel.description, onChange: (e) => setNewChannel((p) => ({
              ...p,
              description: e.target.value
            })), placeholder: "Exclusive group for technology executives...", className: "w-full bg-background border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-neon/50 h-24" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold mb-1 block", children: "Entry Fee ($)" }),
            /* @__PURE__ */ jsx("input", { type: "number", value: newChannel.entry_fee, onChange: (e) => setNewChannel((p) => ({
              ...p,
              entry_fee: e.target.value
            })), className: "w-full bg-background border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-neon/50" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end mt-6", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setCreateModalOpen(false), className: "px-4 py-2 font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors", children: "Cancel" }),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            if (!newChannel.title) return toast.error("Title is required.");
            createMutation.mutate(newChannel);
          }, disabled: createMutation.isPending, className: "px-4 py-2 font-semibold bg-gradient-neon text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50", children: createMutation.isPending ? "Creating..." : "Create" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ChannelsScreen as component
};
