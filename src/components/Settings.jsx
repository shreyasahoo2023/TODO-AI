import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Moon, Bell, Check, Edit2, Sliders, HardDrive, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Settings({ theme, setTheme, tasks, compactMode, setCompactMode }) {
  const { user, login } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(user?.name || '');
  const [draftEmail, setDraftEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [pushEnabled, setPushEnabled] = useState(() => {
    return JSON.parse(localStorage.getItem('pushEnabled')) ?? true;
  });
  
  const [emailEnabled, setEmailEnabled] = useState(() => {
    return JSON.parse(localStorage.getItem('emailEnabled')) ?? false;
  });

  useEffect(() => localStorage.setItem('pushEnabled', JSON.stringify(pushEnabled)), [pushEnabled]);
  useEffect(() => localStorage.setItem('emailEnabled', JSON.stringify(emailEnabled)), [emailEnabled]);

  const handlePushToggle = (checked) => {
    setPushEnabled(checked);
    if (checked && "Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Notifications Enabled!", {
            body: "You will receive notifications here.",
            icon: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
          });
          setMsg("Push notifications enabled!");
          setTimeout(() => setMsg(""), 3000);
        } else {
          setPushEnabled(false);
          setMsg("Permission denied for notifications.");
          setTimeout(() => setMsg(""), 3000);
        }
      });
    }
  };

  const handleEmailToggle = (checked) => {
    setEmailEnabled(checked);
    setMsg("Email preferences saved! (Note: Emails are mocked)");
    setTimeout(() => setMsg(""), 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/auth/update-profile`, {
        name: draftName,
        email: draftEmail
      });
      
      // Update global context
      if (res.data.user && res.data.token) {
        login(res.data.user, res.data.token);
      }
      
      setMsg("Profile updated successfully!");
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      setMsg(e.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ userProfile, tasks }, null, 2));
    const objUrl = document.createElement('a');
    objUrl.setAttribute("href", dataStr);
    objUrl.setAttribute("download", "todo_backup.json");
    document.body.appendChild(objUrl);
    objUrl.click();
    objUrl.remove();
  };

  const sections = [
    {
      title: 'Appearance',
      icon: Moon,
      content: (
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium dark:text-gray-200">Dark Mode</h4>
            <p className="text-sm text-gray-500">Toggle dark specific theme</p>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              theme === 'dark' ? "bg-indigo-500" : "bg-gray-300"
            )}
          >
            <div className={cn(
               "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
               theme === 'dark' ? "translate-x-6" : ""
            )} />
          </button>
        </div>
      )
    },
    {
      title: 'UI Preferences',
      icon: Sliders,
      content: (
        <div className="flex items-center justify-between mt-2">
          <div>
            <h4 className="font-medium dark:text-gray-200">Compact Mode</h4>
            <p className="text-sm text-gray-500">Reduce padding on the Task Cards</p>
          </div>
          <button
            onClick={() => setCompactMode(!compactMode)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              compactMode ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"
            )}
          >
            <div className={cn(
               "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
               compactMode ? "translate-x-6" : ""
            )} />
          </button>
        </div>
      )
    },
    {
      title: 'Account',
      icon: User,
      content: (
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 flex-shrink-0">
             <img 
               src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" 
               alt="avatar"
               className="w-full h-full rounded-full bg-white dark:bg-black object-cover" 
             />
          </div>
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-2 mb-2"
                >
                  <input 
                    type="text" 
                    value={draftName} 
                    onChange={e => setDraftName(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1e] border border-gray-200 dark:border-white/10 rounded-md px-2 py-1 text-sm outline-none focus:border-indigo-500 dark:text-white"
                  />
                  <input 
                    type="email" 
                    value={draftEmail} 
                    onChange={e => setDraftEmail(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-[#1a1a1e] border border-gray-200 dark:border-white/10 rounded-md px-2 py-1 text-sm outline-none focus:border-indigo-500 dark:text-white"
                  />
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h4 className="font-semibold dark:text-white">{user?.name || 'User'}</h4>
                  <p className="text-sm text-gray-400 mb-2">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
              disabled={saving}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5",
                isEditing 
                  ? "bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50"
                  : "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 dark:text-gray-300"
              )}
            >
               {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isEditing ? <><Check size={14} /> Save Profile</> : <><Edit2 size={14} /> Edit Profile</>}
            </button>
          </div>
        </div>
      )
    },
    {
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm dark:text-gray-300">Push Notifications</span>
              <input 
                type="checkbox" 
                checked={pushEnabled} 
                onChange={e => handlePushToggle(e.target.checked)}
                className="accent-indigo-500 w-4 h-4 cursor-pointer" 
              />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm dark:text-gray-300">Email Updates</span>
              <input 
                type="checkbox" 
                checked={emailEnabled} 
                onChange={e => handleEmailToggle(e.target.checked)}
                className="accent-indigo-500 w-4 h-4 cursor-pointer" 
              />
          </div>
        </div>
      )
    },
    {
      title: 'Data Management',
      icon: HardDrive,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm dark:text-gray-300 font-medium block">Export Tasks</span>
              <span className="text-xs text-gray-400">Download your {tasks?.length} tasks locally</span>
            </div>
            <button 
              onClick={handleExport}
              className="text-xs px-3 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-md font-medium transition-colors flex items-center gap-1.5 dark:text-white"
            >
               <Download size={14} /> Export Backup
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your account preferences and data.</p>
        </div>
        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="text-sm font-medium px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-500/20"
            >
              {msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border border-gray-200 dark:border-white/10"
          >
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
              <section.icon size={18} className="text-indigo-500" />
              <h3 className="font-semibold dark:text-white">{section.title}</h3>
            </div>
            
            <div className="pl-1">
              {section.content}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
