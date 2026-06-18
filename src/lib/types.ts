// ─── Shared types for the Smart Society SaaS ───

// ─── Auth & Roles ───
export type UserRole = "resident" | "guard" | "manager" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  societyId: string;
  societySlug?: string;
  societyName?: string;
  societyAddress?: string;
  flat?: string;
  avatar?: string;
}

// ─── Society ───
export interface Society {
  id: string;
  name: string;
  address: string;
  totalFlats: number;
  adminEmail: string;
  subscriptionPlan: "Basic" | "Pro" | "Enterprise";
  status: "active" | "suspended";
  createdAt: string;
  activeSince: string;
  monthlyRevenue: number;
  totalResidents: number;
}

// ─── Guard: Active Entry ───
export type EntryType = "Visitor" | "Delivery" | "Cab" | "Staff";

export interface ActiveEntry {
  id: string;
  type: EntryType;
  name: string;
  company?: string;
  flatNo: string;
  enteredAt: string;
  phone?: string;
  vehicleNo?: string;
  photo?: string;
}

export interface EntryRequest {
  type: EntryType;
  company?: string;
  name: string;
  flatNo: string;
  phone?: string;
}

export type ApprovalStatus = "pending" | "approved" | "denied";

// ─── Manager: Residents & Bills ───
export type DuesStatus = "Paid" | "Unpaid" | "Partial";

export interface Bill {
  id: string;
  society_id: string;
  flat_number: string;
  title: string;
  amount: number;
  status: "unpaid" | "paid" | "partial";
  due_date: string;
  created_at: string;
}

export interface Resident {
  id: string;
  flatNo: string;
  name: string;
  phone: string;
  email: string;
  duesStatus: DuesStatus;
  duesAmount: number;
  moveInDate: string;
  flatType: string;
  occupancyType?: string;
  membersCount?: number;
}

// ─── Manager: Dashboard Stats ───
export interface DashboardStats {
  totalFlats: number;
  occupiedFlats: number;
  pendingDues: number;
  openTickets: number;
  totalCollection: number;
  collectionRate: number;
}

export interface MonthlyCollection {
  month: string;
  collected: number;
  pending: number;
}

// ─── Manager: Helpdesk Ticket ───
export type TicketStatus = "Open" | "In Progress" | "Resolved";
export type TicketPriority = "Low" | "Medium" | "High";

export interface HelpdeskTicket {
  id: string;
  flatNo: string;
  residentName: string;
  title: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

// ─── Admin: Overview ───
export interface AdminOverviewStats {
  activeSocieties: number;
  totalMRR: number;
  totalUsers: number;
  newThisMonth: number;
  churnRate: number;
}

// ─── Admin: System Log ───
export type LogSeverity = "info" | "warning" | "error";

export interface SystemLog {
  id: string;
  timestamp: string;
  severity: LogSeverity;
  message: string;
  source: string;
  societyId?: string;
}

// ─── Admin: Revenue ───
export interface RevenueTrend {
  month: string;
  revenue: number;
  societies: number;
}

export interface PlanBreakdown {
  plan: "Basic" | "Pro" | "Enterprise";
  count: number;
  revenue: number;
}

// ─── Shared: Announcements ───
export interface Announcement {
  id: string;
  title: string;
  body: string;
  time: string;
  authorRole: UserRole;
}

export interface SocietyDocument {
  id: string;
  title: string;
  category: string;
  url: string;
  created_at: string;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  active: boolean;
  created_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  flat_number: string;
  option_index: number;
}
