import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobColumn from "@/components/ui/job-column";
import JobCalendar from "@/components/ui/job-calendar";
import CreateJobDialog from "@/components/ui/create-job-dialog";
import { Plus, Search, Calendar, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Job, Client } from "@/types";
import { StatusType } from "@/lib/utils";

export default function Jobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState<string>("all");
  
  // Get view parameter from URL to determine whether to show calendar or board view  
  const [location, setLocation] = useLocation();
  const urlParams = new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
  const initialView = urlParams.get('view') === 'calendar' ? 'calendar' : 'board';
  const [viewMode, setViewMode] = useState<"board" | "calendar">(initialView);
  
  // Update URL when view mode changes
  const changeViewMode = (mode: "board" | "calendar") => {
    setViewMode(mode);
    // Update URL without page refresh
    const newUrl = mode === 'calendar' ? '/jobs?view=calendar' : '/jobs';
    setLocation(newUrl, { replace: true });
  };
  
  // Effect to handle URL changes from outside (e.g., sidebar navigation)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
    const viewParam = urlParams.get('view');
    if (viewParam === 'calendar' && viewMode !== 'calendar') {
      setViewMode('calendar');
    } else if (!viewParam && viewMode !== 'board') {
      setViewMode('board');
    }
  }, [location]);

  const { data: jobs, isLoading: isJobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const openCreateJobDialog = (slotInfo?: { start: Date; end: Date }) => {
    let initialValues = undefined;
    
    if (slotInfo) {
      initialValues = {
        dueDate: slotInfo.start
      };
    }
    
    setSelectedJob(initialValues as any);
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
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === "all" || job.clientId.toString() === filterClient;
    return matchesSearch && matchesClient;
  }) || [];

  const plannedJobs = filteredJobs.filter(job => job.status === 'booked');
  const inProgressJobs = filteredJobs.filter(job => job.status === 'in-progress');
  const completedJobs = filteredJobs.filter(job => job.status === 'done');

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Jobs</h1>
        <Button onClick={() => openCreateJobDialog()} className="btn-3d bg-gradient-to-br from-blue-500 to-blue-600">
          <Plus className="h-4 w-4 mr-1" /> New Job
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search jobs or clients..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select 
          value={filterClient} 
          onValueChange={setFilterClient}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients?.map(client => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex rounded-md shadow-sm">
          <Button
            variant="outline"
            className={`rounded-r-none ${viewMode === 'board' ? 'bg-primary text-white' : ''}`}
            onClick={() => changeViewMode('board')}
          >
            <LayoutGrid className="h-4 w-4 mr-1" /> Board
          </Button>
          <Button
            variant="outline"
            className={`rounded-l-none ${viewMode === 'calendar' ? 'bg-primary text-white' : ''}`}
            onClick={() => changeViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-1" /> Calendar
          </Button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <JobColumn
            title="Booked"
            status="booked"
            jobs={plannedJobs}
            count={plannedJobs.length}
            onStatusChange={handleJobStatusChange}
            onDelete={handleDeleteJob}
            onEdit={openEditJobDialog}
            isLoading={isJobsLoading}
          />
          <JobColumn
            title="In Progress"
            status="in-progress"
            jobs={inProgressJobs}
            count={inProgressJobs.length}
            onStatusChange={handleJobStatusChange}
            onDelete={handleDeleteJob}
            onEdit={openEditJobDialog}
            isLoading={isJobsLoading}
          />
          <JobColumn
            title="Done"
            status="done"
            jobs={completedJobs}
            count={completedJobs.length}
            onStatusChange={handleJobStatusChange}
            onDelete={handleDeleteJob}
            onEdit={openEditJobDialog}
            onCreateInvoice={handleCreateInvoice}
            isLoading={isJobsLoading}
          />
        </div>
      ) : (
        <div>
          <JobCalendar 
            jobs={filteredJobs} 
            onSelectEvent={openEditJobDialog}
            onSelectSlot={openCreateJobDialog}
          />
        </div>
      )}

      <CreateJobDialog
        open={createJobOpen}
        onOpenChange={setCreateJobOpen}
        job={selectedJob}
        isEditMode={isEditMode}
      />
    </div>
  );
}
