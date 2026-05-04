import { jsx, jsxs } from "react/jsx-runtime";
import { createRootRoute, Outlet, Link, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter, useRouter } from "@tanstack/react-router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { z } from "zod";
const appCss = "/assets/styles-B-lYD9w9.css";
const queryClient = new QueryClient();
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center glass rounded-2xl p-10", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-display font-bold text-gradient", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Opportunity not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Maybe it was already claimed." }),
    /* @__PURE__ */ jsx(
      Link,
      {
        to: "/feed",
        className: "mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-neon px-5 py-2.5 text-sm font-semibold text-background glow-neon",
        children: "Back to feed"
      }
    )
  ] }) });
}
const Route$c = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nexus Exchange Hub" },
      { name: "description", content: "Submit, claim, and close opportunities with your professional network." }
    ],
    links: [{ rel: "stylesheet", href: appCss }, { rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" }]
  }),
  shellComponent: RootShell,
  component: () => /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(Outlet, {}) }),
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$b = () => import("./_app-DwvH-iRw.js");
const Route$b = createFileRoute("/_app")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./index-DcJTYjSL.js");
const Route$a = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./submit-DwZz9hWZ.js");
const Route$9 = createFileRoute("/_app/submit")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./register-CHpxNQQ6.js");
const Route$8 = createFileRoute("/_app/register")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
z.object({
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
const $$splitComponentImporter$7 = () => import("./profile-BkDuYZga.js");
const Route$7 = createFileRoute("/_app/profile")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./login-BwfhTUlN.js");
const Route$6 = createFileRoute("/_app/login")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password")
});
const $$splitComponentImporter$5 = () => import("./leaderboard-BuP6UbJr.js");
const Route$5 = createFileRoute("/_app/leaderboard")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./feed-DMXjXzba.js");
const Route$4 = createFileRoute("/_app/feed")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./channels-DDE2DG8u.js");
const Route$3 = createFileRoute("/_app/channels")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin-Da3XuscO.js");
const Route$2 = createFileRoute("/_app/admin")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./opportunity._id-CxouaJpQ.js");
const Route$1 = createFileRoute("/_app/opportunity/$id")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./channel._id-DHoWYWX0.js");
const Route = createFileRoute("/_app/channel/$id")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const AppRoute = Route$b.update({
  id: "/_app",
  getParentRoute: () => Route$c
});
const IndexRoute = Route$a.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$c
});
const AppSubmitRoute = Route$9.update({
  id: "/submit",
  path: "/submit",
  getParentRoute: () => AppRoute
});
const AppRegisterRoute = Route$8.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => AppRoute
});
const AppProfileRoute = Route$7.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => AppRoute
});
const AppLoginRoute = Route$6.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => AppRoute
});
const AppLeaderboardRoute = Route$5.update({
  id: "/leaderboard",
  path: "/leaderboard",
  getParentRoute: () => AppRoute
});
const AppFeedRoute = Route$4.update({
  id: "/feed",
  path: "/feed",
  getParentRoute: () => AppRoute
});
const AppChannelsRoute = Route$3.update({
  id: "/channels",
  path: "/channels",
  getParentRoute: () => AppRoute
});
const AppAdminRoute = Route$2.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => AppRoute
});
const AppOpportunityIdRoute = Route$1.update({
  id: "/opportunity/$id",
  path: "/opportunity/$id",
  getParentRoute: () => AppRoute
});
const AppChannelIdRoute = Route.update({
  id: "/channel/$id",
  path: "/channel/$id",
  getParentRoute: () => AppRoute
});
const AppRouteChildren = {
  AppAdminRoute,
  AppChannelsRoute,
  AppFeedRoute,
  AppLeaderboardRoute,
  AppLoginRoute,
  AppProfileRoute,
  AppRegisterRoute,
  AppSubmitRoute,
  AppChannelIdRoute,
  AppOpportunityIdRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren
};
const routeTree = Route$c._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({ error, reset }) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$1 as R,
  Route as a,
  router as r
};
