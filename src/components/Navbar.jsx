import { Search, Moon, Sun, Menu, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Navbar({ theme, setTheme, searchQuery, setSearchQuery, user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/60 dark:bg-[#121214]/60 border-b border-gray-200 dark:border-white/5 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-gray-500 hover:text-indigo-500">
          <Menu size={24} />
        </button>
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100/50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {user && (
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-sm cursor-pointer hover:scale-105 transition-transform"
            >
              <img 
                src={user.picture || "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"} 
                alt="Avatar" 
                className="w-full h-full rounded-full bg-white dark:bg-black object-cover"
                onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/notionists/svg?seed=Felix" }}
              />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#1a1a1e] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                    <p className="text-sm font-medium dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                       setShowDropdown(false);
                       onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
