import { motion } from "framer-motion";
import { ReceiptIndianRupee } from "lucide-react";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center z-50">

      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="absolute w-96 h-96 rounded-full bg-indigo-500 blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500 blur-3xl"
      />

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-[360px] rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl p-10 text-center shadow-2xl"
      >
        {/* Logo */}
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            type: "spring",
          }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-2xl"
        >
          <ReceiptIndianRupee
            size={44}
            className="text-white"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-3xl font-extrabold tracking-wide text-white"
        >
          Bills Software
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-3 text-sm leading-6 text-slate-300"
        >
          Smart GST Billing & Invoice Management
        </motion.p>

        {/* Loading Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="h-3 w-3 rounded-full bg-cyan-400"
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 3,
              ease: "easeInOut",
            }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500"
          />
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Loading your dashboard...
        </p>
      </motion.div>
    </div>
  );
}