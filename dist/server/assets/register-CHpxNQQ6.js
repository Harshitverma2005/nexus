import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, UserPlus, ArrowRight } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, L as Label, I as Input, e as cn, B as Button } from "./label-BKPTcvSk.js";
import { r as registerMember, R as RESOLVED_API_BASE } from "./api-CCXKq01o.js";
import { m as memberFromApi, s as saveSessionMember } from "./session-CGLVuiYP.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "clsx";
import "tailwind-merge";
const expertiseOptions = ["IT", "Manufacturing", "Consulting", "SaaS", "Fintech", "Enterprise", "Marketing", "D2C", "Sales", "Investment"];
const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  company: z.string().min(1, "Company is required"),
  profile_link: z.string().optional().transform((v) => v?.trim() ?? "").refine((v) => v === "" || z.string().url().safeParse(v).success, {
    message: "Enter a valid URL (LinkedIn or website)"
  }),
  expertise: z.array(z.string()).min(1, "Pick at least one expertise"),
  password: z.string().min(8, "Use at least 8 characters"),
  password_confirm: z.string().min(8, "Confirm your password")
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords must match",
  path: ["password_confirm"]
});
function formatDrfValue(val) {
  if (Array.isArray(val)) return val.map((x) => String(x)).join(" ");
  if (val && typeof val === "object") {
    return Object.values(val).map((v) => formatDrfValue(v)).filter(Boolean).join(" ");
  }
  return String(val ?? "");
}
function RegisterPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      profile_link: "",
      expertise: [],
      password: "",
      password_confirm: ""
    }
  });
  const selectedExpertise = form.watch("expertise");
  const toggleTag = (tag) => {
    const cur = form.getValues("expertise");
    const next = cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag];
    form.setValue("expertise", next, {
      shouldValidate: true
    });
  };
  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const raw = await registerMember({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        company: values.company.trim(),
        profile_link: values.profile_link.trim(),
        expertise: values.expertise,
        password: values.password,
        password_confirm: values.password_confirm
      });
      const member = memberFromApi(raw);
      saveSessionMember(member);
      toast.success("Welcome to Nexus — your account is live.", {
        description: "You start as a Member tier until your first wins stack up."
      });
      navigate({
        to: "/feed"
      });
    } catch (err) {
      const keys = new Set(Object.keys(form.getValues()));
      keys.add("password_confirm");
      if (axios.isAxiosError(err) && err.response == null) {
        toast.error("Cannot reach the API", {
          description: `Start the Django backend and confirm it matches ${RESOLVED_API_BASE} (or set VITE_API_BASE_URL). ${err.message}`
        });
        return;
      }
      const rawData = axios.isAxiosError(err) ? err.response?.data : void 0;
      let firstMessage = null;
      let mappedFields = 0;
      if (typeof rawData === "string") {
        const hint = rawData.includes("ProgrammingError") || rawData.includes("UndefinedColumn") || rawData.includes("does not exist") ? "Database schema is out of date. Run migrations on the backend (e.g. docker compose exec backend python manage.py migrate) then retry." : rawData.replace(/<[^>]+>/g, " ").slice(0, 280).trim();
        firstMessage = hint || null;
      }
      const data = rawData && typeof rawData === "object" && !Array.isArray(rawData) ? rawData : void 0;
      if (data) {
        const record = data;
        if ("detail" in record && record.detail != null) {
          firstMessage = formatDrfValue(record.detail);
        }
        if (Array.isArray(record.non_field_errors)) {
          const msg = record.non_field_errors.map(String).join(" ");
          form.setError("root", {
            message: msg
          });
          firstMessage ??= msg;
        }
        for (const [key, val] of Object.entries(record)) {
          if (key === "detail" || key === "non_field_errors") continue;
          const msg = formatDrfValue(val);
          if (!msg) continue;
          if (keys.has(key)) {
            form.setError(key, {
              message: msg
            });
            mappedFields += 1;
            firstMessage ??= msg;
          } else {
            firstMessage ??= `${key}: ${msg}`;
          }
        }
      }
      const httpStatus = axios.isAxiosError(err) ? err.response?.status : void 0;
      if (httpStatus != null && httpStatus >= 500) {
        toast.error(httpStatus === 503 ? "Backend database / migrations" : "Server error", {
          description: firstMessage || err.message || "Fix backend logs (often: apply migrations), then retry."
        });
        return;
      }
      toast.error("Registration failed", {
        description: firstMessage || (mappedFields > 0 ? "Fix the highlighted fields below." : `Unexpected response. Check the browser Network tab for ${RESOLVED_API_BASE}/auth/register/`)
      });
    } finally {
      setSubmitting(false);
    }
  });
  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.08
      }
    }
  };
  const item = {
    hidden: {
      opacity: 0,
      y: 16
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0", children: [
      /* @__PURE__ */ jsx(motion.div, { className: "absolute -left-24 top-24 size-[420px] rounded-full bg-primary/15 blur-[120px]", animate: {
        scale: [1, 1.08, 1],
        opacity: [0.35, 0.55, 0.35]
      }, transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      } }),
      /* @__PURE__ */ jsx(motion.div, { className: "absolute -right-24 bottom-24 size-[380px] rounded-full bg-violet-500/15 blur-[110px]", animate: {
        scale: [1.05, 1, 1.05],
        opacity: [0.3, 0.5, 0.3]
      }, transition: {
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1
      } })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-10 md:flex-row md:items-center md:gap-12 md:py-16 lg:gap-20", children: [
      /* @__PURE__ */ jsxs(motion.div, { className: "mb-10 md:mb-0 md:flex-1", initial: {
        opacity: 0,
        x: -24
      }, animate: {
        opacity: 1,
        x: 0
      }, transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1]
      }, children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
          "Back to platform"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "size-3.5" }),
          "Flow 1 · Member registration"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "mt-6 font-display text-4xl font-black tracking-tight md:text-5xl lg:text-6xl", children: "Join the exchange." }),
        /* @__PURE__ */ jsxs("p", { className: "mt-4 max-w-md text-lg font-medium leading-relaxed text-muted-foreground", children: [
          "Create your Nexus profile. New members start on",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-bold text-primary", children: "Member" }),
          " — prove traction and unlock Manager & Admin tiers."
        ] }),
        /* @__PURE__ */ jsx(motion.ul, { className: "mt-10 space-y-4 text-sm font-medium text-muted-foreground", initial: "hidden", animate: "show", variants: container, children: ["Structured deal flow — no WhatsApp noise.", "Reputation that compounds with every close.", "Expertise tags power matching & discovery."].map((text) => /* @__PURE__ */ jsxs(motion.li, { variants: item, className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "mt-1.5 size-2 shrink-0 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" }),
          text
        ] }, text)) })
      ] }),
      /* @__PURE__ */ jsx(motion.div, { className: "w-full md:flex-1 md:max-w-lg", layout: true, initial: {
        opacity: 0,
        y: 28,
        scale: 0.98
      }, animate: {
        opacity: 1,
        y: 0,
        scale: 1
      }, transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.05
      }, children: /* @__PURE__ */ jsxs(Card, { className: "glass border-primary/15 shadow-2xl shadow-primary/10", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "space-y-1 pb-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(motion.div, { whileHover: {
            rotate: [0, -8, 8, 0],
            scale: 1.05
          }, transition: {
            duration: 0.45
          }, className: "flex size-12 items-center justify-center rounded-2xl bg-gradient-neon text-white shadow-lg", children: /* @__PURE__ */ jsx(UserPlus, { className: "size-6" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "font-display text-2xl tracking-tight", children: "Create account" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "font-medium", children: "Full name, email, company, profile link, expertise & password." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-5", children: [
          /* @__PURE__ */ jsxs(motion.div, { variants: container, initial: "hidden", animate: "show", className: "space-y-5", children: [
            /* @__PURE__ */ jsxs(motion.div, { variants: item, className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full name" }),
              /* @__PURE__ */ jsx(Input, { id: "name", autoComplete: "name", placeholder: "Ada Lovelace", className: "h-11 rounded-xl border-border/60 bg-secondary/40 font-medium", ...form.register("name") }),
              form.formState.errors.name && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-destructive", children: form.formState.errors.name.message })
            ] }),
            /* @__PURE__ */ jsxs(motion.div, { variants: item, className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
              /* @__PURE__ */ jsx(Input, { id: "email", type: "email", autoComplete: "email", placeholder: "you@company.com", className: "h-11 rounded-xl border-border/60 bg-secondary/40 font-medium", ...form.register("email") }),
              form.formState.errors.email && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-destructive", children: form.formState.errors.email.message })
            ] }),
            /* @__PURE__ */ jsxs(motion.div, { variants: item, className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "company", children: "Company" }),
              /* @__PURE__ */ jsx(Input, { id: "company", autoComplete: "organization", placeholder: "Acme Industries", className: "h-11 rounded-xl border-border/60 bg-secondary/40 font-medium", ...form.register("company") }),
              form.formState.errors.company && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-destructive", children: form.formState.errors.company.message })
            ] }),
            /* @__PURE__ */ jsxs(motion.div, { variants: item, className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "profile_link", children: "Profile link (LinkedIn / website)" }),
              /* @__PURE__ */ jsx(Input, { id: "profile_link", type: "url", placeholder: "https://linkedin.com/in/you", className: "h-11 rounded-xl border-border/60 bg-secondary/40 font-medium", ...form.register("profile_link") }),
              form.formState.errors.profile_link && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-destructive", children: form.formState.errors.profile_link.message })
            ] }),
            /* @__PURE__ */ jsxs(motion.div, { variants: item, className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx(Label, { children: "Expertise tags" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-black uppercase tracking-widest text-muted-foreground", children: [
                  selectedExpertise.length,
                  " selected"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: expertiseOptions.map((tag) => {
                const on = selectedExpertise.includes(tag);
                return /* @__PURE__ */ jsx(motion.button, { type: "button", layout: true, whileHover: {
                  scale: 1.04
                }, whileTap: {
                  scale: 0.96
                }, onClick: () => toggleTag(tag), className: cn("rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors", on ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25" : "border-border/60 bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"), children: tag }, tag);
              }) }),
              form.formState.errors.expertise && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-destructive", children: form.formState.errors.expertise.message })
            ] }),
            /* @__PURE__ */ jsxs(motion.div, { variants: item, className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
                /* @__PURE__ */ jsx(Input, { id: "password", type: "password", autoComplete: "new-password", className: "h-11 rounded-xl border-border/60 bg-secondary/40 font-medium", ...form.register("password") }),
                form.formState.errors.password && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-destructive", children: form.formState.errors.password.message })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "password_confirm", children: "Confirm password" }),
                /* @__PURE__ */ jsx(Input, { id: "password_confirm", type: "password", autoComplete: "new-password", className: "h-11 rounded-xl border-border/60 bg-secondary/40 font-medium", ...form.register("password_confirm") }),
                form.formState.errors.password_confirm && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-destructive", children: form.formState.errors.password_confirm.message })
              ] })
            ] })
          ] }),
          form.formState.errors.root && /* @__PURE__ */ jsx("p", { className: "text-center text-xs font-medium text-destructive", children: form.formState.errors.root.message }),
          /* @__PURE__ */ jsxs(motion.div, { layout: true, className: "pt-2", children: [
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, className: "h-12 w-full rounded-xl font-black shadow-xl shadow-primary/30", children: submitting ? "Creating account…" : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Join Nexus ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
            ] }) }),
            /* @__PURE__ */ jsxs("p", { className: "mt-4 text-center text-xs font-medium text-muted-foreground", children: [
              "Already have an account?",
              " ",
              /* @__PURE__ */ jsx(Link, { to: "/login", className: "font-bold text-primary underline-offset-4 hover:underline", children: "Sign in" }),
              " · ",
              /* @__PURE__ */ jsx(Link, { to: "/feed", className: "font-bold text-muted-foreground underline-offset-4 hover:underline", children: "Feed" })
            ] })
          ] })
        ] }) })
      ] }) })
    ] })
  ] });
}
export {
  RegisterPage as component
};
