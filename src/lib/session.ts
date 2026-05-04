import type { Member } from "@/lib/mock-data";

const STORAGE_KEY = "nexus_session_member";

/** Maps Django REST snake_case member payload to app Member shape */
export function memberFromApi(row: Record<string, unknown>): Member {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    handle: String(row.handle ?? ""),
    avatar: String(row.avatar ?? "NX"),
    expertise: Array.isArray(row.expertise) ? (row.expertise as string[]) : [],
    score: Number(row.score ?? 0),
    dealsClosed: Number(row.deals_closed ?? 0),
    successRate: Number(row.success_rate ?? 0),
    tier: (row.tier as Member["tier"]) ?? "Member",
    joined: String(row.joined ?? ""),
    email: row.email != null ? String(row.email) : undefined,
    company: row.company != null ? String(row.company) : undefined,
    profileLink: row.profile_link != null ? String(row.profile_link) : undefined,
  };
}

export function saveSessionMember(member: Member): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
}

export function loadSessionMember(): Member | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Member;
    if (!parsed?.id || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSessionMember(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
