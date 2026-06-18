import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type {
  Society,
  AdminOverviewStats,
  SystemLog,
  RevenueTrend,
  PlanBreakdown,
} from "@/lib/types";
import {
  getSocieties,
  getAdminOverview,
  onboardSociety,
  toggleSocietyAccess,
  deleteSociety,
  getRevenueTrend,
  getPlanBreakdown,
  getSystemLogs,
} from "@/lib/api/api";
import { toast } from "sonner";

export type AdminTab = "overview" | "societies" | "revenue" | "logs";

interface AdminState {
  tab: AdminTab;
  setTab: (t: AdminTab) => void;
  societies: Society[];
  overview: AdminOverviewStats | null;
  revenueTrend: RevenueTrend[];
  planBreakdown: PlanBreakdown[];
  logs: SystemLog[];
  loading: boolean;
  fetchOverview: () => Promise<void>;
  fetchSocieties: () => Promise<void>;
  fetchRevenue: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  handleOnboard: (data: {
    name: string;
    address: string;
    totalFlats: number;
    adminEmail: string;
    subscriptionPlan: "Basic" | "Pro" | "Enterprise";
  }) => Promise<void>;
  handleToggleAccess: (societyId: string) => Promise<void>;
  handleDeleteSociety: (societyId: string) => Promise<void>;
}

const AdminContext = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [societies, setSocieties] = useState<Society[]>([]);
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([]);
  const [planBreakdown, setPlanBreakdown] = useState<PlanBreakdown[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminOverview();
      setOverview(data);
    } catch {
      toast.error("Failed to load overview");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSocieties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSocieties();
      setSocieties(data);
    } catch {
      toast.error("Failed to load societies");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    try {
      const [trend, breakdown] = await Promise.all([getRevenueTrend(), getPlanBreakdown()]);
      setRevenueTrend(trend);
      setPlanBreakdown(breakdown);
    } catch {
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSystemLogs();
      setLogs(data);
    } catch {
      toast.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOnboard = useCallback(
    async (data: {
      name: string;
      address: string;
      totalFlats: number;
      adminEmail: string;
      subscriptionPlan: "Basic" | "Pro" | "Enterprise";
    }) => {
      try {
        const newSociety = await onboardSociety(data);
        setSocieties((prev) => [newSociety, ...prev]);
        toast.success("Society Onboarded!", { description: `${data.name} is now live.` });
      } catch (e: any) {
        toast.error("Failed to onboard society", { description: e?.message || "Unknown error" });
        console.error(e);
      }
    },
    [],
  );

  const handleToggleAccess = useCallback(async (societyId: string) => {
    try {
      const result = await toggleSocietyAccess(societyId);
      if (result.success) {
        setSocieties((prev) =>
          prev.map((s) => (s.id === societyId ? { ...s, status: result.newStatus } : s)),
        );
        toast.success(result.newStatus === "active" ? "Society Activated" : "Society Suspended");
      }
    } catch (e: any) {
      toast.error(`Failed to toggle access: ${e.message}`);
      console.error(e);
    }
  }, []);

  const handleDeleteSociety = useCallback(async (societyId: string) => {
    if (!window.confirm("Are you sure you want to delete this society? This will cascade and delete all data.")) return;
    try {
      await deleteSociety(societyId);
      setSocieties((prev) => prev.filter((s) => s.id !== societyId));
      toast.success("Society Deleted");
    } catch (e: any) {
      toast.error(`Failed to delete society: ${e.message}`);
      console.error(e);
    }
  }, []);

  return (
    <AdminContext.Provider
      value={{
        tab,
        setTab,
        societies,
        overview,
        revenueTrend,
        planBreakdown,
        logs,
        loading,
        fetchOverview,
        fetchSocieties,
        fetchRevenue,
        fetchLogs,
        handleOnboard,
        handleToggleAccess,
        handleDeleteSociety,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
