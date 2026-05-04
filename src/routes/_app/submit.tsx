import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Check, Loader2, ChevronDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { submitOpportunity, getChannels, getChannelMemberships } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { loadSessionMember } from "@/lib/session";

export const Route = createFileRoute("/_app/submit")({
  component: Submit,
});

const categories = ["SaaS", "Fintech", "D2C", "Enterprise", "Marketing", "Consulting", "IT", "Manufacturing"] as const;
const types = ["Referral", "Introduction", "Execution Ready"] as const;
const confidenceArr = ["Low", "Medium", "High"] as const;
const yesNo = ["Yes", "No"] as const;

// ── Custom styled dropdown (no native select) ──────────────────
function Dropdown({ value, options, onChange, placeholder }: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 transition-all"
        style={{
          height: 40,
          padding: "0 12px",
          borderRadius: 8,
          border: open ? "1px solid #0EA5E9" : "1px solid #E2E8F0",
          background: "#FFFFFF",
          color: value ? "#0F172A" : "#94A3B8",
          fontSize: 14,
          fontWeight: value ? 500 : 400,
          boxShadow: open ? "0 0 0 3px rgba(14,165,233,0.12)" : "none",
          cursor: "pointer",
        }}
      >
        <span>{value || placeholder || "Select..."}</span>
        <ChevronDown
          className="size-4 transition-transform shrink-0"
          style={{
            color: "#94A3B8",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          >
            {options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => { onChange(o); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors"
                style={{
                  color: value === o ? "#1E3A8A" : "#0F172A",
                  background: value === o ? "#EFF6FF" : "transparent",
                  fontWeight: value === o ? 600 : 400,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { if (value !== o) (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
                onMouseLeave={(e) => { if (value !== o) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {o}
                {value === o && <Check className="size-4 text-blue-700" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Pill toggle ────────────────────────────────────────────────
function Pills({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          style={{
            padding: "6px 16px",
            borderRadius: 40,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            border: `1px solid ${value === o ? "#1E3A8A" : "#E2E8F0"}`,
            background: value === o ? "#1E3A8A" : "#FFFFFF",
            color: value === o ? "#FFFFFF" : "#475569",
            transition: "all 0.15s",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={{ color: "#374151" }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs" style={{ color: "#94A3B8" }}>{hint}</p>}
    </div>
  );
}

function Submit() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [member, setMember] = useState<any>(() => loadSessionMember());
  const [memberId, setMemberId] = useState<string | null>(() => loadSessionMember()?.id || null);

  useEffect(() => {
    const mem = loadSessionMember();
    if (mem) { setMember(mem); setMemberId(mem.id); }
  }, []);

  const [form, setForm] = useState({
    title: "",
    category: "IT" as (typeof categories)[number],
    value: "",
    type: "Referral" as (typeof types)[number],
    confidence: "Medium" as (typeof confidenceArr)[number],
    timeline: "Yes" as (typeof yesNo)[number],
    decision_access: "Yes" as (typeof yesNo)[number],
    budget_clarity: "Yes" as (typeof yesNo)[number],
    description: "",
    channel: "",
  });

  const { data: channelsData } = useQuery({ queryKey: ["channels"], queryFn: getChannels });
  const { data: memberships } = useQuery({ 
    queryKey: ["memberships", memberId], 
    queryFn: () => getChannelMemberships({ member: memberId }),
    enabled: !!memberId 
  });

  const joinedChannelIds = (Array.isArray(memberships) ? memberships : (memberships?.results || [])).map((m: any) => String(m.channel));
  const channels = (Array.isArray(channelsData) ? channelsData : (channelsData?.results || [])).filter((c: any) => 
    member?.tier === "Admin" || joinedChannelIds.includes(String(c.id))
  );

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error("Please add an opportunity name."); return; }
    if (!memberId) { toast.error("You must be logged in."); return; }
    setIsSubmitting(true);
    try {
      await submitOpportunity({
        ...form,
        value: parseInt(form.value) || 0,
        submitter: parseInt(memberId),
        channel: form.channel ? parseInt(form.channel) : null,
        status: "pending",
      });
      toast.success("Opportunity submitted!", { description: "An admin will review within 24 hours." });
      navigate({ to: "/feed" });
    } catch (error: any) {
      toast.error("Submission failed", { description: error.response?.data?.detail || "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Member Gate ───────────────────────────────────────────
  if (member && member.tier === "Member") {
    return (
      <div className="p-6 md:p-12 max-w-xl mx-auto">
        <div
          className="rounded-xl border p-8 text-center"
          style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
        >
          <AlertCircle className="size-12 mx-auto mb-4" style={{ color: "#F59E0B" }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: "#0F172A" }}>Reputation Required</h2>
          <p className="text-sm mb-6" style={{ color: "#475569" }}>
            Your account is currently a <strong style={{ color: "#B45309" }}>Member</strong> tier.
            Only Managers and Admins can submit new opportunities.
          </p>
          <Link
            to="/feed"
            className="btn-primary"
            style={{ display: "inline-flex", margin: "0 auto" }}
          >
            Browse Available Deals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
          style={{ background: "#EFF6FF", color: "#1E3A8A" }}
        >
          <Sparkles className="size-3" />
          New Opportunity
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#0F172A" }}>Submit an Exchange</h1>
        <p className="text-sm" style={{ color: "#475569" }}>Step {step} of 3</p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: "#E2E8F0" }}
          >
            <motion.div
              initial={false}
              animate={{ width: s <= step ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #1E3A8A, #0EA5E9)" }}
            />
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ── Step 1 ── */}
              {step === 1 && (
                <>
                  <Field label="Opportunity Name *">
                    <input
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder="e.g. Enterprise Cloud Infrastructure Deal"
                      className="input-field"
                    />
                  </Field>
                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Category">
                      <Dropdown value={form.category} options={[...categories]} onChange={(v) => set("category", v as never)} />
                    </Field>
                    <Field label="Type">
                      <Dropdown value={form.type} options={[...types]} onChange={(v) => set("type", v as never)} />
                    </Field>
                  </div>
                  <Field label="Opportunity Visibility" hint={member?.tier === "Admin" ? "Admins can post to any channel or Public" : "Select 'Public' or one of your Syndicates"}>
                    <select
                      value={form.channel}
                      onChange={(e) => set("channel", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="">Public / Open Network</option>
                      {channels.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Brief Description">
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      rows={4}
                      placeholder="Provide context for validators — company stage, deal scope, urgency..."
                      className="input-field"
                      style={{ height: "auto" }}
                    />
                  </Field>
                </>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <>
                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Estimated Value (USD)">
                      <div className="relative">
                        <span
                          className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold"
                          style={{ color: "#059669", fontSize: 14 }}
                        >$</span>
                        <input
                          type="number"
                          value={form.value}
                          onChange={(e) => set("value", e.target.value)}
                          placeholder="120000"
                          className="input-field"
                          style={{ paddingLeft: 24 }}
                        />
                      </div>
                    </Field>
                    <Field label="Confidence Level">
                      <Pills value={form.confidence} options={[...confidenceArr]} onChange={(v) => set("confidence", v as never)} />
                    </Field>
                  </div>
                  <div
                    className="rounded-lg p-5 space-y-5"
                    style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>Qualification Indicators</p>
                    <div className="grid grid-cols-3 gap-5">
                      <Field label="Timeline Defined?">
                        <Pills value={form.timeline} options={[...yesNo]} onChange={(v) => set("timeline", v as never)} />
                      </Field>
                      <Field label="Decision Access?">
                        <Pills value={form.decision_access} options={[...yesNo]} onChange={(v) => set("decision_access", v as never)} />
                      </Field>
                      <Field label="Budget Clarity?">
                        <Pills value={form.budget_clarity} options={[...yesNo]} onChange={(v) => set("budget_clarity", v as never)} />
                      </Field>
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 3 ── */}
              {step === 3 && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#475569" }}>Review Before Submitting</p>
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ["Opportunity", form.title || "—"],
                          ["Category", form.category],
                          ["Type", form.type],
                          ["Projected Value", form.value ? `$${Number(form.value).toLocaleString()}` : "—"],
                          ["Confidence", form.confidence],
                          ["Timeline", form.timeline],
                          ["Decision Access", form.decision_access],
                          ["Budget Clarity", form.budget_clarity],
                          ["Network", channels.find((c: any) => String(c.id) === String(form.channel))?.title || "Public / Open Network"],
                        ].map(([k, v]) => (
                          <tr key={k} style={{ borderBottom: "1px solid #F1F5F9" }}>
                            <td className="py-2.5 pr-4 font-medium" style={{ color: "#475569", width: "40%" }}>{k}</td>
                            <td className="py-2.5 font-semibold" style={{ color: "#0F172A" }}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    className="rounded-lg p-4 flex gap-3 items-start"
                    style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
                  >
                    <Check className="size-5 shrink-0 mt-0.5" style={{ color: "#10B981" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#065F46" }}>Ready to Submit</p>
                      <p className="text-xs mt-0.5" style={{ color: "#047857" }}>
                        This opportunity will enter the validation queue. Admins review within 24 hours.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div
          className="flex items-center justify-between px-6 md:px-8 py-4"
          style={{ borderTop: "1px solid #F1F5F9" }}
        >
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || isSubmitting}
            className="btn-secondary disabled:opacity-40"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-success disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Submitting...</> : <>Submit to Network <Check className="size-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
