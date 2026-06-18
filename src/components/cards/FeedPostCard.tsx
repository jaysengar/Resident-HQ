import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import type { CommunityPost } from "@/lib/types";

export function FeedPostCard({ post }: { post: CommunityPost & { author: string; flat: string; time: string } }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="overflow-hidden rounded-3xl border border-border/60 bg-card"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-white text-sm font-semibold">
          {post.author[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{post.author}</p>
          <p className="text-[11px] text-muted-foreground">
            {post.flat} • {post.time}
          </p>
        </div>
        {post.type === "Buy/Sell" && (
          <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
            Buy / Sell
          </span>
        )}
      </div>
      <div className="px-4 pb-3">
        <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
        {(post as any).imageUrl && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-border">
            <img
              src={(post as any).imageUrl}
              alt="Post attachment"
              className="w-full object-cover max-h-80"
            />
          </div>
        )}
        {post.price && <p className="mt-3 text-lg font-bold text-foreground">{post.price}</p>}
      </div>
      {post.contact ? (
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 p-3">
          <motion.a
            href={`https://wa.me/${post.contact.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.96 }}
            className="flex items-center justify-center gap-2 rounded-xl bg-secondary py-2.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            <MessageCircle size={16} /> WhatsApp
          </motion.a>
          <motion.a
            href={`tel:${post.contact}`}
            whileTap={{ scale: 0.96 }}
            className="flex items-center justify-center gap-2 rounded-xl bg-success py-2.5 text-sm font-medium text-success-foreground"
          >
            <Phone size={16} /> Call
          </motion.a>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 p-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => toast("Opening chat…", { description: `Message ${post.author}` })}
            className="flex items-center justify-center gap-2 rounded-xl bg-secondary py-2.5 text-sm font-medium text-foreground hover:bg-accent opacity-50"
          >
            <MessageCircle size={16} /> Message
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => toast.success(`Calling ${post.author}…`)}
            className="flex items-center justify-center gap-2 rounded-xl bg-success py-2.5 text-sm font-medium text-success-foreground opacity-50"
          >
            <Phone size={16} /> Call
          </motion.button>
        </div>
      )}
    </motion.article>
  );
}
