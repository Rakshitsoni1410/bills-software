import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-r from-teal-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white mx-auto shadow-2xl"
        >
          ₹
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-3xl font-bold text-slate-900"
        >
          Billing System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-slate-500 mt-2"
        >
          Manage your business from one place
        </motion.p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 4 }}
          className="h-2 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-full mt-8 mx-auto"
        />
      </div>
    </div>
  );
}