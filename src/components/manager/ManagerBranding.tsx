import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Save,
  Upload,
  Image,
  Type,
  Phone,
  Mail,
  X,
  Plus,
  Loader2,
  ExternalLink,
  Lock,
} from "lucide-react";
import { getManagerBranding, updateSocietyBranding, type SocietyBranding } from "@/lib/api/api";
import { toast } from "sonner";
import type { PlanId } from "@/lib/planGating";
import { isFeatureAvailable } from "@/lib/planGating";

interface ManagerBrandingProps {
  currentPlan: PlanId;
}

export function ManagerBranding({ currentPlan }: ManagerBrandingProps) {
  const [branding, setBranding] = useState<SocietyBranding>({
    logo_url: "",
    banner_url: "",
    tagline: "",
    primary_color: "#6d28d9",
    secondary_color: "#4f46e5",
    society_photos: [],
    contact_phone: "",
    contact_email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const canAccess = isFeatureAvailable("branding", currentPlan);

  useEffect(() => {
    async function load() {
      try {
        const data = await getManagerBranding();
        if (data) {
          setBranding({
            logo_url: data.logo_url || "",
            banner_url: data.banner_url || "",
            tagline: data.tagline || "",
            primary_color: data.primary_color || "#6d28d9",
            secondary_color: data.secondary_color || "#4f46e5",
            society_photos: data.society_photos || [],
            contact_phone: data.contact_phone || "",
            contact_email: data.contact_email || "",
          });
        }
      } catch (err: any) {
        toast.error("Failed to load branding: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Load Cloudinary widget script
  useEffect(() => {
    if (!document.getElementById("cloudinary-widget")) {
      const script = document.createElement("script");
      script.id = "cloudinary-widget";
      script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSocietyBranding(branding);
      toast.success("Branding saved successfully!");
    } catch (err: any) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloudinaryUpload = (field: "logo_url" | "banner_url" | "photo") => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary not configured");
      return;
    }

    setUploading(field);

    const widget = (window as any).cloudinary?.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "camera", "url"],
        multiple: field === "photo",
        maxFiles: field === "photo" ? 6 : 1,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5000000, // 5MB
        cropping: field === "logo_url",
        croppingAspectRatio: field === "logo_url" ? 1 : undefined,
      },
      (error: any, result: any) => {
        if (error) {
          setUploading(null);
          toast.error("Upload failed");
          return;
        }
        if (result.event === "success") {
          const url = result.info.secure_url;
          if (field === "photo") {
            setBranding((prev) => ({
              ...prev,
              society_photos: [...(prev.society_photos || []), url],
            }));
          } else {
            setBranding((prev) => ({ ...prev, [field]: url }));
          }
        }
        if (result.event === "close") {
          setUploading(null);
        }
      }
    );
    widget?.open();
  };

  const removePhoto = (idx: number) => {
    setBranding((prev) => ({
      ...prev,
      society_photos: prev.society_photos?.filter((_, i) => i !== idx) || [],
    }));
  };

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Lock size={28} className="text-zinc-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Custom Branding</h2>
        <p className="text-zinc-400 max-w-md mb-6">
          Custom branding with logo, colors, and a dedicated colony page is available on the Smart Operations plan and above.
        </p>
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-sm">
          <Palette size={16} />
          Upgrade to Smart Operations to unlock
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center text-zinc-400 flex items-center gap-2 justify-center"><Loader2 size={18} className="animate-spin" /> Loading branding...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Society Branding</h1>
          <p className="text-zinc-400 mt-1">Customize your colony's look — logo, photos, and public page.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save All"}
        </button>
      </div>

      {/* Logo & Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/20 text-violet-400">
            <Image size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Logo & Banner</h2>
            <p className="text-sm text-zinc-400">Upload your society's visual identity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Society Logo</label>
            <div
              onClick={() => handleCloudinaryUpload("logo_url")}
              className="aspect-square w-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all overflow-hidden"
            >
              {branding.logo_url ? (
                <img src={branding.logo_url} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <>
                  {uploading === "logo_url" ? <Loader2 size={24} className="animate-spin text-violet-400" /> : <Upload size={24} className="text-zinc-500" />}
                  <span className="text-xs text-zinc-500 mt-2">Upload Logo</span>
                </>
              )}
            </div>
          </div>

          {/* Banner */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Cover Banner</label>
            <div
              onClick={() => handleCloudinaryUpload("banner_url")}
              className="aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all overflow-hidden"
            >
              {branding.banner_url ? (
                <img src={branding.banner_url} alt="Banner" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <>
                  {uploading === "banner_url" ? <Loader2 size={24} className="animate-spin text-violet-400" /> : <Upload size={24} className="text-zinc-500" />}
                  <span className="text-xs text-zinc-500 mt-2">Upload Banner</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Colors & Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-fuchsia-500/20 text-fuchsia-400">
            <Palette size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Theme & Tagline</h2>
            <p className="text-sm text-zinc-400">Set your society's brand colors and tagline</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Tagline</label>
            <input
              type="text"
              value={branding.tagline || ""}
              onChange={(e) => setBranding((prev) => ({ ...prev, tagline: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
              placeholder="e.g. A Premium Living Experience"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding.primary_color || "#6d28d9"}
                  onChange={(e) => setBranding((prev) => ({ ...prev, primary_color: e.target.value }))}
                  className="w-10 h-10 rounded-xl border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={branding.primary_color || "#6d28d9"}
                  onChange={(e) => setBranding((prev) => ({ ...prev, primary_color: e.target.value }))}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white font-mono text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding.secondary_color || "#4f46e5"}
                  onChange={(e) => setBranding((prev) => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-10 h-10 rounded-xl border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={branding.secondary_color || "#4f46e5"}
                  onChange={(e) => setBranding((prev) => ({ ...prev, secondary_color: e.target.value }))}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white font-mono text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Society Photos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20 text-blue-400">
            <Image size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Photo Gallery</h2>
            <p className="text-sm text-zinc-400">Upload photos of your society (up to 6)</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(branding.society_photos || []).map((url, i) => (
            <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {(branding.society_photos?.length || 0) < 6 && (
            <div
              onClick={() => handleCloudinaryUpload("photo")}
              className="aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all"
            >
              {uploading === "photo" ? (
                <Loader2 size={24} className="animate-spin text-violet-400" />
              ) : (
                <>
                  <Plus size={24} className="text-zinc-500" />
                  <span className="text-xs text-zinc-500 mt-1">Add Photo</span>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <Phone size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Contact Information</h2>
            <p className="text-sm text-zinc-400">Shown on your public colony page</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Contact Phone</label>
            <input
              type="tel"
              value={branding.contact_phone || ""}
              onChange={(e) => setBranding((prev) => ({ ...prev, contact_phone: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Contact Email</label>
            <input
              type="email"
              value={branding.contact_email || ""}
              onChange={(e) => setBranding((prev) => ({ ...prev, contact_email: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
              placeholder="rwa@society.com"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
