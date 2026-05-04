import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getChannels, getChannelMemberships, getOpportunities } from "@/lib/api";
import { Loader2, Users, ArrowLeft, Briefcase } from "lucide-react";
import { OpportunityCard } from "@/components/OpportunityCard";

export const Route = createFileRoute("/_app/channel/$id")({
  component: ChannelDetailScreen,
});

function ChannelDetailScreen() {
  const { id } = Route.useParams();

  // 1. Fetch channel metadata (we fetch all and filter since we don't have a specific getChannel(id) implemented yet)
  const { data: channelsData, isLoading: loadingChannel } = useQuery({
    queryKey: ["channels"],
    queryFn: getChannels,
  });
  
  const allChannels = Array.isArray(channelsData) ? channelsData : (channelsData?.results || []);
  const channel = allChannels.find((c: any) => String(c.id) === String(id));

  // 2. Fetch channel memberships to show members
  const { data: membershipsData, isLoading: loadingMembers } = useQuery({
    queryKey: ["channel-memberships-by-channel", id],
    queryFn: () => getChannelMemberships({ channel: id }),
    enabled: !!id
  });
  
  const memberships = Array.isArray(membershipsData) ? membershipsData : (membershipsData?.results || []);

  // 3. Fetch opportunities in this channel
  const { data: oppsData, isLoading: loadingOpps } = useQuery({
    queryKey: ["channel-opportunities", id],
    queryFn: () => getOpportunities({ channel: id, page_size: 10 }),
    enabled: !!id
  });
  
  const opportunities = Array.isArray(oppsData) ? oppsData : (oppsData?.results || []);

  if (loadingChannel) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="p-8 text-center text-red-500 font-medium">Channel not found.</div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* ── HEADER ── */}
      <div>
        <Link to="/channels" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium mb-4">
          <ArrowLeft className="size-4" /> Back to My Syndicates
        </Link>
        <div className="flex items-start gap-4">
          <div className="size-16 rounded-xl flex items-center justify-center text-xl font-bold bg-blue-50 text-blue-900 border border-blue-100">
            {channel.title.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{channel.title}</h1>
            <p className="text-slate-600 mt-1 max-w-2xl">{channel.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                ${channel.entry_fee} Entry
              </div>
              <div className="text-sm text-slate-500">
                Admin <span className="font-medium text-slate-700">{channel.admin_details?.name || "System"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN: INFO & MEMBERS ── */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 mb-4">
              <Users className="size-5 text-blue-600" /> Syndicate Members ({memberships.length})
            </h2>
            
            {loadingMembers ? (
              <div className="flex justify-center p-4"><Loader2 className="size-5 animate-spin text-slate-400" /></div>
            ) : memberships.length === 0 ? (
              <p className="text-sm text-slate-500">No members found.</p>
            ) : (
              <div className="space-y-3">
                {memberships.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-800">
                        {m.member_details?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{m.member_details?.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500">{m.member_details?.tier || "Active"}</p>
                      </div>
                    </div>
                    {m.member === channel.admin && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: FEED ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm min-h-[400px]">
             <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 mb-6">
              <Briefcase className="size-5 text-emerald-600" /> Exclusive Opportunities
            </h2>
            
            {loadingOpps ? (
              <div className="flex justify-center p-10"><Loader2 className="size-6 animate-spin text-slate-400" /></div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-10 rounded-lg border border-dashed border-slate-300 bg-slate-50">
                <p className="text-slate-600 font-medium">No opportunities listed yet.</p>
                <p className="text-sm text-slate-500 mt-1">Submit the first deal to this syndicate.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {opportunities.map((o: any, i: number) => (
                  <OpportunityCard key={o.id} opp={{ ...o, submitterId: o.submitter }} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
