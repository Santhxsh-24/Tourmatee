import React from 'react';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentPage: string;
  onBack: () => void;
  onStartAgain: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onBack, onStartAgain }) => {
  if (currentPage === 'landing') {
    return null;
  }

  return (
    <motion.div 
      className="nav-buttons"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      {currentPage !== 'selection' && (
        <motion.button
          className="nav-button"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>
      )}
      
      <motion.button
        className="nav-button"
        onClick={onStartAgain}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🏠 Start Again
      </motion.button>
    </motion.div>
  );
};

export default Navigation;