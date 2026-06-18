import { ModalShell } from "./ModalShell";
import { NoticeCard } from "@/components/cards/NoticeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Bell } from "lucide-react";

export function AllNoticesModal({
  open,
  onClose,
  announcements,
}: {
  open: boolean;
  onClose: () => void;
  announcements: { id: string; title: string; body: string; time: string }[];
}) {
  return (
    <ModalShell open={open} onClose={onClose} title="Notice Board">
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No announcements"
            description="You are all caught up!"
          />
        ) : (
          announcements.map((n) => (
            <NoticeCard key={n.id} title={n.title} body={n.body} time={n.time} />
          ))
        )}
      </div>
    </ModalShell>
  );
}
