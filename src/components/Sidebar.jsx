import { LayoutDashboard, CheckSquare, Settings, Bell, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: CheckSquare, label: 'Tasks', id: 'tasks' },
  { icon: Bell, label: 'Notifications', id: 'notifications' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

import { X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) {
  const { logout } = useAuth();
  
  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex-shrink-0 h-screen border-r border-gray-200 dark:border-white/5 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-xl transition-transform duration-300 z-50 flex flex-col",
        "fixed md:sticky top-0 left-0",
        "w-64 md:w-20 lg:w-64",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
              ✨
            </div>
            <span className="font-bold text-xl tracking-tight md:hidden lg:block bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Motion Do
            </span>
          </div>
          <button 
            className="md:hidden text-gray-500 hover:text-red-500"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all relative group",
              activeTab === item.id 
                ? "text-indigo-600 dark:text-indigo-400" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5"
            )}
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className="relative z-10 w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="relative z-10 font-medium md:hidden lg:block">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-3">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-100 dark:border-red-500/10"
        >
          <LogOut size={16} />
          Sign Out
        </button>


      </div>
    </div>
    </>
  );
}
