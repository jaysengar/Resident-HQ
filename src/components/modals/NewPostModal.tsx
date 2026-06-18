import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Tag, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ModalShell } from "./ModalShell";
import { useApp } from "@/context/AppContext";
import { uploadToCloudinary } from "@/lib/cloudinary";

export function NewPostModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addPost } = useApp();
  const [content, setContent] = useState("");
  const [type, setType] = useState<"General" | "Buy/Sell">("General");
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (!content.trim() && !imageFile) {
      toast.error("Write something or add an image");
      return;
    }

    setIsUploading(true);
    let imageUrl = undefined;
    try {
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      // TODO: Replace with real Supabase call, for now we keep useApp logic but add imageUrl if they support it
      // I will update useApp.addPost type later, for now we just pass it
      addPost({
        content,
        type,
        price: type === "Buy/Sell" && price ? `₹${price}` : undefined,
        imageUrl,
        contact: contact.trim() || undefined,
      } as any);

      toast.success("Posted to community");
      setContent("");
      setPrice("");
      setContact("");
      setType("General");
      removeImage();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to post");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Create Post">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something with the colony…"
        rows={4}
        disabled={isUploading}
        className="w-full resize-none rounded-2xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
      />

      {imagePreview && (
        <div className="relative mt-3 rounded-2xl overflow-hidden border border-border">
          <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
          <button
            onClick={removeImage}
            disabled={isUploading}
            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 backdrop-blur-sm"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
        >
          <ImageIcon size={14} /> Photo
        </button>
        <button
          onClick={() => setType(type === "Buy/Sell" ? "General" : "Buy/Sell")}
          disabled={isUploading}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            type === "Buy/Sell"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground hover:bg-accent"
          }`}
        >
          <Tag size={14} /> Buy / Sell
        </button>
      </div>

      {type === "Buy/Sell" && (
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={isUploading}
          placeholder="Price (₹)"
          className="mt-3 w-full rounded-2xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
        />
      )}

      <input
        type="tel"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        disabled={isUploading}
        placeholder="WhatsApp / Contact No. (Optional)"
        className="mt-3 w-full rounded-2xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
      />

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={submit}
        disabled={isUploading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {isUploading && <Loader2 size={16} className="animate-spin" />}
        {isUploading ? "Posting..." : "Post"}
      </motion.button>
    </ModalShell>
  );
}
