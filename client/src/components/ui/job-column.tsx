import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusType } from "@/lib/utils";
import { Job } from "@/types";
import JobCard from "./job-card";

type JobColumnProps = {
  title: string;
  status: StatusType;
  jobs: Job[];
  count: number;
  onStatusChange?: (jobId: number, newStatus: StatusType) => void;
  onDelete?: (jobId: number) => void;
  onEdit?: (job: Job) => void;
  onCreateInvoice?: (jobId: number) => void;
  isLoading?: boolean;
};

export default function JobColumn({
  title,
  status,
  jobs,
  count,
  onStatusChange,
  onDelete,
  onEdit,
  onCreateInvoice,
  isLoading = false,
}: JobColumnProps) {
  const { toast } = useToast();
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const handleAction = (jobId: number, action: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    switch (action) {
      case 'Edit':
        onEdit?.(job);
        break;
      case 'Delete':
        onDelete?.(jobId);
        break;
      case 'Move to Planned':
        onStatusChange?.(jobId, 'planned');
        break;
      case 'Move to In Progress':
        onStatusChange?.(jobId, 'in-progress');
        break;
      case 'Move to Completed':
        onStatusChange?.(jobId, 'completed');
        break;
      case 'Generate Invoice':
        onCreateInvoice?.(jobId);
        break;
      default:
        toast({
          title: "Feature not implemented",
          description: "This feature is coming soon",
        });
    }
  };

  const getAvailableActions = (job: Job) => {
    const actions = ['Edit', 'Delete'];
    
    if (job.status !== 'planned') {
      actions.push('Move to Planned');
    }
    
    if (job.status !== 'in-progress') {
      actions.push('Move to In Progress');
    }
    
    if (job.status !== 'completed') {
      actions.push('Move to Completed');
    }
    
    if (job.status === 'completed' && !job.invoiceId) {
      actions.push('Generate Invoice');
    }
    
    return actions;
  };

  return (
    <Card>
      <CardHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800">{title}</h3>
          <span className={`count-badge ${status}`}>{count}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <JobColumnSkeleton />
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isExpanded={expandedCardId === job.id}
              onToggleExpand={() => setExpandedCardId(expandedCardId === job.id ? null : job.id)}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {getAvailableActions(job).map((action) => (
                    <DropdownMenuItem 
                      key={action}
                      onClick={() => handleAction(job.id, action)}
                    >
                      {action}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </JobCard>
          ))
        ) : (
          <div className="py-4 text-center text-sm text-gray-500">
            No jobs in this category
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JobColumnSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-3 bg-gray-50 rounded-md p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}
