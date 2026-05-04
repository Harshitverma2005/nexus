import axios from "axios";
const RESOLVED_API_BASE = String(
  "http://localhost:8000/api"
).replace(/\/$/, "") || "http://localhost:8000/api";
const api = axios.create({
  baseURL: RESOLVED_API_BASE,
  headers: {
    "Content-Type": "application/json"
  }
});
const registerMember = async (payload) => {
  const res = await api.post("/auth/register/", payload);
  return res.data;
};
const loginMember = async (payload) => {
  const res = await api.post("/auth/login/", payload);
  return res.data;
};
const getOpportunities = async (params) => {
  const res = await api.get("/opportunities/", { params });
  return res.data;
};
const getOpportunity = async (id) => {
  const res = await api.get(`/opportunities/${id}/`);
  return res.data;
};
const getMembers = async (params) => {
  const res = await api.get("/members/", { params });
  return res.data;
};
const submitOpportunity = async (payload) => {
  const res = await api.post("/opportunities/", payload);
  return res.data;
};
const getChannels = async (params) => {
  const res = await api.get("/channels/", { params });
  return res.data;
};
const createChannel = async (payload) => {
  const res = await api.post("/channels/", payload);
  return res.data;
};
const getChannelMemberships = async (params) => {
  const res = await api.get("/channel-memberships/", { params });
  return res.data;
};
const joinChannel = async (channelId, memberId) => {
  const res = await api.post("/channel-memberships/", {
    channel: channelId,
    member: memberId,
    has_paid: true
  });
  return res.data;
};
const claimOpportunity = async (payload) => {
  const res = await api.post("/claims/", payload);
  return res.data;
};
const acceptClaim = async (claimId) => {
  const res = await api.post(`/claims/${claimId}/accept/`);
  return res.data;
};
const addComment = async (payload) => {
  const res = await api.post("/comments/", payload);
  return res.data;
};
const closeOpportunity = async (opportunityId) => {
  const res = await api.post(`/opportunities/${opportunityId}/close/`);
  return res.data;
};
const updateOpportunityStatus = async (opportunityId, status) => {
  const res = await api.patch(`/opportunities/${opportunityId}/`, { status });
  return res.data;
};
const suspendMember = async (memberId) => {
  const res = await api.patch(`/members/${memberId}/`, { tier: "Member" });
  return res.data;
};
export {
  RESOLVED_API_BASE as R,
  getMembers as a,
  getChannelMemberships as b,
  getOpportunities as c,
  createChannel as d,
  suspendMember as e,
  getOpportunity as f,
  getChannels as g,
  claimOpportunity as h,
  acceptClaim as i,
  joinChannel as j,
  addComment as k,
  loginMember as l,
  closeOpportunity as m,
  registerMember as r,
  submitOpportunity as s,
  updateOpportunityStatus as u
};
