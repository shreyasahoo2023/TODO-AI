import { motion } from 'framer-motion';
import { Target, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import Greeting from './Greeting';

export default function Dashboard({ tasks, userName }) {
  const stats = [
    {
      label: 'Total Tasks',
      value: tasks.length,
      icon: Target,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Completed',
      value: tasks.filter(t => t.completed).length,
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Pending',
      value: tasks.filter(t => !t.completed).length,
      icon: AlertCircle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'High Priority',
      value: tasks.filter(t => t.priority === 'High' && !t.completed).length,
      icon: TrendingUp,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    }
  ];

  const completionRate = tasks.length > 0 
    ? Math.round((stats[1].value / tasks.length) * 100) 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Greeting userName={userName} />

      <div className="mb-4">
        <h2 className="text-xl font-bold dark:text-white mb-1">Productivity Overview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Here's a breakdown of your performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
            className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-indigo-500/10 cursor-default"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2 rounded-xl", stat.bg, stat.color)}>
                <stat.icon size={20} />
              </div>
              <span className="text-2xl font-bold dark:text-white">{stat.value}</span>
            </div>
            <h3 className="font-medium text-gray-500 dark:text-gray-400">{stat.label}</h3>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur">
        <h3 className="font-bold text-lg dark:text-white mb-4">Productivity Score</h3>
        <div className="w-full bg-gray-200 dark:bg-black/20 rounded-full h-4 mb-2 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full"
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          You have completed <span className="font-bold text-indigo-600 dark:text-indigo-400">{completionRate}%</span> of your tasks! Keep it up.
        </p>
      </div>
    </motion.div>
  );
}
