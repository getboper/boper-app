import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, getRelativeTimeString } from "@/lib/utils";
import { Activity } from "@/types";

const ActivityIcon = ({ type }: { type: string }) => {
  const iconMap: Record<string, { icon: string; bgColor: string; textColor: string }> = {
    JOB_STATUS_CHANGE: { icon: "calendar-check-line", bgColor: "bg-blue-100", textColor: "text-primary" },
    INVOICE_PAID: { icon: "bill-line", bgColor: "bg-green-100", textColor: "text-secondary" },
    CLIENT_ADDED: { icon: "user-add-line", bgColor: "bg-violet-100", textColor: "text-inprogress" },
    JOB_SCHEDULED: { icon: "calendar-todo-line", bgColor: "bg-amber-100", textColor: "text-accent" },
    JOB_COMPLETED: { icon: "check-line", bgColor: "bg-green-100", textColor: "text-secondary" },
  };

  const { icon, bgColor, textColor } = iconMap[type] || { icon: "information-line", bgColor: "bg-gray-100", textColor: "text-gray-500" };

  return (
    <div className={`flex-shrink-0 w-8 h-8 ${bgColor} rounded-full flex items-center justify-center mr-3`}>
      <i className={`ri-${icon} ${textColor}`}></i>
    </div>
  );
};

export default function ActivityFeed() {
  const { data, isLoading, error } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Error loading activities</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-72 overflow-y-auto">
          {isLoading ? (
            <ActivitySkeleton />
          ) : data && data.length > 0 ? (
            <ul className="space-y-4">
              {data.map((activity) => (
                <li key={activity.id} className="flex items-start">
                  <ActivityIcon type={activity.type} />
                  <div>
                    <p className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: activity.description }} />
                    <p className="text-xs text-gray-500 mt-1">{getRelativeTimeString(activity.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <ul className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <li key={i} className="flex items-start">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full mr-3" />
          <div className="w-full">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}
