import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ComingSoonFeatures from "@/components/ui/coming-soon-features";
import {
  Check,
  CalendarIcon,
  FileText,
  Users,
  BarChart4,
  Clock
} from "lucide-react";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Navbar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-50 transition-all">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4">
              <img src="/logo.svg" alt="Boper Logo" className="h-10" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GetBoper.com
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="link">Login</Button>
            </Link>
            <Link href="/subscribe">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-20 md:pb-28">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              >
                <span className="block">Book Jobs.</span>
                <span className="block">Get Paid.</span>
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Stay Organised.
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-600 mb-8 md:pr-12"
              >
                The all-in-one platform for trades and service businesses to manage jobs, clients, 
                and invoices. Keep track of your work and get paid faster.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/subscribe">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg w-full sm:w-auto">
                    Start 14-Day Free Trial
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    See Features
                  </Button>
                </Link>
              </motion.div>
            </div>
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="relative"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl transform rotate-2 p-1">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <img 
                      src="/dashboard-preview.png" 
                      alt="Boper Dashboard" 
                      className="w-full h-auto rounded-lg shadow-lg"
                      onError={(e) => { 
                        e.currentTarget.src = 'https://placehold.co/800x500/5461F9/ffffff?text=Boper+Dashboard';
                      }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-yellow-400 rounded-full px-6 py-2 font-bold text-black transform rotate-3 shadow-lg">
                  14-day free trial!
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need To Run Your Business</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Boper provides all the tools for service professionals to manage jobs, clients, and get paid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <CalendarIcon className="h-10 w-10 text-blue-500" />,
                title: "Job Management",
                description:
                  "Schedule jobs with an interactive calendar view. Track status from booked to paid."
              },
              {
                icon: <Users className="h-10 w-10 text-purple-500" />,
                title: "Client Profiles",
                description:
                  "Keep all your client information organized with detailed profiles and job history."
              },
              {
                icon: <FileText className="h-10 w-10 text-green-500" />,
                title: "Smart Invoicing",
                description:
                  "Create professional invoices in seconds and track payments with ease."
              },
              {
                icon: <BarChart4 className="h-10 w-10 text-indigo-500" />,
                title: "Earnings Tracker",
                description:
                  "Monitor your income, outstanding invoices, and financial performance in real-time."
              },
              {
                icon: <Clock className="h-10 w-10 text-teal-500" />,
                title: "Time Saving",
                description:
                  "Save hours on administration and focus on what you do best - your actual work."
              },
              {
                icon: <Check className="h-10 w-10 text-emerald-500" />,
                title: "Free Trial",
                description:
                  "Try all features free for 14 days. No credit card required to start."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="mb-4 p-3 bg-gray-100 rounded-full w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works for your business.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
            {/* Standard Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex-1 bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Standard</h3>
                <p className="opacity-90">Perfect for small businesses</p>
              </div>
              <div className="p-8">
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">£9</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-gray-600 mb-6">Or £90/year (save £18)</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited jobs",
                    "Unlimited clients",
                    "Unlimited invoices",
                    "Job calendar",
                    "PDF invoicing",
                    "Earnings tracking",
                    "Email support"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/subscribe">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Start 14-Day Free Trial
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700 relative transform scale-105"
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-black font-bold px-4 py-1 rounded-bl-lg">
                Coming Soon
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6 text-black">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <p className="opacity-90">For growing businesses</p>
              </div>
              <div className="p-8 text-white">
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">£19</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <p className="text-gray-400 mb-6">Or £190/year (save £38)</p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "All Standard features",
                    "Quote builder",
                    "Client portal",
                    "Booking requests",
                    "Expense tracking",
                    "Time tracking",
                    "Advanced calendar",
                    "Team collaboration",
                    "Priority support",
                    "Gold/black theme"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-yellow-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full opacity-70 cursor-not-allowed bg-gradient-to-r from-yellow-600 to-amber-600 text-white">
                  Coming Soon
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Coming Soon Features */}
      <ComingSoonFeatures />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get organized?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Start your 14-day free trial today. No credit card required.
          </p>
          <Link href="/subscribe">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <img src="/logo.svg" alt="Boper Logo" className="h-8 mr-3" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  GetBoper.com
                </h3>
              </div>
              <p className="text-gray-400 mt-2">© {new Date().getFullYear()} Boper. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-gray-300">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-300">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}