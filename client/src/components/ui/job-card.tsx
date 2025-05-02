import { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { Job } from "@/types";

type JobCardProps = {
  job: Job;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  children?: ReactNode;
};

export default function JobCard({ job, isExpanded = false, onToggleExpand, children }: JobCardProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'planned':
        return 'planned';
      case 'in-progress':
        return 'in-progress';
      case 'completed':
        return 'completed';
      default:
        return 'planned';
    }
  };

  const statusClass = getStatusClass(job.status);
  const dateLabel = job.status === 'in-progress' 
    ? `${job.progress || 0}%` 
    : formatShortDate(job.dueDate);

  return (
    <div className={`job-card ${statusClass}`}>
      <div className="flex items-center justify-between mb-2">
        <button 
          className="text-sm font-medium text-gray-800 text-left hover:text-primary focus:outline-none"
          onClick={onToggleExpand}
        >
          {job.name}
        </button>
        <span className={`job-status-badge ${statusClass}`}>{dateLabel}</span>
      </div>
      <div className="flex items-center text-xs text-gray-500 mb-2">
        <i className="ri-user-3-line mr-1"></i>
        <span>{job.clientName}</span>
      </div>
      
      {job.status === 'in-progress' && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
          <div
            className="bg-inprogress h-1.5 rounded-full"
            style={{ width: `${job.progress || 0}%` }}
          ></div>
        </div>
      )}
      
      {isExpanded && (
        <div className="mt-2 mb-2 text-xs">
          <p className="text-gray-600 mb-1">{job.description}</p>
          {job.status === 'completed' && job.invoiceStatus && (
            <div className="flex items-center text-xs mt-1">
              <i className={`ri-${job.invoiceStatus === 'paid' ? 'check-line text-green-500' : 'timer-line text-amber-500'} mr-1`}></i>
              <span className={job.invoiceStatus === 'paid' ? 'text-green-500' : 'text-amber-500'}>
                {job.invoiceStatus === 'paid' ? 'Paid' : 'Invoice Pending'}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xs font-medium text-gray-600">{formatCurrency(job.amount)}</span>
        </div>
        {children}
      </div>
      
      {job.status === 'completed' && !job.invoiceId && (
        <button className="w-full mt-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded hover:bg-blue-600 transition">
          Generate Invoice
        </button>
      )}
      
      {job.status === 'completed' && job.invoiceId && (
        <button className="w-full mt-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition">
          View Invoice
        </button>
      )}
    </div>
  );
}
