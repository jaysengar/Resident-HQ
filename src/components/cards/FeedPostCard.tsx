import { motion } from "framer-motion";
import { ChatTeardropText, PhoneCall } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { CommunityPost } from "@/lib/types";

export function FeedPostCard({ post }: { post: CommunityPost & { author: string; flat: string; time: string } }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[24px] border border-border/50 bg-card/60 backdrop-blur-xl shadow-[0_2px_12px_rgb(0,0,0,0.02)] transition-all hover:bg-card/80"
    >
      <div className="flex items-center gap-4 p-5 pb-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-lg font-black shadow-[0_4px_12px_rgba(var(--color-primary),0.2)]">
          {post.author[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold tracking-tight text-foreground">{post.author}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
            {post.flat} • {post.time}
          </p>
        </div>
        {post.type === "Buy/Sell" && (
          <span className="rounded-full bg-accent/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground border border-accent">
            Buy / Sell
          </span>
        )}
      </div>
      <div className="px-5 pb-4">
        <p className="text-[15px] text-foreground leading-relaxed font-medium">{post.content}</p>
        {(post as any).imageUrl && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border/50 shadow-sm">
            <img
              src={(post as any).imageUrl}
              alt="Post attachment"
              className="w-full object-cover max-h-80 transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
        {post.price && <p className="mt-3 text-xl font-black text-primary">{post.price}</p>}
      </div>
      {post.contact ? (
        <div className="grid grid-cols-2 gap-3 border-t border-border/40 p-4 bg-secondary/20">
          <motion.a
            href={`https://wa.me/${post.contact.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.96 }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-[13px] font-bold text-foreground hover:bg-secondary/80 transition-colors border border-border/50"
          >
            <ChatTeardropText size={18} weight="duotone" /> WhatsApp
          </motion.a>
          <motion.a
            href={`tel:${post.contact}`}
            whileTap={{ scale: 0.96 }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-success py-3 text-[13px] font-bold text-success-foreground shadow-md hover:bg-success/90 transition-colors"
          >
            <PhoneCall size={18} weight="fill" /> Call
          </motion.a>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 border-t border-border/40 p-4 bg-secondary/20">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => toast("Opening chat…", { description: `Message ${post.author}` })}
            className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-[13px] font-bold text-foreground opacity-60 hover:opacity-100 transition-opacity border border-border/50"
          >
            <ChatTeardropText size={18} weight="duotone" /> Message
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => toast.success(`Calling ${post.author}…`)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-success py-3 text-[13px] font-bold text-success-foreground opacity-60 hover:opacity-100 transition-opacity"
          >
            <PhoneCall size={18} weight="fill" /> Call
          </motion.button>
        </div>
      )}
    </motion.article>
  );
}
