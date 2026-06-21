import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, ChatText } from "@phosphor-icons/react";
import { useApp } from "@/context/AppContext";
import { TopHeader } from "@/components/layout/TopHeader";
import { FeedPostCard } from "@/components/cards/FeedPostCard";
import { NewPostModal } from "@/components/modals/NewPostModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

export function CommunityView() {
  const { communityPosts, currentUser, dataReady } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="px-5">
      <TopHeader title="Community" subtitle="Your neighbourhood, online" />

      <button
        onClick={() => setOpen(true)}
        className="mt-6 w-full rounded-[24px] border border-border/50 bg-card/60 backdrop-blur-xl p-4 text-left shadow-[0_2px_12px_rgb(0,0,0,0.02)] transition-all hover:bg-card/80 group"
      >
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-black text-lg shadow-[0_4px_12px_rgba(var(--color-primary),0.2)]">
            {currentUser.name[0]}
          </div>
          <span className="flex-1 text-[15px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Share something with the colony…
          </span>
          <span
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm"
          >
            <Plus size={16} weight="bold" /> Post
          </span>
        </div>
      </button>

      <section className="mt-6 space-y-4 pb-24">
        {!dataReady ? (
          <>
            <SkeletonCard lines={4} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={4} />
          </>
        ) : communityPosts.length === 0 ? (
          <EmptyState
            icon={ChatText}
            title="No posts yet"
            description="Be the first to share something with your community!"
            action={{ label: "Create Post", onClick: () => setOpen(true) }}
          />
        ) : (
          <AnimatePresence initial={false}>
            {communityPosts.map((p) => (
              <FeedPostCard key={p.id} post={p} />
            ))}
          </AnimatePresence>
        )}
      </section>

      <NewPostModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
