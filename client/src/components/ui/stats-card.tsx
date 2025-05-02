import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { CalendarDays, PoundSterling, Briefcase, Users } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: number | string;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
  icon: React.ReactNode;
  change?: string;
  changeIsPositive?: boolean;
  loading?: boolean;
  isCurrency?: boolean;
};

export default function StatsCard({
  title,
  value,
  variant,
  icon,
  change,
  changeIsPositive = true,
  loading = false,
  isCurrency = false,
}: StatsCardProps) {
  return (
    <div className={`stats-card ${variant}`}>
      <h2 className="text-white/80 text-sm font-medium mb-2">{title}</h2>
      <div className="flex items-end">
        {loading ? (
          <Skeleton className="h-8 w-24 bg-white/20" />
        ) : (
          <>
            <p className="text-3xl font-bold">
              {isCurrency ? 
                <>£{typeof value === 'number' ? value.toLocaleString('en-GB') : Number(value).toLocaleString('en-GB')}</> : 
                value
              }
            </p>
            {change && (
              <p className={`text-xs ${changeIsPositive ? 'text-white/80' : 'text-white/70'} ml-2 font-medium`}>
                {change}
              </p>
            )}
          </>
        )}
      </div>
      <div className="stats-card-icon">
        {icon}
      </div>
    </div>
  );
}

type StatsSectionProps = {
  loading: boolean;
  stats?: {
    activeJobs: number;
    pendingInvoices: number;
    monthlyRevenue: number;
    totalClients: number;
  };
};

export function StatsSection({ loading, stats }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatsCard
        title="Active Jobs"
        value={stats?.activeJobs || 0}
        variant="primary"
        icon={<Briefcase size={38} />}
        change="+3 from last month"
        loading={loading}
      />
      <StatsCard
        title="Pending Invoices"
        value={stats?.pendingInvoices || 0}
        variant="warning"
        icon={<CalendarDays size={38} />}
        change="+2 from last month"
        changeIsPositive={false}
        loading={loading}
      />
      <StatsCard
        title="Monthly Revenue"
        value={stats?.monthlyRevenue || 0}
        variant="success"
        icon={<PoundSterling size={38} />}
        change="+12% from last month"
        isCurrency={true}
        loading={loading}
      />
      <StatsCard
        title="Total Clients"
        value={stats?.totalClients || 0}
        variant="secondary"
        icon={<Users size={38} />}
        change="+3 new this month"
        loading={loading}
      />
    </div>
  );
}
