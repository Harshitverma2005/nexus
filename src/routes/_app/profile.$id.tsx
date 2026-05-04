import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TrendingUp, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getOpportunities, getMember } from "@/lib/api";
import { loadSessionMember } from "@/lib/session";
import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/profile/$id")({
  component: MemberProfile,
});

const roleStyles = (role: string) => {
  switch (role) {
    case "Admin": return { bg: "#EFF6FF", text: "#1E3A8A", border: "#DBEAFE" };
    case "Manager": return { bg: "#ECFDF5", text: "#059669", border: "#D1FAE5" };
    default: return { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" };
  }
};

function RoleBadge({ role }: { role: string }) {
  const styles = roleStyles(role);
  return (
    <span className="text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider" 
          style={{ background: styles.bg, color: styles.text, borderColor: styles.border }}>
      {role}
    </span>
  );
}

function MemberProfile() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const me = loadSessionMember();
  const [activeTab, setActiveTab] = useState<"submissions" | "claims">("submissions");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["member", id],
    queryFn: () => getMember(id),
  });

  const { data: mySubmissionsRes } = useQuery({
    queryKey: ["my-submissions", id],
    queryFn: () => getOpportunities({ submitter: id }),
    enabled: !!id,
  });

  const { data: myClaimsRes } = useQuery({
    queryKey: ["my-claims", id],
    queryFn: () => getOpportunities({ claimant: id }),
    enabled: !!id,
  });

  if (userLoading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center text-red-500 font-bold">Member not found.</div>;

  const submissions = (mySubmissionsRes?.results || mySubmissionsRes || []) as any[];
  const claims = (myClaimsRes?.results || myClaimsRes || []) as any[];
  const tierProgress = user.tier === "Admin" ? 100 : user.tier === "Manager" ? 65 : 25;

  const getRank = (score: number) => {
    if (score >= 5000) return { label: "Diamond", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" };
    if (score >= 2000) return { label: "Gold", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
    if (score >= 500) return { label: "Silver", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
    return { label: "Bronze", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" };
  };
  const rank = getRank(user.score || 0);

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header Profile Section */}
      <div className="bg-white rounded-3xl border p-8 mb-8 relative overflow-hidden shadow-sm" style={{ borderColor: "#E2E8F0" }}>
        <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-2">
          <RoleBadge role={user.tier} />
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${rank.bg} ${rank.color} ${rank.border} flex items-center gap-1.5 shadow-sm`}>
            🏆 {(user.score || 0).toLocaleString()} pts • {rank.label}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="size-28 rounded-3xl bg-blue-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg ring-4 ring-blue-50">
            {user.avatar || user.name.charAt(0)}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{user.name}</h1>
            <div className="flex items-center gap-3 text-slate-500 text-sm mb-4">
              <span>{user.handle}</span>
              <span>•</span>
              <span>{user.company || "Independent Consultant"}</span>
              <span>•</span>
              <span>Joined {format(new Date(user.joined || user.date_joined || new Date()), "MMM yyyy")}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(user.expertise || []).map((e: string) => (
                <span key={e} className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
          <div className="flex gap-8 border-b mb-6" style={{ borderColor: "#E2E8F0" }}>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === "submissions" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Submissions ({submissions.length})
              {activeTab === "submissions" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab("claims")}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === "claims" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Active Claims ({claims.length})
              {activeTab === "claims" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === "submissions" && (
              submissions.length === 0 ? (
                <div className="text-center py-20 bg-white border rounded-3xl border-dashed border-slate-200">
                  <div className="text-slate-400 text-sm">No submissions yet.</div>
                </div>
              ) : (
                submissions.map((o) => (
                  <div key={o.id} className="bg-white border rounded-2xl p-5 hover:shadow-md transition-shadow" style={{ borderColor: "#E2E8F0" }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {o.channel_details ? (
                             <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-100 flex items-center gap-1">
                                ⬡ {o.channel_details.title}
                             </span>
                          ) : (
                             <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                🌐 Public
                             </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">#{o.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer text-lg" onClick={() => navigate({ to: `/opportunity/${o.id}` })}>
                          {o.title}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{o.description}</p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                        o.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        o.status === 'validated' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        o.status === 'in_progress' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {/* Insights: Who claimed this? */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                        <span>Claimants ({o.opportunity_claims?.length || 0})</span>
                      </div>
                      <div className="flex -space-x-2 overflow-hidden">
                        {(o.opportunity_claims || []).slice(0, 5).map((c: any) => (
                          <div 
                            key={c.id} 
                            className="inline-block size-7 rounded-full bg-blue-100 border-2 border-white text-[10px] flex items-center justify-center font-bold text-blue-600"
                            title={c.claimant_details.name}
                          >
                            {c.claimant_details.name.charAt(0)}
                          </div>
                        ))}
                        {o.opportunity_claims?.length > 5 && (
                          <div className="inline-block size-7 rounded-full bg-slate-200 border-2 border-white text-[10px] flex items-center justify-center font-bold text-slate-500">
                            +{o.opportunity_claims.length - 5}
                          </div>
                        )}
                        {o.opportunity_claims?.length === 0 && (
                          <span className="text-[10px] text-slate-300 italic">No claims yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === "claims" && (
              claims.length === 0 ? (
                <div className="text-center py-20 bg-white border rounded-3xl border-dashed border-slate-200">
                  <div className="text-slate-400 text-sm">No pitched for any opportunities yet.</div>
                </div>
              ) : (
                claims.map((o) => {
                  const myClaim = o.opportunity_claims?.find((c:any) => String(c.claimant) === String(user.id));
                  return (
                    <div key={o.id} className="bg-white border rounded-2xl p-5 hover:shadow-md transition-all group" style={{ borderColor: "#E2E8F0" }}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{o.category}</span>
                            {o.channel_details && (
                               <span className="text-[10px] font-bold text-violet-500">⬡ {o.channel_details.title}</span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer text-base leading-tight mb-2" onClick={() => navigate({ to: `/opportunity/${o.id}` })}>
                            {o.title}
                          </h4>
                          <div className="flex items-center gap-2">
                             <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                                <span className="text-[10px] font-bold text-slate-500">{o.submitter_details?.avatar || o.submitter_details?.name?.charAt(0)}</span>
                             </div>
                             <span className="text-[11px] text-slate-500 font-medium">From {o.submitter_details?.name}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border mb-2 inline-block ${
                            myClaim?.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            myClaim?.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {myClaim?.status === 'accepted' ? "Executor" : myClaim?.status || 'Pending'}
                          </div>
                          <div className="flex flex-col items-end">
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Opp Status</span>
                             <span className={`text-[11px] font-bold ${
                               o.status === 'closed' ? 'text-emerald-600' : 'text-slate-700'
                             }`}>{o.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
    </div>
  );
}
