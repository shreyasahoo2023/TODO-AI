import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, Check, Clock, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function TaskCard({ task, onToggle, onDelete, compactMode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Medium':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Low':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, scale: 0.8, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0 }
      }}
      ref={setNodeRef}
      style={style}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -2 }}
      className={cn(
        "group relative flex items-center rounded-2xl transition-all duration-200",
        compactMode ? "p-2 gap-3" : "p-4 gap-4",
        "bg-white/70 dark:bg-[#1a1a1e]/80 backdrop-blur-xl border border-white/40 dark:border-white/10",
        "hover:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5",
        isDragging && "z-50 shadow-2xl scale-[1.02] opacity-80 cursor-grabbing",
        task.completed ? "opacity-60" : "opacity-100"
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor- grab text-gray-400 hover:text-indigo-500 transition-colors p-1"
      >
        <GripVertical size={18} />
      </div>

      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
          task.completed 
            ? "bg-indigo-500 border-indigo-500 text-white" 
            : "border-gray-300 dark:border-gray-600 hover:border-indigo-400"
        )}
      >
        <AnimatePresence>
          {task.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check size={14} strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-medium truncate transition-all duration-300 text-gray-800 dark:text-gray-100",
          task.completed && "line-through text-gray-400 dark:text-gray-500"
        )}>
          {task.title}
        </h3>
        
        <div className="flex items-center gap-3 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-md border font-medium flex items-center tracking-wide",
            getPriorityColor(task.priority)
          )}>
            {task.priority}
          </span>
          
          {task.dueDate && (
            <span className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock size={12} />
              {task.dueDate}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 transition-all text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
      >
        <Trash2 size={18} />
      </button>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-indigo-500/0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
    </motion.div>
  );
}
