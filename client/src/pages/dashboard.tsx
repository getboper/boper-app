import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatsSection } from "@/components/ui/stats-card";
import JobColumn from "@/components/ui/job-column";
import ActivityFeed from "@/components/ui/activity-feed";
import InvoiceTable from "@/components/ui/invoice-table";
import CreateJobDialog from "@/components/ui/create-job-dialog";
import TrialBanner from "@/components/ui/trial-banner";
import ComingSoonFeatures from "@/components/ui/coming-soon-features";
import { Filter, CalendarDays, PoundSterling, Briefcase, Users, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Job, Invoice } from "@/types";
import { StatusType } from "@/lib/utils";

type DashboardData = {
  stats: {
    activeJobs: number;
    pendingInvoices: number;
    monthlyRevenue: number;
    totalClients: number;
  };
  jobs: {
    booked: Job[];
    inProgress: Job[];
    done: Job[];
    paid: Job[];
  };
  upcomingInvoices: Invoice[];
};

export default function Dashboard() {
  const { toast } = useToast();
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  const openCreateJobDialog = () => {
    setSelectedJob(undefined);
    setIsEditMode(false);
    setCreateJobOpen(true);
  };

  const openEditJobDialog = (job: Job) => {
    setSelectedJob(job);
    setIsEditMode(true);
    setCreateJobOpen(true);
  };

  const handleJobStatusChange = async (jobId: number, newStatus: StatusType) => {
    try {
      await apiRequest("PATCH", `/api/jobs/${jobId}/status`, { status: newStatus });
      toast({
        title: "Status updated",
        description: "Job status has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      await apiRequest("DELETE", `/api/jobs/${jobId}`);
      toast({
        title: "Job deleted",
        description: "The job has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateInvoice = async (jobId: number) => {
    try {
      await apiRequest("POST", `/api/jobs/${jobId}/invoice`, {});
      toast({
        title: "Invoice created",
        description: "An invoice has been generated for this job.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInvoiceAction = (id: number, action: string) => {
    toast({
      title: "Feature not implemented",
      description: `The ${action} feature will be available soon.`,
    });
  };

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <h3 className="font-bold">Error loading dashboard</h3>
          <p>Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Welcome to Boper
          </span>
        </h1>
        <Button 
          className="btn-3d bg-gradient-to-br from-blue-500 to-blue-600 text-base"
          onClick={openCreateJobDialog}
        >
          <i className="ri-add-line mr-2"></i> New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <StatsSection loading={isLoading} stats={data?.stats} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Job Summary */}
        <div className="card-glossy p-5 lg:col-span-2 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Job Summary</h2>
            <Link href="/jobs">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary hover:bg-primary/5 font-medium"
              >
                View All
                <i className="ri-arrow-right-line ml-1"></i>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-sm text-gray-600">Booked</h3>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {data?.jobs.booked?.length || 0}
                </span>
              </div>
              {isLoading ? (
                <div className="animate-pulse h-16 bg-gray-100 rounded"></div>
              ) : data?.jobs.booked?.length ? (
                <div className="space-y-2">
                  {data?.jobs.booked?.slice(0, 2).map(job => (
                    <div 
                      key={job.id} 
                      className="bg-blue-50/50 p-2 rounded text-sm cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => openEditJobDialog(job)}
                    >
                      {job.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm italic py-2">No booked jobs</div>
              )}
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-sm text-gray-600">In Progress</h3>
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {data?.jobs.inProgress?.length || 0}
                </span>
              </div>
              {isLoading ? (
                <div className="animate-pulse h-16 bg-gray-100 rounded"></div>
              ) : data?.jobs.inProgress?.length ? (
                <div className="space-y-2">
                  {data?.jobs.inProgress?.slice(0, 2).map(job => (
                    <div 
                      key={job.id} 
                      className="bg-purple-50/50 p-2 rounded text-sm cursor-pointer hover:bg-purple-50 transition-colors"
                      onClick={() => openEditJobDialog(job)}
                    >
                      {job.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm italic py-2">No jobs in progress</div>
              )}
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-sm text-gray-600">Done</h3>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {data?.jobs.done?.length || 0}
                </span>
              </div>
              {isLoading ? (
                <div className="animate-pulse h-16 bg-gray-100 rounded"></div>
              ) : data?.jobs.done?.length ? (
                <div className="space-y-2">
                  {data?.jobs.done?.slice(0, 2).map(job => (
                    <div 
                      key={job.id} 
                      className="bg-green-50/50 p-2 rounded text-sm cursor-pointer hover:bg-green-50 transition-colors"
                      onClick={() => openEditJobDialog(job)}
                    >
                      {job.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm italic py-2">No completed jobs</div>
              )}
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-sm text-gray-600">Paid</h3>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {data?.jobs.paid?.length || 0}
                </span>
              </div>
              {isLoading ? (
                <div className="animate-pulse h-16 bg-gray-100 rounded"></div>
              ) : data?.jobs.paid?.length ? (
                <div className="space-y-2">
                  {data?.jobs.paid?.slice(0, 2).map(job => (
                    <div 
                      key={job.id} 
                      className="bg-indigo-50/50 p-2 rounded text-sm cursor-pointer hover:bg-indigo-50 transition-colors"
                      onClick={() => openEditJobDialog(job)}
                    >
                      {job.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm italic py-2">No paid jobs</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column: Activity Feed */}
        <div className="card-glossy p-5">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <ActivityFeed />
        </div>
      </div>

      {/* Invoices */}
      <div className="card-glossy p-5 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Invoices</h2>
          <Link href="/invoices">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary hover:bg-primary/5 font-medium"
            >
              View All
              <i className="ri-arrow-right-line ml-1"></i>
            </Button>
          </Link>
        </div>
        
        <InvoiceTable
          invoices={(data?.upcomingInvoices || []).slice(0, 3)}
          onView={(id) => handleInvoiceAction(id, "view")}
          onEdit={(id) => handleInvoiceAction(id, "edit")}
          onDelete={(id) => handleInvoiceAction(id, "delete")}
          onMarkAsPaid={(id) => handleInvoiceAction(id, "mark as paid")}
          onSend={(id) => handleInvoiceAction(id, "send")}
          isLoading={isLoading}
        />
      </div>
      
      <CreateJobDialog
        open={createJobOpen}
        onOpenChange={setCreateJobOpen}
        job={selectedJob}
        isEditMode={isEditMode}
      />
    </div>
  );
}
