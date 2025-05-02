import { useEffect, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { useLocation } from 'wouter';
import { CheckCircle, Loader2, Calendar, Zap, Lock, BadgeCheck, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const stripe = useStripe();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [message, setMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isSubscription, setIsSubscription] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the "payment_intent_client_secret" query parameter from the URL
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      setMessage('Could not complete payment. No payment information found.');
      setProcessing(false);
      return;
    }

    // Get payment type from query params
    const paymentType = new URLSearchParams(window.location.search).get('type');
    if (paymentType === 'subscription') {
      setIsSubscription(true);
      
      // Get the selected plan from localStorage
      const plan = localStorage.getItem('selectedPlan') as 'monthly' | 'yearly';
      if (plan) {
        setSelectedPlan(plan);
      }
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) {
        setMessage('Could not complete payment. Please try again.');
        setProcessing(false);
        return;
      }

      switch (paymentIntent.status) {
        case 'succeeded':
          // Get invoice ID from query parameter
          const invoiceId = new URLSearchParams(window.location.search).get('invoiceId');
          
          if (invoiceId) {
            // Update invoice status to paid
            apiRequest('POST', '/api/payment-success', { 
              invoiceId,
              paymentIntentId: paymentIntent.id
            })
              .then(() => {
                setSuccess(true);
                setMessage('Payment succeeded! Your invoice has been marked as paid.');
                setProcessing(false);
                toast({
                  title: 'Payment successful',
                  description: 'Thank you for your payment.',
                });
              })
              .catch((error) => {
                console.error('Error updating invoice:', error);
                setSuccess(true); // Still count as success since payment went through
                setMessage('Payment succeeded! However, there was an issue updating your invoice. Please contact support.');
                setProcessing(false);
              });
          } else if (isSubscription) {
            // Handle subscription payment
            
            // Set subscription as active in localStorage (for demo purposes)
            localStorage.setItem('subscriptionActive', 'true');
            setSuccess(true);
            setMessage('Your subscription is now active!');
            setProcessing(false);
            
            toast({
              title: 'Subscription activated',
              description: 'Thank you for subscribing to Boper.',
            });
            
            // Auto redirect after 8 seconds for subscriptions
            setTimeout(() => {
              setLocation('/dashboard');
            }, 8000);
          } else {
            setSuccess(true);
            setMessage('Payment succeeded!');
            setProcessing(false);
          }
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          setProcessing(false);
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          setProcessing(false);
          break;
        default:
          setMessage('Something went wrong with your payment.');
          setProcessing(false);
          break;
      }
    });
  }, [stripe, toast, setLocation, isSubscription]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const subscriptionFeatures = [
    {
      icon: <BadgeCheck className="h-5 w-5 text-blue-500" />,
      title: "Full Access",
      description: "You now have access to all Boper features"
    },
    {
      icon: <Calendar className="h-5 w-5 text-purple-500" />,
      title: selectedPlan === 'yearly' ? "Annual Plan" : "Monthly Plan",
      description: selectedPlan === 'yearly' 
        ? "Your subscription will renew annually" 
        : "Your subscription will renew monthly"
    },
    {
      icon: <Shield className="h-5 w-5 text-green-500" />,
      title: "Secured Payment",
      description: "Your payment information is securely stored"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4">
      {processing ? (
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Processing your payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment.</p>
        </div>
      ) : success ? (
        <motion.div 
          className="sm:mx-auto sm:w-full sm:max-w-lg"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="bg-white py-10 px-6 shadow-2xl sm:rounded-xl sm:px-12 text-center relative overflow-hidden"
            variants={itemVariants}
          >
            {/* Success confetti effect */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
              className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-12 w-12 text-green-500" />
            </motion.div>
            
            <motion.h2 
              variants={itemVariants} 
              className="text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
            >
              {isSubscription ? "Subscription Activated!" : "Payment Successful!"}
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 mb-8"
            >
              {message}
            </motion.p>
            
            {isSubscription && (
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              >
                {subscriptionFeatures.map((feature, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 rounded-lg p-4 text-center"
                  >
                    <div className="mx-auto w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
                      {feature.icon}
                    </div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                  </div>
                ))}
              </motion.div>
            )}
            
            <motion.div variants={itemVariants} className="flex flex-col space-y-3">
              {isSubscription ? (
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setLocation('/invoices')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    View Invoices
                  </Button>
                  <Button
                    onClick={() => setLocation('/dashboard')}
                    variant="outline"
                    className="w-full border-gray-300"
                  >
                    Return to Dashboard
                  </Button>
                </>
              )}
              
              <p className="text-sm text-gray-500 mt-4">
                If you have any questions, please contact our support team at{" "}
                <a href="mailto:support@getboper.com" className="text-blue-600 hover:underline">
                  support@getboper.com
                </a>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="text-yellow-500 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Status</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => isSubscription ? setLocation('/subscribe') : setLocation('/invoices')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {isSubscription ? 'Try Again' : 'View Invoices'}
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full border-gray-300"
            >
              Go Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}