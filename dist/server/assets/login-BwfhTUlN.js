import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, LogIn, ArrowRight } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, L as Label, I as Input, B as Button } from "./label-BKPTcvSk.js";
import { l as loginMember, R as RESOLVED_API_BASE } from "./api-CCXKq01o.js";
import { m as memberFromApi, s as saveSessionMember } from "./session-CGLVuiYP.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "clsx";
import "tailwind-merge";
const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password")
});
function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const raw = await loginMember({
        email: values.email.trim().toLowerCase(),
        password: values.password
      });
      const member = memberFromApi(raw);
      saveSessionMember(member);
      toast.success(`Welcome back, ${member.name.split(" ")[0]}`, {
        description: `${member.tier} · ${member.score.toLocaleString()} pts`
      });
      navigate({
        to: "/feed"
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response == null) {
        toast.error("Cannot reach the API", {
          description: `Confirm backend is running and matches ${RESOLVED_API_BASE} (or set VITE_API_BASE_URL). ${err.message}`
        });
        return;
      }
      const data = axios.isAxiosError(err) ? err.response?.data : void 0;
      const detail = data && typeof data === "object" && "detail" in data ? String(data.detail) : null;
      toast.error("Sign-in failed", {
        description: detail || "Check your email and password."
      });
    } finally {
      setSubmitting(false);
    }
  });
  const item = {
    hidden: {
      opacity: 0,
      y: 12
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0", children: /* @__PURE__ */ jsx(motion.div, { className: "absolute right-0 top-32 size-[360px] rounded-full bg-primary/12 blur-[100px]", animate: {
      opacity: [0.25, 0.45, 0.25]
    }, transition: {
      duration: 8,
      repeat: Infinity
    } }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
        "Back to platform"
      ] }),
      /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        y: 16
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        duration: 0.45
      }, className: "mb-6 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex size-11 items-center justify-center rounded-2xl bg-gradient-neon text-white shadow-lg", children: /* @__PURE__ */ jsx(Zap, { className: "size-6 fill-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "font-display text-2xl font-black tracking-tight", children: "Sign in" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Use the email and password you registered with." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "glass border-primary/15 shadow-2xl shadow-primary/10", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary", children: /* @__PURE__ */ jsx(LogIn, { className: "size-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "font-display text-xl", children: "Welcome back" }),
            /* @__PURE__ */ jsx(CardDescription, { className: "font-medium", children: "Nexus Exchange member login" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-5", children: [
          /* @__PURE__ */ jsxs(motion.div, { variants: item, initial: "hidden", animate: "show", className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "login-email", children: "Email" }),
              /* @__PURE__ */ jsx(Input, { id: "login-email", type: "email", autoComplete: "email", className: "h-11 rounded-xl border-border/60 bg-secondary/40 font-medium", ...form.register("email") }),
              form.formState.errors.email && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-destructive", children: form.formState.errors.email.message })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "login-password", children: "Password" }),
              /* @__PURE__ */ jsx(Input, { id: "login-password", type: "password", autoComplete: "current-password", className: "h-11 rounded-xl border-border/60 bg-secondary/40 font-medium", ...form.register("password") }),
              form.formState.errors.password && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-destructive", children: form.formState.errors.password.message })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, className: "h-12 w-full rounded-xl font-black shadow-xl shadow-primary/25", children: submitting ? "Signing in…" : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Continue ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
          ] }) }),
          /* @__PURE__ */ jsxs("p", { className: "text-center text-sm font-medium text-muted-foreground", children: [
            "New here?",
            " ",
            /* @__PURE__ */ jsx(Link, { to: "/register", className: "font-bold text-primary underline-offset-4 hover:underline", children: "Create an account" })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
