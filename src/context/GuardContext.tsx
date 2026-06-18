import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { ActiveEntry, EntryRequest, ApprovalStatus } from "@/lib/types";
import { getActiveEntries, requestEntry, markExit } from "@/lib/api/api";
import { toast } from "sonner";
import { useSocietyTheme } from "@/hooks/useSocietyTheme";

interface GuardState {
  entries: ActiveEntry[];
  tickets: any[];
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
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpenState] = useState(false);
  const [modalType, setModalType] = useState<
    "Visitor" | "Delivery" | "Staff" | "Announcement" | null
  >(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const [data, ticketsData, annsData] = await Promise.all([
        import("@/lib/api/api").then((m) => m.getActiveEntries()),
        import("@/lib/api/api").then((m) => m.getHelpdeskTickets()),
        import("@/lib/api/api").then((m) => m.getAnnouncements()),
      ]);
      setEntries(data.filter((e) => e.status === "approved"));
      // For guards, we show open or in progress tickets
      setTickets(ticketsData.filter((t) => t.status !== "Resolved"));
      setAnnouncements(annsData);
    } catch {
      toast.error("Failed to load entries or tickets");
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
          () => fetchEntries() // re-fetch when tickets change
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'visitors' },
          () => fetchEntries() // re-fetch when visitor status changes
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'announcements' },
          () => fetchEntries() // re-fetch when announcements change
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

  return (
    <GuardContext.Provider
      value={{
        entries,
        tickets,
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
