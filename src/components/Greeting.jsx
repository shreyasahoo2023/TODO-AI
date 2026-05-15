import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Greeting({ userName = "" }) {
  const [greeting, setGreeting] = useState("");
  const [emoji, setEmoji] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) {
        setGreeting("Good Morning");
        setEmoji("☀️");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good Afternoon");
        setEmoji("🌤️");
      } else if (hour >= 17 && hour < 22) {
        setGreeting("Good Evening");
        setEmoji("🌙");
      } else {
        setGreeting("Working Late?");
        setEmoji("🌌");
      }
    };

    updateGreeting();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1], // Custom premium ease
        scale: { type: "spring", damping: 15, stiffness: 200 }
      }}
      className="mb-8"
    >
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
          {greeting}{userName ? `, ${userName}` : ""}
        </span>
        <motion.span 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="ml-3 inline-block drop-shadow-md"
        >
          {emoji}
        </motion.span>
      </h1>
      
      {/* Subtle Glow Undertext */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1, duration: 1.5 }}
        className="absolute -z-10 blur-3xl w-64 h-12 bg-indigo-500/20 rounded-full top-0 left-0"
      />
    </motion.div>
  );
}
