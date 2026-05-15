import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function FloatingInput({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title,
      dueDate: dueDate ? format(new Date(dueDate), 'MMM d, yyyy') : null
    });
    setTitle("");
    setDueDate("");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50"
        whileHover={{ rotate: 90 }}
        onClick={() => setIsOpen(true)}
      >
        <Plus size={28} />
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 sm:p-0"
          >
            {/* Modal */}
            <motion.div
              initial={{ y: 200, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 200, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-[#1a1a1e] rounded-3xl sm:rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold dark:text-white">Create New Task</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    autoFocus
                    placeholder="E.g., Review PRs, Buy groceries..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-lg bg-transparent border-b-2 border-gray-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 py-3 outline-none transition-colors dark:text-white placeholder-gray-400"
                  />
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/5">
                    <Calendar size={16} className="text-gray-400" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-transparent text-sm outline-none text-gray-600 dark:text-gray-300 dark:[color-scheme:dark]"
                    />
                  </div>
                  

                </div>

                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  Add Task
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
