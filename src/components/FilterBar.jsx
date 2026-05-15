import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function FilterBar({ filter, setFilter, counts }) {
  const tabs = [
    { id: 'all', label: 'All Tasks', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'high', label: 'High Priority', count: counts.high },
  ];

  return (
    <div className="flex gap-2 p-1 bg-gray-100/50 dark:bg-[#1f1f23]/50 rounded-xl backdrop-blur-md border border-gray-200 dark:border-white/5 w-fit mb-8 overflow-x-auto max-w-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setFilter(tab.id)}
          className={cn(
            "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap z-10",
            filter === tab.id 
              ? "text-indigo-600 dark:text-indigo-400" 
              : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
          )}
        >
          {filter === tab.id && (
            <motion.div
              layoutId="filter-active"
              className="absolute inset-0 bg-white dark:bg-[#2a2a2f] rounded-lg shadow-sm border border-gray-200/50 dark:border-white/5 -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="flex items-center gap-2">
            {tab.label}
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-md",
              filter === tab.id
                ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                : "bg-gray-200 dark:bg-white/10 text-gray-500"
            )}>
              {tab.count}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
