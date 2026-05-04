import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, UserPlus } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerMember, RESOLVED_API_BASE } from "@/lib/api";
import { memberFromApi, saveSessionMember } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/register")({
  component: RegisterPage,
});

const expertiseOptions = [
  "IT",
  "Manufacturing",
  "Consulting",
  "SaaS",
  "Fintech",
  "Enterprise",
  "Marketing",
  "D2C",
  "Sales",
  "Investment",
] as const;

const schema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    company: z.string().min(1, "Company is required"),
    profile_link: z
      .string()
      .optional()
      .transform((v) => v?.trim() ?? "")
      .refine((v) => v === "" || z.string().url().safeParse(v).success, {
        message: "Enter a valid URL (LinkedIn or website)",
      }),
    expertise: z.array(z.string()).min(1, "Pick at least one expertise"),
    password: z.string().min(8, "Use at least 8 characters"),
    password_confirm: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords must match",
    path: ["password_confirm"],
  });

type FormValues = z.infer<typeof schema>;

function formatDrfValue(val: unknown): string {
  if (Array.isArray(val)) return val.map((x) => String(x)).join(" ");
  if (val && typeof val === "object") {
    return Object.values(val as Record<string, unknown>)
      .map((v) => formatDrfValue(v))
      .filter(Boolean)
      .join(" ");
  }
  return String(val ?? "");
}

function RegisterPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      profile_link: "",
      expertise: [],
      password: "",
      password_confirm: "",
    },
  });

  const selectedExpertise = form.watch("expertise");

  const toggleTag = (tag: string) => {
    const cur = form.getValues("expertise");
    const next = cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag];
    form.setValue("expertise", next, { shouldValidate: true });
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
        password_confirm: values.password_confirm,
      });
      const member = memberFromApi(raw);
      saveSessionMember(member);
      toast.success("Welcome to Nexus — your account is live.", {
        description: "You start as a Member tier until your first wins stack up.",
      });
      navigate({ to: "/feed" });
    } catch (err: unknown) {
      const keys = new Set(Object.keys(form.getValues())) as Set<string>;
      keys.add("password_confirm");

      if (axios.isAxiosError(err) && err.response == null) {
        toast.error("Cannot reach the API", {
          description: `Start the Django backend and confirm it matches ${RESOLVED_API_BASE} (or set VITE_API_BASE_URL). ${err.message}`,
        });
        return;
      }

      const rawData = axios.isAxiosError(err) ? err.response?.data : undefined;
      let firstMessage: string | null = null;
      let mappedFields = 0;

      if (typeof rawData === "string") {
        const hint =
          rawData.includes("ProgrammingError") ||
          rawData.includes("UndefinedColumn") ||
          rawData.includes("does not exist")
            ? "Database schema is out of date. Run migrations on the backend (e.g. docker compose exec backend python manage.py migrate) then retry."
            : rawData.replace(/<[^>]+>/g, " ").slice(0, 280).trim();
        firstMessage = hint || null;
      }

      const data =
        rawData && typeof rawData === "object" && !Array.isArray(rawData)
          ? (rawData as Record<string, unknown>)
          : undefined;

      if (data) {
        const record = data;

        if ("detail" in record && record.detail != null) {
          firstMessage = formatDrfValue(record.detail);
        }

        if (Array.isArray(record.non_field_errors)) {
          const msg = record.non_field_errors.map(String).join(" ");
          form.setError("root", { message: msg });
          firstMessage ??= msg;
        }

        for (const [key, val] of Object.entries(record)) {
          if (key === "detail" || key === "non_field_errors") continue;
          const msg = formatDrfValue(val);
          if (!msg) continue;
          if (keys.has(key)) {
            form.setError(key as keyof FormValues, { message: msg });
            mappedFields += 1;
            firstMessage ??= msg;
          } else {
            firstMessage ??= `${key}: ${msg}`;
          }
        }
      }

      const httpStatus = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (httpStatus != null && httpStatus >= 500) {
        toast.error(httpStatus === 503 ? "Backend database / migrations" : "Server error", {
          description:
            firstMessage ||
            err.message ||
            "Fix backend logs (often: apply migrations), then retry.",
        });
        return;
      }

      toast.error("Registration failed", {
        description:
          firstMessage ||
          (mappedFields > 0
            ? "Fix the highlighted fields below."
            : `Unexpected response. Check the browser Network tab for ${RESOLVED_API_BASE}/auth/register/`),
      });
    } finally {
      setSubmitting(false);
    }
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-24 top-24 size-[420px] rounded-full bg-primary/15 blur-[120px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 bottom-24 size-[380px] rounded-full bg-violet-500/15 blur-[110px]"
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-10 md:flex-row md:items-center md:gap-12 md:py-16 lg:gap-20">
        <motion.div
          className="mb-10 md:mb-0 md:flex-1"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Back to platform
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <Sparkles className="size-3.5" />
            Flow 1 · Member registration
          </div>
          <h1 className="mt-6 font-display text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
            Join the exchange.
          </h1>
          <p className="mt-4 max-w-md text-lg font-medium leading-relaxed text-muted-foreground">
            Create your Nexus profile. New members start on{" "}
            <span className="font-bold text-primary">Member</span> — prove traction and unlock Manager &
            Admin tiers.
          </p>
          <motion.ul
            className="mt-10 space-y-4 text-sm font-medium text-muted-foreground"
            initial="hidden"
            animate="show"
            variants={container}
          >
            {[
              "Structured deal flow — no WhatsApp noise.",
              "Reputation that compounds with every close.",
              "Expertise tags power matching & discovery.",
            ].map((text) => (
              <motion.li key={text} variants={item} className="flex items-start gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
                {text}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          className="w-full md:flex-1 md:max-w-lg"
          layout
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          <Card className="glass border-primary/15 shadow-2xl shadow-primary/10">
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
                  transition={{ duration: 0.45 }}
                  className="flex size-12 items-center justify-center rounded-2xl bg-gradient-neon text-white shadow-lg"
                >
                  <UserPlus className="size-6" />
                </motion.div>
                <div>
                  <CardTitle className="font-display text-2xl tracking-tight">Create account</CardTitle>
                  <CardDescription className="font-medium">
                    Full name, email, company, profile link, expertise & password.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-5">
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      autoComplete="name"
                      placeholder="Ada Lovelace"
                      className="h-11 rounded-xl border-border/60 bg-secondary/40 font-medium"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-xs font-medium text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </motion.div>

                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="h-11 rounded-xl border-border/60 bg-secondary/40 font-medium"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs font-medium text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </motion.div>

                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      autoComplete="organization"
                      placeholder="Acme Industries"
                      className="h-11 rounded-xl border-border/60 bg-secondary/40 font-medium"
                      {...form.register("company")}
                    />
                    {form.formState.errors.company && (
                      <p className="text-xs font-medium text-destructive">{form.formState.errors.company.message}</p>
                    )}
                  </motion.div>

                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="profile_link">Profile link (LinkedIn / website)</Label>
                    <Input
                      id="profile_link"
                      type="url"
                      placeholder="https://linkedin.com/in/you"
                      className="h-11 rounded-xl border-border/60 bg-secondary/40 font-medium"
                      {...form.register("profile_link")}
                    />
                    {form.formState.errors.profile_link && (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.profile_link.message}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={item} className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label>Expertise tags</Label>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {selectedExpertise.length} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {expertiseOptions.map((tag) => {
                        const on = selectedExpertise.includes(tag);
                        return (
                          <motion.button
                            key={tag}
                            type="button"
                            layout
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => toggleTag(tag)}
                            className={cn(
                              "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors",
                              on
                                ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                : "border-border/60 bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                            )}
                          >
                            {tag}
                          </motion.button>
                        );
                      })}
                    </div>
                    {form.formState.errors.expertise && (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.expertise.message}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        className="h-11 rounded-xl border-border/60 bg-secondary/40 font-medium"
                        {...form.register("password")}
                      />
                      {form.formState.errors.password && (
                        <p className="text-xs font-medium text-destructive">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password_confirm">Confirm password</Label>
                      <Input
                        id="password_confirm"
                        type="password"
                        autoComplete="new-password"
                        className="h-11 rounded-xl border-border/60 bg-secondary/40 font-medium"
                        {...form.register("password_confirm")}
                      />
                      {form.formState.errors.password_confirm && (
                        <p className="text-xs font-medium text-destructive">
                          {form.formState.errors.password_confirm.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                {form.formState.errors.root && (
                  <p className="text-center text-xs font-medium text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <motion.div layout className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full rounded-xl font-black shadow-xl shadow-primary/30"
                  >
                    {submitting ? (
                      "Creating account…"
                    ) : (
                      <>
                        Join Nexus <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                  <p className="mt-4 text-center text-xs font-medium text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-primary underline-offset-4 hover:underline">
                      Sign in
                    </Link>
                    {" · "}
                    <Link to="/feed" className="font-bold text-muted-foreground underline-offset-4 hover:underline">
                      Feed
                    </Link>
                  </p>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
