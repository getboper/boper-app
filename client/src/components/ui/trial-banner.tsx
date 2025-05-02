import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from './button';
import { Clock, X, ChevronUp, ChevronDown, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrialBanner() {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [, setLocation] = useLocation();
  const [hasSubscription, setHasSubscription] = useState(false);
  
  useEffect(() => {
    // Check if the user has a subscription
    const subscriptionActive = localStorage.getItem('subscriptionActive') === 'true';
    setHasSubscription(subscriptionActive);
    
    if (subscriptionActive) {
      // Hide banner completely if user has subscription
      setIsOpen(false);
      return;
    }
    
    // Get trial days left from localStorage (in real app, this would come from backend)
    const storedDaysLeft = localStorage.getItem('trialDaysLeft');
    if (storedDaysLeft) {
      setDaysLeft(parseInt(storedDaysLeft));
    } else {
      // Initialize to 14 days if not set yet
      localStorage.setItem('trialDaysLeft', '14');
      setDaysLeft(14);
    }
  }, []);
  
  // Don't render if user has subscription or banner is closed
  if (!isOpen || hasSubscription) return null;
  
  // Get message based on days left
  const getMessage = () => {
    if (daysLeft <= 0) {
      return "Your trial has expired";
    } else if (daysLeft === 1) {
      return "Your trial expires today";
    } else {
      return `${daysLeft} days left in your trial`;
    }
  };
  
  // Get class based on days left
  const getColorClass = () => {
    if (daysLeft <= 3) {
      return "from-red-500 to-orange-500";
    } else if (daysLeft <= 7) {
      return "from-orange-500 to-amber-500";
    } else {
      return "from-green-500 to-emerald-500";
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative"
      >
        <div className={`rounded-lg overflow-hidden mx-1 mb-1`}>
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            {/* Simple version that doesn't take up too much space */}
            <div className="flex items-center">
              <Clock className={`h-3.5 w-3.5 flex-shrink-0 ${daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-primary'}`} />
              <span className="ml-1.5 text-xs font-medium text-gray-700">
                {getMessage()}
              </span>
            </div>
            
            <div className="flex items-center space-x-1.5">
              {/* Button is smaller and more subtle */}
              <Button
                onClick={() => setLocation('/subscribe')}
                size="sm"
                variant="ghost"
                className="text-xs h-6 px-1.5 py-0 text-primary hover:bg-primary/10 hover:text-primary-600"
              >
                <Crown className="mr-1 h-3 w-3" />
                {daysLeft <= 0 ? 'Subscribe Now' : 'Upgrade'}
              </Button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-0.5 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}