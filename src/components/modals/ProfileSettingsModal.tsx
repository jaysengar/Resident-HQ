import { useState } from "react";
import { User, Phone, LogOut, Loader2, Home, Users } from "lucide-react";
import { toast } from "sonner";
import { ModalShell } from "./ModalShell";
import { useApp } from "@/context/AppContext";
import { updateResidentProfile } from "@/lib/api/residents";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";

export function ProfileSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser } = useApp();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateResidentProfile({ name, phone });
      toast.success("Profile updated successfully");
      onClose();
    } catch (e: any) {
      toast.error("Failed to update profile", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate({ to: "/app-login" });
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Profile & Settings">
      <div className="mt-4 space-y-4">
        <div className="flex flex-col items-center justify-center p-4">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-3xl font-bold text-primary-foreground shadow-[var(--shadow-card)]">
            {currentUser.name[0]?.toUpperCase()}
          </div>
          <h2 className="mt-3 text-lg font-bold text-foreground">{currentUser.name}</h2>
          <p className="text-sm text-muted-foreground">{currentUser.email}</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Full Name</label>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
              <User size={16} className="text-muted-foreground" />
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Phone Number</label>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
              <Phone size={16} className="text-muted-foreground" />
              <input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-secondary/50 p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Flat Details (Read-only)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Home size={16} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Flat No</p>
                <p className="text-sm font-semibold">{currentUser.flat}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Occupancy</p>
                <p className="text-sm font-semibold">{currentUser.occupancyType}</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || (!name.trim() && !phone.trim())}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </ModalShell>
  );
}
