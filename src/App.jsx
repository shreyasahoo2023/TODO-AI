import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import FilterBar from "./components/FilterBar";
import TaskCard from "./components/TaskCard";
import FloatingInput from "./components/FloatingInput";
import Dashboard from "./components/Dashboard";
import Notifications from "./components/Notifications";
import Settings from "./components/Settings";
import Greeting from "./components/Greeting";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  
  // Set up auth token automatically for every API call globally
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('tasks');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  
  const [compactMode, setCompactMode] = useState(() => {
    return JSON.parse(localStorage.getItem('compactMode')) ?? false;
  });

  useEffect(() => {
    localStorage.setItem('compactMode', JSON.stringify(compactMode));
  }, [compactMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Theme Sync
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`);
      setTasks(res.data);
    } catch (e) {
      console.error("Failed fetching tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const addTask = async ({ title, dueDate }) => {
    try {
      const newOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) + 1 : 0;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/add`, { title, dueDate, order: newOrder });
      setTasks(prev => [...prev, res.data]);
    } catch (e) {
      console.error("Failed adding task", e);
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/update/${id}`, { completed: !task.completed });
    } catch (e) {
      console.error("Failed toggling", e);
      // Revert if failed
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: task.completed } : t));
    }
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/delete/${id}`);
    } catch (e) {
      console.error("Failed deleting", e);
      fetchTasks(); // Revert on fail
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    
    // Update locally instantly
    const newTasks = arrayMove(tasks, oldIndex, newIndex);
    // Assign new order mapping conceptually without calling API for EVERYTHING
    // But realistically to persist, we should update the moved task 'order' field.
    // Instead of complex API sync, we'll swap order properties locally and call update for one.
    
    const reordered = newTasks.map((t, idx) => ({...t, order: idx}));
    setTasks(reordered);
    
    // Update API specifically for the moved one
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/update/${active.id}`, { order: newIndex });
    } catch (ignore) {}
  };

  // Filtration logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      
      if (filter === 'pending') return !t.completed;
      if (filter === 'completed') return t.completed;
      if (filter === 'high') return t.priority === 'High';
      return true;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [tasks, filter, searchQuery]);

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    high: tasks.filter(t => t.priority === 'High' && !t.completed).length
  };

  if (authLoading) {
    return <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0a0a0c] flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex bg-transparent min-h-screen">
      <div className="animated-bg" />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col min-w-0 md:ml-64">
        <Navbar theme={theme} setTheme={setTheme} searchQuery={searchQuery} setSearchQuery={setSearchQuery} user={user} onLogout={logout} />

        <div className="p-6 max-w-4xl w-full mx-auto flex-1 relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, position: 'absolute', width: '100%' }} transition={{ duration: 0.3 }}>
                <Dashboard tasks={tasks} userName={user.name} />
              </motion.div>
            )}
            
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, position: 'absolute', width: '100%' }} transition={{ duration: 0.3 }}>
                <Notifications />
              </motion.div>
            )}
            
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, position: 'absolute', width: '100%' }} transition={{ duration: 0.3 }}>
                <Settings 
                  theme={theme} setTheme={setTheme} 
                  userProfile={{name: user.name, email: user.email, picture: user.picture}} 
                  setUserProfile={() => {}} 
                  tasks={tasks}
                  compactMode={compactMode} setCompactMode={setCompactMode}
                />
              </motion.div>
            )}
            
            {activeTab === 'tasks' && (
              <motion.div key="tasks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, position: 'absolute', width: '100%' }} transition={{ duration: 0.3 }}>
                <Greeting userName={user.name} />

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  {counts.pending > 0 && (
                     <p className="text-gray-500 dark:text-gray-400">You have {counts.pending} tasks pending today.</p>
                  )}
                </motion.div>

                <FilterBar filter={filter} setFilter={setFilter} counts={counts} />

                {loading ? (
                   <div className="space-y-4">
                     {[1,2,3].map(i => (
                       <div key={i} className="h-20 w-full animate-pulse bg-gray-200 dark:bg-white/5 rounded-2xl" />
                     ))}
                   </div>
                ) : (
                  <div className="pb-32">
                    {filteredTasks.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring" }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                      >
                        <motion.img 
                          src="https://illustrations.popsy.co/amber/freelancing.svg" 
                          alt="Empty State" 
                          animate={{ y: [0, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                          className="w-64 h-64 mb-6 opacity-80"
                        />
                        <h3 className="text-xl font-medium dark:text-white mb-2">No tasks found</h3>
                        <p className="text-gray-500">You're all caught up! Enjoy your day.</p>
                      </motion.div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={filteredTasks.map(t => t.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <motion.div 
                            layout
                            initial="hidden"
                            animate="visible"
                            variants={{
                              visible: { transition: { staggerChildren: 0.05 } },
                              hidden: {}
                            }}
                            className="space-y-3"
                          >
                            <AnimatePresence>
                              {filteredTasks.map((task) => (
                                <TaskCard 
                                  key={task.id} 
                                  task={task} 
                                  onToggle={toggleTask}
                                  onDelete={deleteTask}
                                  compactMode={compactMode}
                                />
                              ))}
                            </AnimatePresence>
                          </motion.div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {activeTab === 'tasks' && <FloatingInput onAdd={addTask} />}
    </div>
  );
}