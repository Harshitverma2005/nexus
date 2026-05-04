import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChannels, joinChannel, createChannel, getChannelMemberships } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { loadSessionMember } from "@/lib/session";

export const Route = createFileRoute("/_app/channels")({
  component: ChannelsScreen,
});

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } as any,
};

function ChannelsScreen() {
  const member = loadSessionMember();
  const queryClient = useQueryClient();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newChannel, setNewChannel] = useState({ title: "", description: "", entry_fee: "0.00" });

  const { data: response, isLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: () => getChannels(),
  });

  const { data: memberships } = useQuery({
    queryKey: ["channel-memberships", member?.id],
    queryFn: () => getChannelMemberships({ member: member?.id }),
    enabled: !!member?.id,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => createChannel({ ...payload, admin: String(member?.id) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["channel-memberships"] });
      setCreateModalOpen(false);
      setNewChannel({ title: "", description: "", entry_fee: "0.00" });
      toast.success("Channel created successfully!");
    }
  });

  const joinMutation = useMutation({
    mutationFn: (channelId: string) => joinChannel(channelId, String(member?.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["channel-memberships"] });
      toast.success("Successfully joined the syndicate!");
    },
    onSettled: () => setJoiningId(null)
  });

  const allChannels = Array.isArray(response) ? response : (response?.results || []);
  const joinedChannelIds = useMemo(() => {
    const list = Array.isArray(memberships) ? memberships : (memberships?.results || []);
    return new Set(list.map((m: any) => m.channel));
  }, [memberships]);

  const channels = useMemo(() => {
    return allChannels;
  }, [allChannels]);

  return (
    <div className="mx-auto max-w-5xl py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">Syndicate Networks</h1>
          <p className="text-muted-foreground text-lg">
            Discover and join exclusive networks on the platform.
          </p>
        </div>
        {member?.tier === "Admin" && (
          <button 
            onClick={() => {
               if (!member) toast.error("Please log in first.");
               else setCreateModalOpen(true);
            }}
            className="bg-secondary/40 text-secondary-foreground border border-border px-4 py-2 rounded-lg font-medium hover:bg-secondary/60 transition-colors"
          >
            + Create Channel
          </button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass p-6 rounded-2xl h-48 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {channels.map((ch: any) => (
            <motion.div
              key={ch.id}
              variants={itemVariants}
              className="glass p-6 rounded-2xl flex flex-col hover-lift-hover"
            >
              <Link to="/channel/$id" params={{ id: String(ch.id) }} className="block h-full cursor-pointer hover:no-underline">
                <div className="mb-4 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-foreground">{ch.title}</h3>
                    <span className="text-sm font-medium px-2 py-1 bg-violet/20 text-violet-300 rounded-md">
                      ${ch.entry_fee}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{ch.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Admin: {ch.admin_details?.name || "System"}
                  </div>
                  <div className="bg-primary/20 text-primary-300 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest border border-primary/20">
                    Joined
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {channels.length === 0 && (
            <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border border-dashed border-border/50">
              <p className="text-xl font-bold mb-2">No Syndicates Joined Yet</p>
              <p className="text-muted-foreground mb-8">Discover and join exclusive networks from the Live Feed.</p>
              <Link
                to="/feed"
                className="inline-flex px-8 py-3 bg-gradient-neon text-background font-black rounded-2xl hover:opacity-90 transition-all uppercase tracking-wider text-xs shadow-xl shadow-primary/20"
              >
                Go to Discovery →
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setCreateModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-6 glass rounded-2xl border border-neon/30 shadow-2xl"
            >
              <h2 className="text-2xl font-display font-bold mb-4">Create a Channel</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Channel Name</label>
                  <input
                    value={newChannel.title}
                    onChange={(e) => setNewChannel(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. NYC Tech CTOs"
                    className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-neon/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Description</label>
                  <textarea
                    value={newChannel.description}
                    onChange={(e) => setNewChannel(p => ({ ...p, description: e.target.value }))}
                    placeholder="Exclusive group for technology executives..."
                    className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-neon/50 h-24"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Entry Fee ($)</label>
                  <input
                    type="number"
                    value={newChannel.entry_fee}
                    onChange={(e) => setNewChannel(p => ({ ...p, entry_fee: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-neon/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newChannel.title) return toast.error("Title is required.");
                    createMutation.mutate(newChannel);
                  }}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 font-semibold bg-gradient-neon text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
