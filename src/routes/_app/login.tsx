import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, LogIn, Zap } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginMember, RESOLVED_API_BASE } from "@/lib/api";
import { memberFromApi, saveSessionMember } from "@/lib/session";

export const Route = createFileRoute("/_app/login")({
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const raw = await loginMember({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      const member = memberFromApi(raw);
      saveSessionMember(member);
      toast.success(`Welcome back, ${member.name.split(" ")[0]}`, {
        description: `${member.tier} · ${member.score.toLocaleString()} pts`,
      });
      navigate({ to: "/feed" });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response == null) {
        toast.error("Cannot reach the API", {
          description: `Confirm backend is running and matches ${RESOLVED_API_BASE} (or set VITE_API_BASE_URL). ${err.message}`,
        });
        return;
      }
      const data = axios.isAxiosError(err) ? err.response?.data : undefined;
      const detail =
        data && typeof data === "object" && "detail" in data
          ? String((data as { detail: unknown }).detail)
          : null;
      toast.error("Sign-in failed", {
        description: detail || "Check your email and password.",
      });
    } finally {
      setSubmitting(false);
    }
  });

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute right-0 top-32 size-[360px] rounded-full bg-primary/12 blur-[100px]"
          animate={{ opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to platform
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 flex items-center gap-3"
        >
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-neon text-white shadow-lg">
            <Zap className="size-6 fill-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight">Sign in</h1>
            <p className="text-sm font-medium text-muted-foreground">Use the email and password you registered with.</p>
          </div>
        </motion.div>

        <Card className="glass border-primary/15 shadow-2xl shadow-primary/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <LogIn className="size-5" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Welcome back</CardTitle>
                <CardDescription className="font-medium">Nexus Exchange member login</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <motion.div variants={item} initial="hidden" animate="show" className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    className="h-11 rounded-xl border-border/60 bg-secondary/40 font-medium"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs font-medium text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    className="h-11 rounded-xl border-border/60 bg-secondary/40 font-medium"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <p className="text-xs font-medium text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>
              </motion.div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-xl font-black shadow-xl shadow-primary/25"
              >
                {submitting ? "Signing in…" : <>Continue <ArrowRight className="size-4" /></>}
              </Button>

              <p className="text-center text-sm font-medium text-muted-foreground">
                New here?{" "}
                <Link to="/register" className="font-bold text-primary underline-offset-4 hover:underline">
                  Create an account
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
