import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgePlus, CalendarRange, Clock, FileSpreadsheet, MessageCircle, Users, Wrench, CreditCard, Crown } from 'lucide-react';
import { useLocation } from 'wouter';

// Define the Pro features
const PRO_FEATURES = [
  {
    id: 'quote-builder',
    name: 'Quote Builder',
    description: 'Create professional-looking quotes for your clients with customizable templates and automatic calculations.',
    icon: FileSpreadsheet,
    tier: 'pro' as const,
    category: 'client' as const,
  },
  {
    id: 'client-portal',
    name: 'Client Portal',
    description: 'Give your clients access to a portal where they can view quotes, invoices, and job progress.',
    icon: Users,
    tier: 'pro' as const,
    category: 'client' as const,
  },
  {
    id: 'booking-requests',
    name: 'Booking Requests',
    description: 'Allow clients to request appointments online through your website or a shared booking link.',
    icon: CalendarRange,
    tier: 'pro' as const,
    category: 'scheduling' as const,
  },
  {
    id: 'expenses',
    name: 'Expenses Tracking',
    description: 'Track job-related expenses, attach receipts, and include them in invoices automatically.',
    icon: CreditCard,
    tier: 'pro' as const,
    category: 'finance' as const,
  },
  {
    id: 'time-tracking',
    name: 'Time Tracking',
    description: 'Track time spent on jobs with a built-in timer, hourly rate calculations, and timesheet reports.',
    icon: Clock,
    tier: 'pro' as const,
    category: 'scheduling' as const,
  },
  {
    id: 'advanced-calendar',
    name: 'Advanced Calendar',
    description: 'Get an enhanced calendar with color-coded job types, recurring jobs, and team scheduling views.',
    icon: CalendarRange,
    tier: 'pro' as const,
    category: 'scheduling' as const,
  },
  {
    id: 'team',
    name: 'Team Collaboration',
    description: 'Add team members with different permission levels, assign jobs, and track individual performance.',
    icon: Users,
    tier: 'pro' as const,
    category: 'team' as const,
  },
  {
    id: 'support',
    name: 'Priority Support',
    description: 'Get priority support with faster response times and dedicated account management.',
    icon: MessageCircle,
    tier: 'pro' as const,
    category: 'support' as const,
  },
];

type Category = 'all' | 'client' | 'scheduling' | 'finance' | 'team' | 'support';

export default function ComingSoon() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [, setLocation] = useLocation();
  
  const filteredFeatures = activeCategory === 'all'
    ? PRO_FEATURES
    : PRO_FEATURES.filter(feature => feature.category === activeCategory);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="inline-block mb-4">
          <div className="relative">
            <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 blur-sm opacity-70"></span>
            <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-full text-xs font-bold">
              PREMIUM FEATURES
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-yellow-500 to-amber-700 text-transparent bg-clip-text">
          Coming Soon to Boper Pro
        </h1>
        
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Check out these exciting Pro features we're working on. Subscribe to Boper Pro to get early access as soon as they're released.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button 
            variant="outline" 
            className="bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border-amber-200 hover:border-amber-300 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-600/20"
            onClick={() => setLocation('/subscribe')}
          >
            <Crown className="mr-2 h-4 w-4 text-amber-500" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveCategory(value as Category)}>
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 bg-gradient-to-r from-gray-100 to-gray-200">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="client">Client</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FeatureCard 
                title={feature.name} 
                description={feature.description} 
                icon={<feature.icon className="h-5 w-5" />}
                tier={feature.tier}
              />
            </motion.div>
          ))}
        </div>
      </Tabs>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Have a feature suggestion?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          We're constantly improving Boper based on user feedback. Let us know what feature you'd like to see next!
        </p>
        <Button 
          variant="outline"
          className="bg-white border-gray-200"
          onClick={() => window.open('mailto:feedback@getboper.com')}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Send Feedback
        </Button>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  tier: 'standard' | 'pro';
  onClick?: () => void;
}

function FeatureCard({ title, description, icon, tier, onClick }: FeatureCardProps) {
  const isPro = tier === 'pro';
  
  return (
    <Card 
      className={`overflow-hidden h-full transition-all duration-300 hover:shadow-lg ${
        isPro 
          ? "border-amber-200 hover:border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50" 
          : "border-blue-100 hover:border-blue-200"
      }`}
      onClick={onClick}
    >
      {isPro && (
        <div className="absolute right-0 top-0">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
            PRO
          </div>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center">
          <div className={`p-2 rounded-full mr-3 ${
            isPro 
              ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-white" 
              : "bg-gradient-to-br from-blue-400 to-purple-600 text-white"
          }`}>
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
      
      <CardFooter>
        <div className="flex items-center text-sm text-gray-500">
          <BadgePlus className="h-4 w-4 mr-2" />
          <span>Coming soon</span>
        </div>
      </CardFooter>
    </Card>
  );
}