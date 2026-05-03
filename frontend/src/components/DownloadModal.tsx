"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Download, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  status: "idle" | "downloading" | "success" | "error";
  count: number;
}

export default function DownloadModal({ isOpen, onClose, status, count }: Props) {
  useEffect(() => {
    if (status === "success" && isOpen) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#60a5fa", "#ffffff"],
      });
    }
  }, [status, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40, rotateX: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40, rotateX: 15 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md glass-morphism p-10 shadow-[0_0_50px_rgba(59,130,246,0.15)] border border-white/20 overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Decorative Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />

            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white hover:rotate-90 transition-all duration-300"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center relative z-10">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={`w-24 h-24 rounded-3xl ${
                  status === "success" ? "bg-green-500/20" : "bg-blue-500/20"
                } flex items-center justify-center mb-8 relative`}
              >
                {status === "downloading" ? (
                  <>
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-3xl animate-pulse" />
                  </>
                ) : status === "success" ? (
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </motion.div>
                ) : (
                  <Download className="w-12 h-12 text-blue-400" />
                )}
              </motion.div>

              <h3 className="text-3xl font-black mb-3 tracking-tight">
                {status === "downloading" 
                  ? "Architecting ZIP" 
                  : status === "success" 
                  ? "Operation Success!" 
                  : "Bundle Ready"}
              </h3>
              
              <p className="text-zinc-400 text-lg leading-relaxed mb-10">
                {status === "downloading"
                  ? `Compiling your ${count} assets into a high-speed compression archive.`
                  : status === "success"
                  ? `Success! Your bundle of ${count} assets is ready and initiating transfer.`
                  : `Prepare to download your curated collection of ${count} items.`}
              </p>

              <AnimatePresence mode="wait">
                {status === "success" && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={onClose}
                    className="w-full premium-gradient text-white py-5 rounded-2xl font-bold shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all"
                  >
                    Got it!
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
