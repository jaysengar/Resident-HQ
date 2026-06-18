import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { ModalShell } from "./ModalShell";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { uploadDocument } from "@/lib/api/api";

export function DocumentUploadModal({
  open,
  onClose,
  onUploadSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Guidelines");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !title) {
      toast.error("Please provide a title and select a file.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      await uploadDocument({ title, category, url });
      toast.success("Document uploaded successfully!");
      onUploadSuccess();
      onClose();
      // Reset form
      setFile(null);
      setTitle("");
      setCategory("Guidelines");
    } catch (e: any) {
      toast.error("Upload failed", { description: e.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Upload Document">
      <div className="space-y-4 p-1">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Document Title
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            placeholder="e.g. Society Bye-laws 2024"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Category
          </label>
          <select
            className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Guidelines">Guidelines</option>
            <option value="Financial">Financial Reports</option>
            <option value="Legal">Legal</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            File (PDF, Image)
          </label>
          {file ? (
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3">
              <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-background text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/30 py-8 transition-colors hover:bg-muted/50">
              <UploadCloud size={24} className="mb-2 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Tap to select a file</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleUpload}
          disabled={uploading || !file || !title}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Uploading...
            </>
          ) : (
            "Upload Document"
          )}
        </motion.button>
      </div>
    </ModalShell>
  );
}
