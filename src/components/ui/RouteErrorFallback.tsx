import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export function RouteErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      {/* Animated error icon */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 0 rgba(239,68,68,0)",
            "0 0 30px rgba(239,68,68,0.2)",
            "0 0 0 rgba(239,68,68,0)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6"
      >
        <AlertTriangle size={36} className="text-red-400" />
      </motion.div>

      <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
        Something went wrong
      </h2>
      <p className="text-sm text-zinc-400 mb-6 max-w-md leading-relaxed">
        An unexpected error occurred in this section. You can try again or head back
        to the home page.
      </p>

      {/* Error details — collapsible in production, visible in dev */}
      {import.meta.env.DEV && error && (
        <div className="w-full max-w-lg mb-6 p-4 bg-red-500/5 border border-red-500/15 rounded-2xl text-left overflow-auto max-h-48">
          <p className="text-red-400 font-mono text-xs font-bold mb-1">
            {error.message}
          </p>
          <pre className="text-red-300/60 font-mono text-[10px] whitespace-pre-wrap leading-relaxed">
            {error.stack}
          </pre>
        </div>
      )}

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all"
        >
          <RotateCcw size={14} />
          Try Again
        </motion.button>
        <a
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors"
        >
          <Home size={14} />
          Go Home
        </a>
      </div>
    </motion.div>
  );
}
