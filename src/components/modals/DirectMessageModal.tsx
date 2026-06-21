import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { useApp } from "@/context/AppContext";
import { getDirectMessages, sendDirectMessage, DirectMessage } from "@/lib/api/messages";

export function DirectMessageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser } = useApp();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!open) return;
    
    let channel: any;
    
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await getDirectMessages();
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    import("@/lib/supabase").then(({ supabase }) => {
      channel = supabase
        .channel(`dm_${currentUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "direct_messages",
            filter: `society_id=eq.${currentUser.society_id}`
          },
          (payload) => {
            const newMsg = payload.new as DirectMessage;
            if (newMsg.flat_number === currentUser.flat) {
              setMessages((prev) => [...prev, newMsg]);
              setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) {
        import("@/lib/supabase").then(({ supabase }) => supabase.removeChannel(channel));
      }
    };
  }, [open, currentUser.id, currentUser.society_id, currentUser.flat]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    
    setSending(true);
    const text = input;
    setInput("");
    
    try {
      await sendDirectMessage(text);
      // The real-time subscription will append it to the list
    } catch (e) {
      console.error(e);
      // Revert input if failed
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Message Manager">
      <div className="flex flex-col h-[60vh] mt-2">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
          {loading ? (
            <div className="flex justify-center p-6"><Loader2 className="animate-spin text-primary" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-6 mt-10">
              No messages yet. Send a message to your society manager!
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_role === currentUser.role || msg.sender_id === currentUser.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-foreground rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
        
        <div className="pt-3 border-t border-border/50 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="-ml-0.5" />}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
