import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import TrialBanner from "./trial-banner";
import { Button } from "./button";
import { Badge } from "./badge";

type SidebarProps = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: SidebarProps = {}) {
  const [location] = useLocation();
  
  // Mock subscription status for UI demonstration
  // In a real implementation, this would come from your authentication/subscription system
  const [subscription, setSubscription] = useState<'none' | 'active'>('none');
  
  // Navigation tiles configuration
  const navTiles = [
    {
      href: "/dashboard",
      icon: "dashboard-line",
      label: "Dashboard",
      color: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/30"
    },
    {
      href: "/jobs",
      icon: "briefcase-line",
      label: "Jobs",
      color: "from-purple-500 to-purple-600",
      shadowColor: "shadow-purple-500/30"
    },
    {
      href: "/calendar",
      icon: "calendar-todo-line",
      label: "Calendar",
      color: "from-cyan-500 to-cyan-600",
      shadowColor: "shadow-cyan-500/30"
    },
    {
      href: "/clients",
      icon: "user-3-line",
      label: "Clients",
      color: "from-violet-500 to-violet-600",
      shadowColor: "shadow-violet-500/30"
    },
    {
      href: "/invoices",
      icon: "bill-line",
      label: "Invoices",
      color: "from-red-500 to-red-600",
      shadowColor: "shadow-red-500/30"
    },
    {
      href: "/reports",
      icon: "bar-chart-2-line",
      label: "Reports",
      color: "from-green-500 to-green-600",
      shadowColor: "shadow-green-500/30"
    }
  ];

  return (
    <aside className="bg-white border-r border-gray-200 hidden md:flex md:flex-col w-64 flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold shadow-lg">
              B
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-800">Boper</h1>
          </div>
        </Link>
      </div>

      {/* Trial Banner */}
      <div className="p-3">
        <TrialBanner />
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {navTiles.map((tile) => (
            <DashboardTile
              key={tile.href}
              href={tile.href}
              icon={tile.icon}
              label={tile.label}
              active={tile.href.includes('?') 
                ? location.startsWith(tile.href.split('?')[0])
                : location === tile.href}
              color={tile.color}
              shadowColor={tile.shadowColor}
              onClick={onClose}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Pro Features (Coming Soon) */}
        <div className="mb-3">
          <div className="flex items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Pro Features</h3>
            <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
              Coming Soon
            </Badge>
          </div>
          <div className="space-y-2">
            {[
              { icon: "file-list-3-line", label: "Quote Builder" },
              { icon: "user-shared-line", label: "Client Portal" },
              { icon: "calendar-event-line", label: "Booking Requests" },
              { icon: "receipt-line", label: "Expenses Tracking" },
              { icon: "time-line", label: "Time Tracking" }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center p-2 text-gray-400 rounded-md cursor-not-allowed group"
              >
                <i className={`ri-${item.icon} text-lg mr-2 opacity-70`}></i>
                <span className="text-sm">{item.label}</span>
                <span className="ml-auto text-xs opacity-0 group-hover:opacity-70 transition-opacity">Soon</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User profile"
              />
              <AvatarFallback>JM</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">John Miller</p>
              <p className="text-xs text-gray-500">john@example.com</p>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <i className="ri-settings-4-line text-lg"></i>
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}

type DashboardTileProps = {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  color: string;
  shadowColor: string;
  onClick?: () => void;
};

function DashboardTile({ href, icon, label, active, color, shadowColor, onClick }: DashboardTileProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 rounded-xl transition-all h-24",
        "bg-gradient-to-br shadow-lg transform hover:-translate-y-1 hover:shadow-xl",
        "before:absolute before:inset-0 before:z-0 before:rounded-xl before:bg-white/10 before:backdrop-blur-sm",
        color,
        shadowColor,
        active ? "scale-105 ring-2 ring-white" : ""
      )}
    >
      <i className={`ri-${icon} text-3xl text-white mb-2 z-10`}></i>
      <span className="font-medium text-white z-10">{label}</span>
    </Link>
  );
}

// Keep the original NavItem for mobile navigation
type NavItemProps = {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  onClick?: () => void;
};

function NavItem({ href, icon, label, active, onClick }: NavItemProps) {
  return (
    <li className="mb-1">
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center px-4 py-3 rounded-md",
          active
            ? "text-primary bg-blue-50 font-medium"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <i className={`ri-${icon} mr-3 text-lg`}></i>
        {label}
      </Link>
    </li>
  );
}
