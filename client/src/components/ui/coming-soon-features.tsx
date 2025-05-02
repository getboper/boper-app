import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgePlus, CalendarRange, Clock, FileSpreadsheet, MessageCircle, Users, CreditCard, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
  tier: 'standard' | 'pro';
  onClick?: () => void;
}

function FeatureCard({ title, description, icon, comingSoon = true, tier, onClick }: FeatureCardProps) {
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
        
        {comingSoon && (
          <div className="flex items-center text-sm text-gray-500 mt-4">
            <BadgePlus className="h-4 w-4 mr-2" />
            <span>Coming soon</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ComingSoonFeatures() {
  const [, setLocation] = useLocation();
  
  // Featured premium features
  const featuredFeatures = [
    {
      id: 'quote-builder',
      name: 'Quote Builder',
      description: 'Create professional quotes with templates and automatic calculations.',
      icon: <FileSpreadsheet className="h-5 w-5" />,
      tier: 'pro' as const,
    },
    {
      id: 'client-portal',
      name: 'Client Portal',
      description: 'Let clients access quotes, invoices, and job progress.',
      icon: <Users className="h-5 w-5" />,
      tier: 'pro' as const,
    },
    {
      id: 'time-tracking',
      name: 'Time Tracking',
      description: 'Track time with built-in timer and hourly rate calculations.',
      icon: <Clock className="h-5 w-5" />,
      tier: 'pro' as const,
    },
    {
      id: 'expenses',
      name: 'Expenses Tracking',
      description: 'Track job expenses and include them in invoices automatically.',
      icon: <CreditCard className="h-5 w-5" />,
      tier: 'pro' as const,
    }
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Premium Features <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-transparent bg-clip-text">Coming Soon</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay ahead of the competition with these premium features coming to Boper Pro. Subscribe now for early access.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {featuredFeatures.map((feature) => (
            <motion.div key={feature.id} variants={itemVariants}>
              <FeatureCard
                title={feature.name}
                description={feature.description}
                icon={feature.icon}
                tier={feature.tier}
              />
            </motion.div>
          ))}
        </motion.div>
        
        <div className="text-center">
          <Button
            onClick={() => setLocation('/coming-soon')}
            variant="outline"
            className="border-amber-200 hover:border-amber-300 bg-gradient-to-r from-amber-500/10 to-yellow-600/10 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-yellow-600/20"
          >
            View All Premium Features <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}