import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, AlertTriangle } from 'lucide-react';

const SignOutModal = ({ isOpen, onClose, onConfirm }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          className="relative bg-white rounded-card shadow-hover p-8 w-full max-w-sm z-10"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={28} className="text-error" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-text-primary text-xl mb-2">Sign Out?</h3>
              <p className="text-text-secondary text-sm">Are you sure you want to sign out? You'll need to sign in again to access your courses.</p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">
                Cancel
              </button>
              <button onClick={onConfirm} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-error text-white rounded-btn font-semibold text-sm hover:bg-red-600 transition-all duration-200">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default SignOutModal;
