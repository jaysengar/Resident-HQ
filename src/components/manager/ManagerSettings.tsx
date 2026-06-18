import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Key, Eye, EyeOff } from "lucide-react";
import { getSocietySettings, updateSocietySettings } from "@/lib/api/api";
import { toast } from "sonner";

export function ManagerSettings() {
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSocietySettings();
        if (settings) {
          setRazorpayKeyId(settings.razorpay_key_id || "");
          setRazorpayKeySecret(settings.razorpay_key_secret || "");
        }
      } catch (err: any) {
        toast.error("Failed to load settings: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!razorpayKeyId || !razorpayKeySecret) {
      toast.error("Both Key ID and Secret are required");
      return;
    }
    
    setIsSaving(true);
    try {
      await updateSocietySettings({
        razorpay_key_id: razorpayKeyId,
        razorpay_key_secret: razorpayKeySecret,
      });
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error("Failed to save settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Society Settings</h1>
          <p className="text-zinc-400 mt-1">Configure your society's integrations and preferences</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20 text-blue-400">
            <Key size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Razorpay Integration</h2>
            <p className="text-sm text-zinc-400">Configure your payment gateway keys to receive funds directly.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Razorpay Key ID</label>
            <input
              type="text"
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="rzp_live_..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Razorpay Key Secret</label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all pr-12"
                placeholder="Enter your secret key"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
