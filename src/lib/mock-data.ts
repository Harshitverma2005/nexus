export type OppStatus =
  | "pending"
  | "validated"
  | "in_progress"
  | "closed"
  | "archived"
  | "rejected"
  | "dropped";

export type OppCategory = "SaaS" | "Fintech" | "D2C" | "Enterprise" | "Marketing" | "Consulting" | "IT" | "Manufacturing";

export interface Member {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  expertise: string[];
  score: number;
  dealsClosed: number;
  successRate: number;
  tier: "Admin" | "Manager" | "Member";
  joined: string;
  email?: string;
  company?: string;
  profileLink?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  category: OppCategory;
  description: string;
  value: number;
  type: "Lead" | "Partnership" | "Hiring" | "Investment";
  confidence: "Low" | "Medium" | "High";
  timeline: string;
  decisionAccess: "Direct" | "Indirect" | "Cold";
  budgetClarity: "Clear" | "Approximate" | "Unclear";
  status: OppStatus;
  submitterId: string;
  executorId?: string;
  claims: string[];
  createdAt: string;
  comments: Comment[];
  tags: string[];
}

export const members: Member[] = [
  { id: "1", name: "Jamie Espinoza", handle: "@jespi", avatar: "JE", expertise: ["SaaS", "Fintech"], score: 5486, dealsClosed: 21, successRate: 78, tier: "Admin", joined: "2023-01-15", email: "jamie@nexus.com" },
  { id: "2", name: "Stephanie Simon", handle: "@steph", avatar: "SS", expertise: ["Enterprise", "IT"], score: 9416, dealsClosed: 42, successRate: 91, tier: "Admin", joined: "2022-11-04" },
  { id: "3", name: "Marcus Chen", handle: "@mchen", avatar: "MC", expertise: ["Manufacturing", "Consulting"], score: 8120, dealsClosed: 35, successRate: 88, tier: "Admin", joined: "2022-12-20" },
  { id: "4", name: "David Lee", handle: "@dlee", avatar: "DL", expertise: ["Consulting", "Fintech"], score: 4120, dealsClosed: 14, successRate: 65, tier: "Manager", joined: "2024-03-01" },
  { id: "5", name: "Eva Rodriguez", handle: "@evar", avatar: "ER", expertise: ["SaaS", "Marketing"], score: 3940, dealsClosed: 13, successRate: 62, tier: "Manager", joined: "2024-03-15" },
  { id: "6", name: "Farhan Ali", handle: "@farhan", avatar: "FA", expertise: ["Investment", "Fintech"], score: 3210, dealsClosed: 9, successRate: 55, tier: "Manager", joined: "2024-04-02" },
  { id: "7", name: "Grace Kim", handle: "@gracek", avatar: "GK", expertise: ["D2C", "Brand"], score: 1280, dealsClosed: 3, successRate: 45, tier: "Member", joined: "2024-09-10" },
];

export const currentUser: Member = members[0];

export const opportunities: Opportunity[] = [
  {
    id: "o1",
    title: "Enterprise SaaS Deal — Fintech CTO Intro",
    category: "Enterprise",
    description: "Warm intro to CTO of a Series C fintech evaluating workflow tools. Budget approved Q1, decision in 30 days.",
    value: 120000,
    type: "Lead",
    confidence: "High",
    timeline: "30 days",
    decisionAccess: "Direct",
    budgetClarity: "Clear",
    status: "validated",
    submitterId: "1",
    claims: ["2", "4"],
    createdAt: "2025-04-26",
    tags: ["B2B", "SaaS", "Warm"],
    comments: [
      { id: "c1", authorId: "2", text: "I have a relationship with their VP Eng — happy to take this.", at: "2025-04-27" },
    ],
  },
  {
    id: "o2",
    title: "D2C Brand Co-Marketing Partnership",
    category: "D2C",
    description: "Growing skincare brand wants joint campaign with complementary lifestyle brand. Audience: 200k+.",
    value: 45000,
    type: "Partnership",
    confidence: "Medium",
    timeline: "60 days",
    decisionAccess: "Direct",
    budgetClarity: "Approximate",
    status: "in_progress",
    submitterId: "3",
    executorId: "5",
    claims: ["5"],
    createdAt: "2025-04-20",
    tags: ["Marketing", "Brand"],
    comments: [],
  },
  {
    id: "o3",
    title: "Seed Round — AI Infrastructure Startup",
    category: "Fintech",
    description: "Founder raising $2M seed. Looking for angels with infra background. Strong technical team.",
    value: 250000,
    type: "Investment",
    confidence: "High",
    timeline: "45 days",
    decisionAccess: "Direct",
    budgetClarity: "Clear",
    status: "validated",
    submitterId: "6",
    claims: [],
    createdAt: "2025-04-29",
    tags: ["Investment", "AI"],
    comments: [],
  },
  {
    id: "o4",
    title: "Senior Frontend Engineer — Series B",
    category: "SaaS",
    description: "High-growth analytics startup needs senior React engineer. Equity-heavy, remote-friendly.",
    value: 180000,
    type: "Hiring",
    confidence: "Medium",
    timeline: "21 days",
    decisionAccess: "Indirect",
    budgetClarity: "Clear",
    status: "pending",
    submitterId: "4",
    claims: [],
    createdAt: "2025-04-30",
    tags: ["Hiring", "Engineering"],
    comments: [],
  },
  {
    id: "o5",
    title: "Healthcare RCM Consulting Engagement",
    category: "Consulting",
    description: "Mid-size hospital chain seeking RCM advisory. 3-month engagement with extension potential.",
    value: 75000,
    type: "Lead",
    confidence: "Medium",
    timeline: "14 days",
    decisionAccess: "Indirect",
    budgetClarity: "Approximate",
    status: "closed",
    submitterId: "2",
    executorId: "4",
    claims: ["4"],
    createdAt: "2025-03-10",
    tags: ["Healthcare"],
    comments: [],
  },
  {
    id: "o6",
    title: "Performance Marketing Agency for Fintech",
    category: "Marketing",
    description: "Neo-bank scaling paid acquisition. $50k/month budget, immediate start.",
    value: 600000,
    type: "Lead",
    confidence: "High",
    timeline: "10 days",
    decisionAccess: "Direct",
    budgetClarity: "Clear",
    status: "validated",
    submitterId: "5",
    claims: ["3"],
    createdAt: "2025-04-28",
    tags: ["Marketing", "Fintech"],
    comments: [],
  },
];

export const memberById = (id: string) => members.find((m) => m.id === id);

export const statusMeta: Record<OppStatus, { label: string; color: string; dot: string }> = {
  pending: { label: "Pending Validation", color: "bg-amber/15 text-amber border-amber/30", dot: "bg-amber" },
  validated: { label: "Validated", color: "bg-neon/15 text-neon border-neon/30", dot: "bg-neon" },
  in_progress: { label: "In Progress", color: "bg-violet/15 text-violet border-violet/30", dot: "bg-violet" },
  closed: { label: "Deal Closed", color: "bg-success/15 text-success border-success/30", dot: "bg-success" },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
  rejected: { label: "Rejected", color: "bg-destructive/15 text-destructive border-destructive/30", dot: "bg-destructive" },
  dropped: { label: "Dropped", color: "bg-rose/15 text-rose border-rose/30", dot: "bg-rose" },
};

export const formatMoney = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;
