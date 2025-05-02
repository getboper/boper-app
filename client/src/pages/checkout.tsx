import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from 'wouter';
import { Loader2, CheckCircle, PoundSterling } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, invoiceId }: { amount: number, invoiceId: number }) => {
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
          return_url: window.location.origin + '/payment-success',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect, mark the invoice as paid
        await apiRequest("POST", "/api/payment-success", { 
          invoiceId,
          paymentIntentId: paymentIntent.id,
        });
        
        setSucceeded(true);
        setProcessing(false);
        
        toast({
          title: "Payment Successful",
          description: "Thank you for your payment!",
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          setLocation('/invoices');
        }, 2000);
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "Something went wrong processing your payment",
        variant: "destructive",
      });
      setProcessing(false);
    }
  }

  if (succeeded) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-lg text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Thank you for your payment.</p>
        <button
          onClick={() => setLocation('/invoices')}
          className="btn-3d"
        >
          Return to Invoices
        </button>
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
          <>Pay {formatCurrency(amount)}</>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location] = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.split('?')[1]);
    const amount = Number(queryParams.get('amount')) || 0;
    const invoiceId = Number(queryParams.get('invoiceId')) || null;

    if (!amount || !invoiceId) {
      setError("Missing required payment information");
      setLoading(false);
      return;
    }

    setAmount(amount);
    setInvoiceId(invoiceId);

    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { 
      amount,
      invoiceId,
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to initialize payment");
        setLoading(false);
      });
  }, [location]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl p-8 shadow-lg">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">Payment Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => window.history.back()}
              className="btn-3d"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" 
          aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Complete your payment
          </h2>
          <p className="mt-2 text-gray-600">
            Securely pay with credit or debit card
          </p>
        </div>
        
        <div className="card-glossy">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Payment Amount</p>
              <div className="flex items-center">
                <PoundSterling className="h-5 w-5 text-gray-400 mr-1" />
                <span className="text-2xl font-bold">{amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <img src="/images/powered-by-stripe.svg" alt="Powered by Stripe" className="h-6" />
          </div>
          
          {/* Make SURE to wrap the form in <Elements> which provides the stripe context */}
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <CheckoutForm amount={amount} invoiceId={invoiceId!} />
          </Elements>
        </div>
      </div>
    </div>
  );
};