import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Lock, AlertTriangle } from 'lucide-react';

interface SubscriptionGuardProps {
  children: ReactNode;
}

type SubscriptionStatus = 'loading' | 'active' | 'trial' | 'expired';

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [, setLocation] = useLocation();
  
  // In a real app, you would check the subscription status from your backend
  useEffect(() => {
    const checkSubscriptionStatus = () => {
      // Simulate API call
      setTimeout(() => {
        // Check if the user has a stored subscription
        const hasSubscription = localStorage.getItem('subscriptionActive') === 'true';
        
        if (hasSubscription) {
          setStatus('active');
          return;
        }
        
        // Check trial status
        const storedDaysLeft = localStorage.getItem('trialDaysLeft');
        const trialDays = storedDaysLeft ? parseInt(storedDaysLeft) : 14;
        
        if (trialDays <= 0) {
          setStatus('expired');
        } else {
          setStatus('trial');
          setDaysLeft(trialDays);
        }
        
        // Simulate trial countdown (in a real app, this would be handled by your backend)
        // This is just for demo purposes
        const lastCheck = localStorage.getItem('lastTrialCheck');
        const today = new Date().toDateString();
        
        if (lastCheck !== today && trialDays > 0) {
          localStorage.setItem('trialDaysLeft', (trialDays - 1).toString());
          localStorage.setItem('lastTrialCheck', today);
        }
      }, 500);
    };
    
    checkSubscriptionStatus();
  }, []);
  
  // Define paths that are always accessible, even with an expired trial
  const publicPaths = ['/subscribe', '/payment-success'];
  const isPublicPath = publicPaths.some(path => window.location.pathname.includes(path));
  
  // If on a public path or has valid subscription/trial, show the content
  if (isPublicPath || status === 'active' || status === 'trial') {
    return <>{children}</>;
  }
  
  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }
  
  // Trial expired - show upgrade screen
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-auto bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-white/20 rounded-full mr-3">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">Trial Period Expired</h2>
          </div>
          <p>Your 14-day free trial has ended. Subscribe now to continue using all features.</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Limited Access</h3>
                <p className="text-sm text-red-700 mt-1">
                  Your access to Boper features has been restricted. Subscribe now to regain full access to all features and your data.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => setLocation('/subscribe')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Subscribe Now
            </Button>
            
            <div className="text-center">
              <Button 
                variant="link" 
                className="text-slate-500"
                onClick={() => {
                  // Reset trial for demo purposes only
                  // In a real app, you would not have this option
                  localStorage.setItem('trialDaysLeft', '14');
                  localStorage.setItem('lastTrialCheck', '');
                  window.location.reload();
                }}
              >
                Restart Trial (Demo Only)
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}