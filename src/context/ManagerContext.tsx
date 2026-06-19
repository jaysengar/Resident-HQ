import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type {
  DashboardStats,
  MonthlyCollection,
  Resident,
  HelpdeskTicket,
  TicketStatus,
} from "@/lib/types";
import {
  getDashboardStats,
  getMonthlyCollection,
  getResidents,
  sendReminder,
  getHelpdeskTickets,
  resolveTicket,
} from "@/lib/api/api";
import { toast } from "sonner";
import { useSocietyTheme } from "@/hooks/useSocietyTheme";

export type ManagerTab = "dashboard" | "residents" | "guards" | "dues" | "helpdesk" | "nocs" | "settings" | "branding";

interface ManagerState {
  tab: ManagerTab;
  setTab: (t: ManagerTab) => void;
  stats: DashboardStats | null;
  monthlyData: MonthlyCollection[];
  residents: Resident[];
  tickets: HelpdeskTicket[];
  nocRequests: any[];
  guards: { id: string; name: string; phone: string; email: string }[];
  loading: boolean;
  fetchDashboard: () => Promise<void>;
  fetchResidents: () => Promise<void>;
  fetchTickets: () => Promise<void>;
  fetchNocRequests: () => Promise<void>;
  fetchGuards: () => Promise<void>;
  handleSendReminder: (flatNo: string) => Promise<void>;
  handleResolveTicket: (ticketId: string, newStatus: TicketStatus) => Promise<void>;
  handleUpdateNocStatus: (id: string, status: "Approved" | "Rejected", notes?: string) => Promise<void>;
  handleAddResident: (payload: { 
    name: string; 
    email: string; 
    phone: string; 
    flatNo: string;
    membersCount: number;
    aadhaarNumber: string;
    flatType: string;
    occupancyType: string;
  }) => Promise<{ success: boolean; tempPassword?: string }>;
  handleAddGuard: (payload: { name: string; email: string; phone: string }) => Promise<{ success: boolean; tempPassword?: string }>;
  handleDeleteResident: (userId: string, flatNo: string) => Promise<void>;
  handleDeleteGuard: (userId: string) => Promise<void>;
  handleBulkReminder: () => Promise<void>;
}

const ManagerContext = createContext<ManagerState | null>(null);

export function ManagerProvider({
  children,
  colonySlug,
}: {
  children: ReactNode;
  colonySlug: string;
}) {
  // Call useSocietyTheme to apply white-labeling
  useSocietyTheme(colonySlug);

  const [tab, setTab] = useState<ManagerTab>("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyCollection[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [nocRequests, setNocRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Real-time subscriptions for live data
  useEffect(() => {
    let channel: any;
    import("@/lib/supabase").then(({ supabase }) => {
      channel = supabase
        .channel('manager_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'flats' },
          () => { fetchDashboard(); fetchResidents(); }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'helpdesk_tickets' },
          () => fetchTickets()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'noc_requests' },
          () => fetchNocRequests()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'payments' },
          () => fetchDashboard()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'visitors' },
          () => {} // Guard handles this, but dashboard may need visitor count
        )
        .subscribe();
    });

    return () => {
      if (channel) {
        import("@/lib/supabase").then(({ supabase }) => supabase.removeChannel(channel));
      }
    };
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [s, m] = await Promise.all([getDashboardStats(), getMonthlyCollection()]);
      setStats(s);
      setMonthlyData(m);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getResidents();
      setResidents(data);
    } catch {
      toast.error("Failed to load residents");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHelpdeskTickets();
      setTickets(data);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNocRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { getNocRequests } = await import("@/lib/api/api");
      const data = await getNocRequests();
      setNocRequests(data);
    } catch {
      toast.error("Failed to load NOC requests");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSendReminder = useCallback(async (flatNo: string) => {
    try {
      const result = await sendReminder(flatNo);
      if (result.success) toast.success("Reminder Sent", { description: result.message });
    } catch {
      toast.error("Failed to send reminder");
    }
  }, []);

  const handleResolveTicket = useCallback(async (ticketId: string, newStatus: TicketStatus) => {
    // Optimistic update
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t,
      ),
    );
    try {
      const result = await resolveTicket(ticketId, newStatus);
      if (result.success) toast.success(`Ticket ${newStatus}`);
    } catch {
      toast.error("Failed to update ticket");
      // Revert
      const data = await getHelpdeskTickets();
      setTickets(data);
    }
  }, []);

  const handleUpdateNocStatus = useCallback(async (id: string, status: "Approved" | "Rejected", notes?: string) => {
    try {
      const { updateNocStatus } = await import("@/lib/api/api");
      await updateNocStatus(id, status, notes);
      toast.success(`NOC ${status}`);
      fetchNocRequests();
    } catch {
      toast.error("Failed to update NOC status");
    }
  }, [fetchNocRequests]);

  const handleAddResident = useCallback(async (payload: { 
    name: string; 
    email: string; 
    phone: string; 
    flatNo: string;
    membersCount: number;
    aadhaarNumber: string;
    flatType: string;
    occupancyType: string;
  }) => {
    try {
      const { addResident } = await import("@/lib/api/api");
      const result = await addResident(payload);
      if (result.success) {
        toast.success(result.message);
        fetchResidents();
        return result;
      }
      return { success: false };
    } catch (e: any) {
      toast.error(e.message || "Failed to add resident");
      throw e;
    }
  }, [fetchResidents]);

  const [guards, setGuards] = useState<{ id: string; name: string; phone: string; email: string }[]>([]);

  const fetchGuards = useCallback(async () => {
    setLoading(true);
    try {
      const { getGuards } = await import("@/lib/api/api");
      const data = await getGuards();
      setGuards(data);
    } catch {
      toast.error("Failed to load guards");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddGuard = useCallback(async (payload: { name: string; email: string; phone: string }) => {
    try {
      const { addGuard } = await import("@/lib/api/api");
      const result = await addGuard(payload);
      if (result.success) {
        toast.success(result.message);
        fetchGuards();
        return result;
      }
      return { success: false };
    } catch (e: any) {
      toast.error(e.message || "Failed to add guard");
      throw e;
    }
  }, [fetchGuards]);

  const handleDeleteResident = useCallback(async (userId: string, flatNo: string) => {
    try {
      const { deleteResident } = await import("@/lib/api/api");
      await deleteResident(userId, flatNo);
      toast.success("Resident removed successfully");
      fetchResidents();
      fetchDashboard();
    } catch (e: any) {
      toast.error(e.message || "Failed to remove resident");
    }
  }, [fetchResidents, fetchDashboard]);

  const handleDeleteGuard = useCallback(async (userId: string) => {
    try {
      const { deleteGuard } = await import("@/lib/api/api");
      await deleteGuard(userId);
      toast.success("Guard removed successfully");
      fetchGuards();
    } catch (e: any) {
      toast.error(e.message || "Failed to remove guard");
    }
  }, [fetchGuards]);

  const handleBulkReminder = useCallback(async () => {
    try {
      const { sendBulkReminders } = await import("@/lib/api/api");
      const result = await sendBulkReminders();
      if (result.count === 0) {
        toast.info("No unpaid flats found");
      } else {
        toast.success(`Reminders sent to ${result.count} unpaid flats`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to send reminders");
    }
  }, []);

  return (
    <ManagerContext.Provider
      value={{
        tab,
        setTab,
        stats,
        monthlyData,
        residents,
        tickets,
        nocRequests,
        guards,
        loading,
        fetchDashboard,
        fetchResidents,
        fetchTickets,
        fetchNocRequests,
        fetchGuards,
        handleSendReminder,
        handleResolveTicket,
        handleUpdateNocStatus,
        handleAddResident,
        handleAddGuard,
        handleDeleteResident,
        handleDeleteGuard,
        handleBulkReminder,
      }}
    >
      {children}
    </ManagerContext.Provider>
  );
}

export function useManager() {
  const ctx = useContext(ManagerContext);
  if (!ctx) throw new Error("useManager must be used inside ManagerProvider");
  return ctx;
}
