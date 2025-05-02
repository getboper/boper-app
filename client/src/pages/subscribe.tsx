import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';
import { Loader2, CheckCircle, TicketCheck, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils';

// Ensure we have the Stripe public key
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

// Init Stripe outside component to avoid recreating on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Subscription plans
const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 9, // £9/month
    interval: 'month',
    description: 'Perfect for trying out all the premium features'
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 90, // £90/year (essentially 10 months for the price of 12)
    interval: 'year',
    description: 'Our best value plan with 2 months free'
  }
};

// Checkout form component
const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-success?type=subscription',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Subscription Failed",
          description: error.message,
          variant: "destructive",
        });
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect
        // In a real app, we would update the backend here
        await apiRequest("POST", "/api/subscription-success", { 
          paymentIntentId: paymentIntent.id,
        });
        
        // Set subscription as active in localStorage (for demo purposes)
        localStorage.setItem('subscriptionActive', 'true');
        
        setSucceeded(true);
        setProcessing(false);
        
        toast({
          title: "Subscription Activated",
          description: "Thank you for subscribing to Boper Pro!",
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          setLocation('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "Something went wrong processing your subscription",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-lg text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">You're now subscribed!</h2>
        <p className="text-gray-600 mb-6">Thank you for subscribing to Boper Pro.</p>
        <Button
          onClick={() => setLocation('/dashboard')}
          className="btn-3d"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement />
      </div>
      <Button 
        disabled={!stripe || processing} 
        className="w-full btn-3d"
        type="submit"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          <>Subscribe Now</>
        )}
      </Button>
      <p className="text-xs text-center text-gray-500 mt-4">
        Your subscription will renew automatically. You can cancel anytime from your account settings.
      </p>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSelectPlan = async (planId: 'monthly' | 'yearly') => {
    setPlan(planId);
    setLoading(true);
    
    // Store selected plan in localStorage for payment success page
    localStorage.setItem('selectedPlan', planId);
    
    try {
      const response = await apiRequest("POST", "/api/create-subscription", {
        plan: planId
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError("Failed to initialize subscription. Please try again.");
      toast({
        title: "Error",
        description: "There was a problem setting up the subscription",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Upgrade to Boper Pro
          </h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Unlock all premium features and take your business to the next level
          </p>
        </div>
        
        <Tabs 
          defaultValue="monthly" 
          value={plan}
          onValueChange={(v) => setPlan(v as 'monthly' | 'yearly')} 
          className="w-full"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-64 grid-cols-2">
              <TabsTrigger value="monthly" onClick={() => setPlan('monthly')}>Monthly</TabsTrigger>
              <TabsTrigger value="yearly" onClick={() => setPlan('yearly')}>Yearly <span className="ml-1 text-xs text-green-500 font-bold">Save 25%</span></TabsTrigger>
            </TabsList>
          </div>
          
          <div>
            <TabsContent value="monthly" className="mt-0">
              <div className="flex justify-center">
                <Card className="w-full max-w-md border-blue-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Monthly Plan</span>
                      <span className="text-2xl font-bold">£9<span className="text-sm text-gray-500">/month</span></span>
                    </CardTitle>
                    <CardDescription>Billed monthly, cancel anytime</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Unlimited jobs and invoices</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Advanced reporting and analytics</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Custom invoices with your branding</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Priority customer support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full btn-3d bg-gradient-to-r from-blue-500 to-indigo-600"
                      onClick={() => handleSelectPlan('monthly')}
                    >
                      <TicketCheck className="h-4 w-4 mr-2" />
                      Select Monthly Plan
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="yearly" className="mt-0">
              <div className="flex justify-center">
                <Card className="w-full max-w-md border-purple-100 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                    BEST VALUE
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Yearly Plan</span>
                      <span className="text-2xl font-bold">£90<span className="text-sm text-gray-500">/year</span></span>
                    </CardTitle>
                    <CardDescription>Billed annually, 2 months free</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Everything in the monthly plan</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>25% savings compared to monthly</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Advanced client management tools</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Early access to new features</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full btn-3d bg-gradient-to-r from-purple-500 to-indigo-600"
                      onClick={() => handleSelectPlan('yearly')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Select Yearly Plan
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        {clientSecret && (
          <div className="mt-12 max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Complete your subscription</CardTitle>
                <CardDescription>Enter your payment details below</CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              </CardContent>
            </Card>
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setError(null)}
            >
              Try Again
            </Button>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Questions? Need help? Contact us at <a href="mailto:support@getboper.com" className="text-blue-600 hover:text-blue-800">support@getboper.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}