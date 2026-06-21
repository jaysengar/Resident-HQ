import { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare, Search } from "lucide-react";
import { getManagerConversations, getMessagesForFlat, sendDirectMessage, DirectMessage, ManagerConversation } from "@/lib/api/messages";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export function ManagerMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ManagerConversation[]>([]);
  const [activeFlat, setActiveFlat] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");

  // Fetch all unique conversations
  useEffect(() => {
    let channel: any;
    
    const fetchConversations = async () => {
      try {
        const data = await getManagerConversations();
        setConversations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingConv(false);
      }
    };
    
    fetchConversations();
    
    // Subscribe to new messages across the society
    if (user?.societyId) {
      import("@/lib/supabase").then(({ supabase }) => {
        channel = supabase
          .channel(`manager_dm_${user.societyId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "direct_messages",
              filter: `society_id=eq.${user.societyId}`
            },
            (payload) => {
              const newMsg = payload.new as DirectMessage;
              
              // If it's for the currently active chat, append it
              setActiveFlat((currentActiveFlat) => {
                if (currentActiveFlat === newMsg.flat_number) {
                  setMessages((prev) => {
                    // Check to avoid duplicates (if we sent it)
                    if (prev.find(m => m.id === newMsg.id)) return prev;
                    const next = [...prev, newMsg];
                    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                    return next;
                  });
                }
                return currentActiveFlat;
              });
              
              // Update conversation list
              setConversations((prev) => {
                const filtered = prev.filter(c => c.flat_number !== newMsg.flat_number);
                return [{
                  flat_number: newMsg.flat_number,
                  last_message: newMsg.content,
                  last_message_at: newMsg.created_at
                }, ...filtered];
              });
            }
          )
          .subscribe();
      });
    }

    return () => {
      if (channel) {
        import("@/lib/supabase").then(({ supabase }) => supabase.removeChannel(channel));
      }
    };
  }, [user?.societyId]);

  // Fetch messages for the selected flat
  useEffect(() => {
    if (!activeFlat) return;
    
    const fetchMessages = async () => {
      setLoadingMsgs(true);
      try {
        const data = await getMessagesForFlat(activeFlat);
        setMessages(data);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMsgs(false);
      }
    };
    
    fetchMessages();
  }, [activeFlat]);

  const handleSend = async () => {
    if (!input.trim() || sending || !activeFlat) return;
    
    setSending(true);
    const text = input;
    setInput("");
    
    try {
      const msg = await sendDirectMessage(text, activeFlat);
      setMessages((prev) => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      
      // Update conversation list
      setConversations((prev) => {
        const filtered = prev.filter(c => c.flat_number !== msg.flat_number);
        return [{
          flat_number: msg.flat_number,
          last_message: msg.content,
          last_message_at: msg.created_at
        }, ...filtered];
      });
    } catch (e) {
      console.error(e);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter(c => 
    c.flat_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-140px)] w-full gap-4 p-4">
      {/* Left Sidebar - Conversations */}
      <div className="flex w-80 flex-col rounded-[24px] border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-black/20">
          <h2 className="text-sm font-bold text-white mb-3">Conversations</h2>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 transition-colors focus-within:border-violet-500/50">
            <Search size={14} className="text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search flat number..."
              className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {loadingConv ? (
            <div className="flex justify-center p-6"><Loader2 size={20} className="animate-spin text-violet-500" /></div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center text-xs text-zinc-500 p-6">No conversations found.</div>
          ) : (
            filteredConvs.map((conv) => (
              <button
                key={conv.flat_number}
                onClick={() => setActiveFlat(conv.flat_number)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                  activeFlat === conv.flat_number 
                    ? "bg-violet-600/20 border border-violet-500/30" 
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-bold text-white">Flat {conv.flat_number}</span>
                  <span className="text-xs text-zinc-400 truncate w-40 text-left">{conv.last_message}</span>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0">
                  {new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Box */}
      <div className="flex flex-1 flex-col rounded-[24px] border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden relative">
        {!activeFlat ? (
          <div className="flex h-full flex-col items-center justify-center text-zinc-500">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-600/20 text-violet-400 font-bold border border-violet-500/30">
                  {activeFlat.substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Flat {activeFlat}</h2>
                  <p className="text-[10px] text-emerald-400 font-medium">Live Chat</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {loadingMsgs ? (
                <div className="flex justify-center p-6"><Loader2 size={24} className="animate-spin text-violet-500" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-zinc-500 p-6 mt-10">No messages yet.</div>
              ) : (
                messages.map((msg) => {
                  const isManager = msg.sender_role === "manager";
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id} 
                      className={`flex flex-col ${isManager ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                        isManager 
                          ? 'bg-violet-600 text-white rounded-br-sm shadow-[0_4px_15px_rgba(109,40,217,0.3)]' 
                          : 'bg-white/10 text-white rounded-bl-sm border border-white/5'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1.5 px-1 font-medium">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Reply to Flat ${activeFlat}...`}
                  className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white disabled:opacity-50 hover:bg-violet-500 transition-colors shadow-[0_0_15px_rgba(109,40,217,0.4)]"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-ml-0.5" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
