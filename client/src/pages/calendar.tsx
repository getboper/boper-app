import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import CreateJobDialog from '@/components/ui/create-job-dialog';
import JobCalendar from '@/components/ui/job-calendar';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { STATUS_COLORS, StatusType } from '@/lib/utils';
import type { Job, Client } from '@/types/index';

export default function Calendar() {
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterClient, setFilterClient] = useState<string>("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all jobs data
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs'], 
  });

  // Fetch all clients for filtering
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['/api/clients']
  });

  // Create handlers for opening the job dialog
  const openCreateJobDialog = (slotInfo?: { start: Date; end: Date }) => {
    setJobToEdit(null);
    setShowCreateDialog(true);
  };

  const openEditJobDialog = (job: Job) => {
    setJobToEdit(job);
    setShowCreateDialog(true);
  };

  // Handle job status changes
  const updateJobStatus = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: number, status: string }) => {
      await apiRequest('PATCH', `/api/jobs/${jobId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    }
  });

  const handleJobStatusChange = async (jobId: number, newStatus: StatusType) => {
    try {
      await updateJobStatus.mutateAsync({ jobId, status: newStatus });
      toast({
        title: "Status updated",
        description: `Job status has been updated to ${newStatus}.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter jobs based on selected status and client
  const filteredJobs = jobs.filter((job) => {
    const statusMatch = filterStatus === "all" || job.status === filterStatus;
    const clientMatch = filterClient === "all" || job.clientId.toString() === filterClient;
    return statusMatch && clientMatch;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Calendar</h1>
          <Button onClick={() => openCreateJobDialog()}>
            <i className="ri-add-line mr-1"></i> New Job
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-600">Status:</label>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-600">Client:</label>
            <Select
              value={filterClient}
              onValueChange={setFilterClient}
              disabled={isLoadingClients}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendar view */}
        <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden h-[700px]">
          {isLoadingJobs ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <JobCalendar 
              jobs={filteredJobs} 
              onSelectEvent={openEditJobDialog}
              onSelectSlot={openCreateJobDialog}
            />
          )}
        </div>
      </div>

      {/* Create/Edit Job Dialog */}
      <CreateJobDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        job={jobToEdit || undefined}
        isEditMode={!!jobToEdit}
      />
    </div>
  );
}