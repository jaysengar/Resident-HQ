import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  getAnnouncements,
  getCommunityPosts,
  addCommunityPost,
  getHelpdeskTickets,
  createTicket,
  getActiveEntries,
  getResidentProfile,
  getTransactions,
  getActivePoll,
  getSocietyDocuments,
  getResidentBills,
} from "@/lib/api/api";
import type { Announcement, HelpdeskTicket, Post, Poll, SocietyDocument, Bill } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { useSocietyTheme } from "@/hooks/useSocietyTheme";

export type Tab = "home" | "dues" | "services" | "community";

export type Transaction = {
  id: number;
  title: string;
  date: string;
  method: string;
  amount: string;
};

type AppState = {
  tab: Tab;
  setTab: (t: Tab) => void;
  currentUser: { name: string; flat: string; balance: number; societyName: string; flatType: string; occupancyType: string; role: string };
  setBalance: (n: number) => void;
  gateAlerts: any[]; // Using any for now
  updateAlertStatus: (id: number, status: "approved" | "denied") => void;
  removeAlert: (id: number) => void;
  activeTickets: any[]; // Using any for now
  addTicket: (t: { title: string; category: string; description?: string }) => void;
  communityPosts: any[]; // Using any for now
  addPost: (p: { content: string; type: string; price?: string; imageUrl?: string; contact?: string }) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  bills: Bill[];
  refreshBills: () => void;
  announcements: Announcement[];
  refreshAnnouncements: () => void;
  removeAnnouncement: (id: string) => Promise<void>;
  activePoll: Poll | null;
  submitVote: (optionIndex: number) => Promise<void>;
  documents: SocietyDocument[];
  fetchInitialData: () => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children, colonySlug }: { children: ReactNode; colonySlug: string }) {
  const { user } = useAuth();
  
  // Call useSocietyTheme to apply white-labeling
  useSocietyTheme(colonySlug);

  const [tab, setTab] = useState<Tab>("home");
  const [currentUser, setCurrentUser] = useState({
    name: "Resident",
    flat: "Unknown",
    balance: 2500,
    societyName: "Resident HQ Society",
    flatType: "3 BHK",
    occupancyType: "Owner",
    role: "resident" as string,
    email: "",
    phone: "",
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gateAlerts, setGateAlerts] = useState<any[]>([]);
  const [activeTickets, setActiveTickets] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [documents, setDocuments] = useState<SocietyDocument[]>([]);

  useEffect(() => {
    if (user) {
      setCurrentUser((u) => ({
        ...u,
        name: user.name || "Resident",
        flat: user.flat || "A-101",
        role: user.role || "resident",
        email: user.email || "",
        phone: user.phone || "",
      }));
      refreshAll();
    }
  }, [user]);

  const refreshAll = async () => {
    try {
      const [anns, posts, tickets, entries, profile, txns, poll, docs, residentBills] = await Promise.all([
        getAnnouncements(),
        getCommunityPosts(),
        getHelpdeskTickets(),
        getActiveEntries(),
        getResidentProfile(),
        getTransactions(),
        getActivePoll(),
        getSocietyDocuments(),
        getResidentBills(),
      ]);
      setAnnouncements(anns);
      setCommunityPosts(posts);
      setActivePoll(poll);
      setDocuments(docs);
      setBills(residentBills);
      setCurrentUser((u) => ({ 
        ...u, 
        balance: profile.dues_amount || 0,
        societyName: profile.society_name || "Resident HQ Society",
        flatType: profile.flat_type || "3 BHK",
        occupancyType: profile.occupancy_type || "Owner",
      }));
      setTransactions(txns.map(t => ({
        id: t.id,
        title: `${t.month} Maintenance`,
        date: new Date(t.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        method: t.method,
        amount: Number(t.amount).toLocaleString("en-IN")
      })));
      // Only show tickets/entries related to this resident's flat
      // Wait, getHelpdeskTickets currently returns all tickets for society
      // For Resident, we should ideally filter on the backend.
      // For now, filter locally:
      if (user?.flat) {
        setActiveTickets(tickets.filter((t) => t.flatNo === user.flat));
        setGateAlerts(entries.filter((e) => e.flatNo === user.flat && e.status === "pending"));
      } else {
        setActiveTickets(tickets);
        setGateAlerts(entries.filter((e) => e.status === "pending"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user) return;

    let channel: any;
    import("@/lib/supabase").then(({ supabase }) => {
      channel = supabase
        .channel(`resident_realtime_${user.id}`)
        // Visitors — instant gate alerts
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "visitors",
            ...(user.flat ? { filter: `flat_number=eq.${user.flat}` } : {}),
          },
          (payload) => {
            const newEntry = payload.new;
            if (newEntry.status === "pending") {
              setGateAlerts((prev) => [
                {
                  id: newEntry.id,
                  type: newEntry.type,
                  name: newEntry.name,
                  company: newEntry.company,
                  flatNo: newEntry.flat_number,
                  enteredAt: newEntry.entered_at,
                  phone: newEntry.phone,
                  status: newEntry.status,
                },
                ...prev,
              ]);
              toast("New Visitor at Gate", {
                description: `${newEntry.name} wants to enter.`,
              });
            }
          }
        )
        // Visitors — handle status changes (e.g. auto-reject or other resident action)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "visitors",
            ...(user.flat ? { filter: `flat_number=eq.${user.flat}` } : {}),
          },
          (payload) => {
            const updatedEntry = payload.new;
            if (updatedEntry.status !== "pending") {
              setGateAlerts((prev) => prev.filter((a) => a.id !== updatedEntry.id));
            }
          }
        )
        // Announcements — live updates
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "announcements" },
          () => refreshAnnouncements()
        )
        // Community posts — live feed
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "community_posts" },
          async () => {
            try {
              const posts = await getCommunityPosts();
              setCommunityPosts(posts);
            } catch {}
          }
        )
        // Helpdesk tickets — status updates
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "helpdesk_tickets" },
          async () => {
            try {
              const tickets = await getHelpdeskTickets();
              if (user.flat) {
                setActiveTickets(tickets.filter((t) => t.flatNo === user.flat));
              } else {
                setActiveTickets(tickets);
              }
            } catch {}
          }
        )
        // Polls — new poll appears instantly
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "polls" },
          async () => {
            try {
              const poll = await getActivePoll();
              setActivePoll(poll);
            } catch {}
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) {
        import("@/lib/supabase").then(({ supabase }) => supabase.removeChannel(channel));
      }
    };
  }, [user]);

  const refreshAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch {}
  };

  const handleAddTicket = async (t: { title: string; category: string; description?: string }) => {
    try {
      await createTicket({
        title: t.title,
        category: t.category,
        description: t.description || "",
        priority: "Medium",
        flatNo: currentUser.flat,
        residentName: currentUser.name,
      });
      toast.success("Ticket raised successfully");
      refreshAll();
    } catch {
      toast.error("Failed to raise ticket");
    }
  };

  const handleAddPost = async (p: {
    content: string;
    type: string;
    price?: string;
    imageUrl?: string;
    contact?: string;
  }) => {
    try {
      await addCommunityPost(p);
      refreshAll();
    } catch {
      toast.error("Failed to add post");
    }
  };

  const value: AppState = {
    tab,
    setTab,
    currentUser,
    setBalance: (n) => setCurrentUser((u) => ({ ...u, balance: n })),
    gateAlerts,
    updateAlertStatus: async (id, status) => {
      try {
        const { respondToEntry } = await import("@/lib/api/api");
        await respondToEntry(id as any, status);
        setGateAlerts((a) => a.filter((x) => x.id !== id));
      } catch (e) {
        toast.error("Failed to update status");
      }
    },
    removeAlert: (id) => setGateAlerts((a) => a.filter((x) => x.id !== id)),
    activeTickets,
    addTicket: handleAddTicket,
    communityPosts,
    addPost: handleAddPost,
    transactions,
    addTransaction: (t) => setTransactions((prev) => [{ ...t, id: Date.now() }, ...prev]),
    bills,
    refreshBills: async () => {
      try {
        const bs = await getResidentBills();
        setBills(bs);
        setCurrentUser(u => ({ ...u, balance: bs.filter(b => b.status !== "paid").reduce((acc, curr) => acc + Number(curr.amount), 0) }));
      } catch (e) {
        console.error(e);
      }
    },
    announcements,
    refreshAnnouncements,
    activePoll,
    submitVote: async (idx) => {
      if (!activePoll) return;
      try {
        const { submitPollVote } = await import("@/lib/api/api");
        await submitPollVote(activePoll.id, idx);
        setActivePoll(null); // Hide poll after vote
        toast.success("Vote submitted!");
      } catch {
        toast.error("Failed to submit vote");
      }
    },
    documents,
    removeAnnouncement: async (id: string) => {
      try {
        const { deleteAnnouncement } = await import("@/lib/api/api");
        await deleteAnnouncement(id);
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        toast.success("Announcement deleted");
      } catch {
        toast.error("Failed to delete announcement");
      }
    },
    fetchInitialData: refreshAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
