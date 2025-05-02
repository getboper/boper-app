import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [location] = useLocation();

  // Navigation items with colors
  const navItems = [
    {
      href: "/jobs",
      icon: "calendar-todo-line",
      label: "Jobs",
      color: "from-blue-500 to-blue-600",
    },
    {
      href: "/clients",
      icon: "user-3-line",
      label: "Clients",
      color: "from-purple-500 to-purple-600",
    },
    {
      href: "/",
      icon: "dashboard-line",
      label: "Home",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      href: "/invoices",
      icon: "bill-line",
      label: "Invoices",
      color: "from-red-500 to-red-600",
    },
    {
      href: "/settings",
      icon: "settings-4-line",
      label: "Settings",
      color: "from-gray-500 to-gray-600",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-10 py-1 px-2">
      <div className="flex justify-between items-center">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={location === item.href}
            color={item.color}
          />
        ))}
      </div>
    </div>
  );
}

type NavItemProps = {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  color: string;
};

function NavItem({ href, icon, label, active, color }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "py-2 px-3 flex flex-col items-center transition-all rounded-lg",
        active 
          ? `bg-gradient-to-br ${color} text-white shadow-md` 
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      <i className={`ri-${icon} text-xl ${active ? '' : 'mt-0.5'}`}></i>
      <span className={cn(
        "text-xs mt-1 font-medium",
        active ? "text-white" : "text-gray-500"
      )}>
        {label}
      </span>
    </Link>
  );
}
