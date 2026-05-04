import axios from "axios";

/** Resolved API root (e.g. `http://localhost:8000/api`). Use for error hints in the UI. */
export const RESOLVED_API_BASE =
  String(
    (typeof import.meta !== "undefined" && import.meta.env.VITE_API_BASE_URL) ||
      "http://localhost:8000/api",
  ).replace(/\/$/, "") || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: RESOLVED_API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerMember = async (payload: {
  name: string;
  email: string;
  company: string;
  profile_link: string;
  expertise: string[];
  password: string;
  password_confirm: string;
}) => {
  const res = await api.post("/auth/register/", payload);
  return res.data as Record<string, unknown>;
};

export const loginMember = async (payload: { email: string; password: string }) => {
  const res = await api.post("/auth/login/", payload);
  return res.data as Record<string, unknown>;
};

export const getOpportunities = async (params?: Record<string, unknown>) => {
  const res = await api.get("/opportunities/", { params });
  return res.data;
};

export const getOpportunity = async (id: string) => {
  const res = await api.get(`/opportunities/${id}/`);
  return res.data;
};

export const getMembers = async (params?: Record<string, unknown>) => {
  const res = await api.get("/members/", { params });
  return res.data;
};

export const getMember = async (id: string) => {
  const res = await api.get(`/members/${id}/`);
  return res.data;
};

export const submitOpportunity = async (payload: Record<string, unknown>) => {
  const res = await api.post("/opportunities/", payload);
  return res.data;
};

export const getChannels = async (params?: Record<string, unknown>) => {
  const res = await api.get("/channels/", { params });
  return res.data;
};

export const createChannel = async (payload: { title: string; description: string; entry_fee: string; admin: string }) => {
  const res = await api.post("/channels/", payload);
  return res.data;
};

export const getChannelMemberships = async (params?: Record<string, unknown>) => {
  const res = await api.get("/channel-memberships/", { params });
  return res.data;
};

export const joinChannel = async (channelId: string, memberId: string) => {
  // Mocking payment for hackathon as agreed
  const res = await api.post("/channel-memberships/", {
    channel: channelId,
    member: memberId,
    has_paid: true,
  });
  return res.data;
};

export const claimOpportunity = async (payload: { opportunity: string; claimant: string; pitch: string }) => {
  const res = await api.post("/claims/", payload);
  return res.data;
};

export const acceptClaim = async (claimId: string) => {
  const res = await api.post(`/claims/${claimId}/accept/`);
  return res.data;
};

export const addComment = async (payload: { opportunity: string; author: string; text: string; source_url?: string }) => {
  const res = await api.post("/comments/", payload);
  return res.data;
};

export const closeOpportunity = async (opportunityId: string) => {
  const res = await api.post(`/opportunities/${opportunityId}/close/`);
  return res.data;
};

export const forceCloseOpportunity = async (opportunityId: string, feedback?: string) => {
  // Admin force-close uses the validate endpoint with a special action
  const res = await api.patch(`/opportunities/${opportunityId}/`, { status: 'closed' });
  return res.data;
};

export const updateOpportunityStatus = async (opportunityId: string, status: string) => {
  const res = await api.patch(`/opportunities/${opportunityId}/`, { status });
  return res.data;
};

export const removeClaim = async (claimId: string) => {
  const res = await api.delete(`/claims/${claimId}/`);
  return res.data;
};

export const suspendMember = async (memberId: string) => {
  const res = await api.patch(`/members/${memberId}/`, { tier: 'Member' });
  return res.data;
};

export const updateMemberTier = async (memberId: string, tier: string) => {
  const res = await api.patch(`/members/${memberId}/`, { tier });
  return res.data;
};

// Notifications
export const getNotifications = async (params?: Record<string, unknown>) => {
  const res = await api.get("/notifications/", { params });
  return res.data;
};

export const markNotificationsRead = async (memberId: string | number) => {
  const res = await api.post("/notifications/mark-all-read/", { member_id: memberId });
  return res.data;
};

export const updateNotification = async (id: string | number, payload: Record<string, unknown>) => {
  const res = await api.patch(`/notifications/${id}/`, payload);
  return res.data;
};
