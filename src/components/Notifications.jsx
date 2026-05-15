import { motion } from 'framer-motion';
import { Bell, CheckCircle } from 'lucide-react';

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      title: 'Welcome to Motion Do!',
      desc: 'Your brand new task manager is ready to go.',
      time: 'Just now',
      icon: Bell,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    },
    {
      id: 2,
      title: 'Tasks Synced',
      desc: 'All your tasks have been successfully securely synced to the cloud.',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white mb-2">Notifications</h1>
        <p className="text-gray-500 dark:text-gray-400">Stay updated on your activity.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4 p-4 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border border-gray-200 dark:border-white/10"
          >
            <div className={`p-3 rounded-xl flex-shrink-0 w-fit h-fit ${note.bg} ${note.color}`}>
              <note.icon size={20} />
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold dark:text-white">{note.title}</h3>
                <span className="text-xs text-gray-400">{note.time}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{note.desc}</p>
            </div>
          </motion.div>
        ))}
        
        {notifications.length === 0 && (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center">
            <Bell size={48} className="opacity-20 mb-4" />
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
