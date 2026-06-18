import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, MessageSquare } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { TopHeader } from "@/components/layout/TopHeader";
import { FeedPostCard } from "@/components/cards/FeedPostCard";
import { NewPostModal } from "@/components/modals/NewPostModal";
import { EmptyState } from "@/components/ui/EmptyState";

export function CommunityView() {
  const { communityPosts, currentUser } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="px-5">
      <TopHeader title="Community" subtitle="Your neighbourhood, online" />

      <button
        onClick={() => setOpen(true)}
        className="mt-5 w-full rounded-3xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-accent/50"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-sm font-semibold">
            {currentUser.name[0]}
          </div>
          <span className="flex-1 text-sm text-muted-foreground">
            Share something with the colony…
          </span>
          <span
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <Plus size={14} /> Post
          </span>
        </div>
      </button>

      <section className="mt-6 space-y-4">
        <AnimatePresence initial={false}>
          {communityPosts.map((p) => (
            <FeedPostCard key={p.id} post={p} />
          ))}
        </AnimatePresence>
        {communityPosts.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title="No posts yet"
            description="Be the first to share something with your community!"
            action={{ label: "Create Post", onClick: () => setOpen(true) }}
          />
        )}
      </section>

      <NewPostModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
