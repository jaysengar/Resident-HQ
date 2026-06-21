import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { ActiveEntry, EntryRequest, ApprovalStatus } from "@/lib/types";
import { getActiveEntries, requestEntry, markExit } from "@/lib/api/api";
import { toast } from "sonner";
import { useSocietyTheme } from "@/hooks/useSocietyTheme";

interface GuardState {
  entries: ActiveEntry[];
  tickets: any[];
  nocRequests: any[];
  loading: boolean;
  modalOpen: boolean;
  modalType: "Visitor" | "Delivery" | "Staff" | "Announcement" | null;
  approvalStatus: ApprovalStatus | null;
  setModalOpen: (open: boolean, type?: "Visitor" | "Delivery" | "Staff" | "Announcement") => void;
  fetchEntries: () => Promise<void>;
  submitEntry: (req: EntryRequest) => Promise<void>;
  handleMarkExit: (entryId: string) => Promise<void>;
  resetApproval: () => void;
  announcements: any[];
  removeAnnouncement: (id: string) => Promise<void>;
  activeEmergency: any | null;
  resolveEmergency: (id: string) => Promise<void>;
}

const GuardContext = createContext<GuardState | null>(null);

export function GuardProvider({
  children,
  colonySlug,
}: {
  children: ReactNode;
  colonySlug: string;
}) {
  // Call useSocietyTheme to apply white-labeling
  useSocietyTheme(colonySlug);

  const [entries, setEntries] = useState<ActiveEntry[]>([]);
  const [tickets, setTickets] = useState<any[]>([]); // Using any for mock, we should define type properly
  const [nocRequests, setNocRequests] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpenState] = useState(false);
  const [modalType, setModalType] = useState<
    "Visitor" | "Delivery" | "Staff" | "Announcement" | null
  >(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
  const [activeEmergency, setActiveEmergency] = useState<any | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const api = await import("@/lib/api/api");
      
      const [data, ticketsData, annsData, nocData] = await Promise.all([
        api.getActiveEntries().catch((e) => { console.error("Active entries error:", e); return []; }),
        api.getHelpdeskTickets().catch((e) => { console.error("Tickets error:", e); return []; }),
        api.getAnnouncements().catch((e) => { console.error("Announcements error:", e); return []; }),
        api.getNocRequests().catch((e) => { console.error("NOC error:", e); return []; }),
      ]);
      
      setEntries(data.filter((e: any) => e.status === "approved"));
      setNocRequests(nocData);
      setTickets(ticketsData.filter((t: any) => t.status !== "Resolved"));
      setAnnouncements(annsData);
    } catch (error) {
      console.error("Critical error loading guard dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  const setModalOpen = useCallback(
    (open: boolean, type?: "Visitor" | "Delivery" | "Staff" | "Announcement") => {
      setModalOpenState(open);
      if (type) setModalType(type);
      if (!open) {
        setModalType(null);
        setApprovalStatus(null);
      }
    },
    [],
  );

  useEffect(() => {
    let channel: any;
    import("@/lib/supabase").then(({ supabase }) => {
      channel = supabase
        .channel('guard_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'helpdesk_tickets' },
          (payload) => {
            fetchEntries();
            if (payload.eventType === 'INSERT') {
              toast.info(`New Ticket: ${payload.new.title}`, { description: `Flat ${payload.new.flat_number || "Unknown"} raised a new ticket.` });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'visitors' },
          (payload) => {
            fetchEntries();
            if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
              toast.info(`New Visitor Request`, { description: `${payload.new.name} for Flat ${payload.new.flat_number || "Unknown"}` });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'announcements' },
          (payload) => {
            fetchEntries();
            if (payload.eventType === 'INSERT') {
              toast.info(`New Announcement: ${payload.new.title}`);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'noc_requests' },
          (payload) => {
            fetchEntries();
            if (payload.eventType === 'INSERT') {
              toast.info(`New NOC Request`, { description: `Flat ${payload.new.flat_number || "Unknown"} requested an NOC.` });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'emergencies', filter: `status=eq.active` },
          (payload) => {
            setActiveEmergency(payload.new);
            // Optional: try to play a sound if the browser allows
            try {
              const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
              audio.play().catch(console.error);
            } catch(e) {}
          }
        )
        .subscribe();
    });
    return () => {
      if (channel) {
        import("@/lib/supabase").then(({ supabase }) => supabase.removeChannel(channel));
      }
    };
  }, [fetchEntries]);

  const submitEntry = useCallback(async (req: EntryRequest) => {
    setApprovalStatus("pending");
    try {
      const result = await requestEntry(req);
      setApprovalStatus(result.status);
      if (result.status === "approved") {
        toast.success("Entry Approved ✅", {
          description: `${req.name || req.company} can enter.`,
        });
        const data = await getActiveEntries();
        setEntries(data);
      } else if (result.status === "denied") {
        toast.error("Entry Denied ❌", {
          description: `Resident denied entry for ${req.name || req.company}.`,
        });
      }
    } catch {
      toast.error("Failed to request entry");
      setApprovalStatus(null);
    }
  }, []);

  const handleMarkExit = useCallback(async (entryId: string) => {
    try {
      await markExit(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      toast.success("Visitor marked as exited");
    } catch {
      toast.error("Failed to mark exit");
    }
  }, []);

  const resetApproval = useCallback(() => {
    setApprovalStatus(null);
    setModalOpenState(false);
    setModalType(null);
  }, []);

  const removeAnnouncement = useCallback(async (id: string) => {
    try {
      const { deleteAnnouncement } = await import("@/lib/api/api");
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success("Announcement deleted");
    } catch {
      toast.error("Failed to delete announcement");
    }
  }, []);

  const resolveEmergency = useCallback(async (id: string) => {
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("emergencies").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", id);
      setActiveEmergency(null);
      toast.success("Emergency resolved");
    } catch {
      toast.error("Failed to resolve emergency");
    }
  }, []);

  return (
    <GuardContext.Provider
      value={{
        entries,
        tickets,
        nocRequests,
        loading,
        modalOpen,
        modalType,
        approvalStatus,
        setModalOpen,
        fetchEntries,
        submitEntry,
        handleMarkExit,
        resetApproval,
        announcements,
        removeAnnouncement,
        activeEmergency,
        resolveEmergency,
      }}
    >
      {children}
    </GuardContext.Provider>
  );
}

export function useGuard() {
  const ctx = useContext(GuardContext);
  if (!ctx) throw new Error("useGuard must be used inside GuardProvider");
  return ctx;
}
