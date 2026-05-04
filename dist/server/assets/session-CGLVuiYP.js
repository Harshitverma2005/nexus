const STORAGE_KEY = "nexus_session_member";
function memberFromApi(row) {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    handle: String(row.handle ?? ""),
    avatar: String(row.avatar ?? "NX"),
    expertise: Array.isArray(row.expertise) ? row.expertise : [],
    score: Number(row.score ?? 0),
    dealsClosed: Number(row.deals_closed ?? 0),
    successRate: Number(row.success_rate ?? 0),
    tier: row.tier ?? "Member",
    joined: String(row.joined ?? ""),
    email: row.email != null ? String(row.email) : void 0,
    company: row.company != null ? String(row.company) : void 0,
    profileLink: row.profile_link != null ? String(row.profile_link) : void 0
  };
}
function saveSessionMember(member) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
}
function loadSessionMember() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.id || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}
function clearSessionMember() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
export {
  clearSessionMember as c,
  loadSessionMember as l,
  memberFromApi as m,
  saveSessionMember as s
};
