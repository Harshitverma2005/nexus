import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { loadSessionMember } from "@/lib/session";

export const Route = createFileRoute("/_app/profile/")({
  component: ProfileHome,
});

function ProfileHome() {
  const navigate = useNavigate();
  const me = loadSessionMember();

  useEffect(() => {
    if (me) {
      navigate({ to: `/profile/${me.id}` });
    } else {
      navigate({ to: "/login" });
    }
  }, [me, navigate]);

  return <div className="p-8 text-center text-slate-400">Loading your profile...</div>;
}
