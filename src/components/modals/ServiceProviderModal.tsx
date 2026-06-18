import { useEffect, useState } from "react";
import { ModalShell } from "./ModalShell";
import { EmptyState } from "../ui/EmptyState";
import { Users, Phone, Star, Loader2 } from "lucide-react";
import { getServiceProviders } from "@/lib/api/api";
import { motion, AnimatePresence } from "framer-motion";

interface Provider {
  id: string;
  name: string;
  phone: string;
  rating: number;
  reviews_count: number;
  category: string;
}

export function ServiceProviderModal({
  open,
  onClose,
  category,
}: {
  open: boolean;
  onClose: () => void;
  category: string | null;
}) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && category) {
      setLoading(true);
      getServiceProviders(category)
        .then((data) => setProviders(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, category]);

  return (
    <ModalShell open={open} onClose={onClose} title={`${category} Providers`}>
      <div className="min-h-[250px] p-1">
        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : providers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={`No ${category?.toLowerCase()} found`}
            description="Your society hasn't onboarded any verified providers for this category yet."
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {providers.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold uppercase">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{p.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-amber-500">
                        <Star size={12} className="fill-amber-500" />
                        {p.rating}
                      </span>
                      <span>({p.reviews_count} reviews)</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${p.phone}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Phone size={16} />
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
