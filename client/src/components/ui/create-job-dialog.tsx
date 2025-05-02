import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, set } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Job, Client } from "@/types";

// Updated job schema with time fields
const jobFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  clientId: z.coerce.number().min(1, "Please select a client"),
  description: z.string().optional(),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  status: z.enum(["planned", "in-progress", "completed"]),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  timeHour: z.coerce.number().min(0).max(23),
  timeMinute: z.coerce.number().min(0).max(59),
  progress: z.coerce.number().min(0).max(100).optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

type CreateJobDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job;
  isEditMode?: boolean;
};

export default function CreateJobDialog({
  open,
  onOpenChange,
  job,
  isEditMode = false,
}: CreateJobDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', email: '', phone: '' });

  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Extract time from the job's dueDate if it exists
  const getTimeFromDate = (date: Date | string | undefined) => {
    if (!date) return { hour: 9, minute: 0 }; // Default to 9:00 AM
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return {
      hour: dateObj.getHours(),
      minute: dateObj.getMinutes()
    };
  };

  const jobTime = job?.dueDate ? getTimeFromDate(job.dueDate) : { hour: 9, minute: 0 };

  const defaultValues: Partial<JobFormValues> = job
    ? {
        name: job.name,
        clientId: job.clientId,
        description: job.description || "",
        amount: job.amount,
        status: job.status as "planned" | "in-progress" | "completed",
        dueDate: job.dueDate ? new Date(job.dueDate) : new Date(),
        timeHour: jobTime.hour,
        timeMinute: jobTime.minute,
        progress: job.progress || 0,
      }
    : {
        name: "",
        description: "",
        amount: 0,
        status: "planned",
        dueDate: new Date(),
        timeHour: 9, // Default to 9:00 AM
        timeMinute: 0,
        progress: 0,
      };

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
  });

  const watchStatus = form.watch("status");

  // This effect ensures the form values are updated when the job prop changes
  useEffect(() => {
    if (job && open) {
      const jobTime = getTimeFromDate(job.dueDate);
      
      form.reset({
        name: job.name,
        clientId: job.clientId,
        description: job.description || "",
        amount: job.amount,
        status: job.status as "planned" | "in-progress" | "completed",
        dueDate: job.dueDate ? new Date(job.dueDate) : new Date(),
        timeHour: jobTime.hour,
        timeMinute: jobTime.minute,
        progress: job.progress || 0,
      });
    } else if (!job && open) {
      form.reset(defaultValues);
    }
  }, [job, open]);

  const handleSubmit = async (values: JobFormValues) => {
    setIsPending(true);
    try {
      // Combine date and time
      const combinedDate = set(values.dueDate, {
        hours: values.timeHour,
        minutes: values.timeMinute,
        seconds: 0
      });
      
      const jobData = {
        ...values, 
        dueDate: combinedDate
      };
      
      // Create a new object without the time fields
      const { timeHour, timeMinute, ...jobDataWithoutTime } = jobData;
      
      // Convert to format expected by the server
      const submissionData = {
        name: jobDataWithoutTime.name,
        clientId: jobDataWithoutTime.clientId,
        description: jobDataWithoutTime.description || '',
        amount: jobDataWithoutTime.amount.toString(), // Convert to string as expected by API
        status: jobDataWithoutTime.status,
        dueDate: jobDataWithoutTime.dueDate.toISOString(), // Convert date to ISO string
        progress: jobDataWithoutTime.progress?.toString() || '0' // Convert to string as expected by API
      };

      console.log("Submitting data:", submissionData);

      if (isEditMode && job) {
        await apiRequest("PUT", `/api/jobs/${job.id}`, submissionData);
        toast({
          title: "Job updated",
          description: "The job has been updated successfully.",
        });
      } else {
        await apiRequest("POST", "/api/jobs", submissionData);
        toast({
          title: "Job created",
          description: "The job has been created successfully.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: isEditMode 
          ? "Failed to update job. Please try again." 
          : "Failed to create job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  // Generate hours and minutes for select dropdowns
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return {
      value: hour,
      label: `${displayHour}:00 ${period}`
    };
  });

  const minutes = Array.from({ length: 12 }, (_, i) => {
    const minute = i * 5;
    return {
      value: minute,
      label: minute < 10 ? `0${minute}` : `${minute}`
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Job" : "Create New Job"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details of this job"
              : "Add a new job to your schedule"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === "new") {
                        setShowNewClientForm(true);
                      } else {
                        field.onChange(parseInt(value));
                      }
                    }}
                    defaultValue={field.value?.toString()}
                    disabled={isLoadingClients}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new" className="text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary-600 font-medium border-b border-gray-100 mb-1 pb-1">
                        + Add New Client
                      </SelectItem>
                      {clients?.map((client) => (
                        <SelectItem
                          key={client.id}
                          value={client.id.toString()}
                        >
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  
                  {showNewClientForm && (
                    <div className="mt-3 border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                      <h4 className="font-medium text-sm mb-3 text-gray-800 border-b pb-2">Add New Client</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700">Name</label>
                          <Input 
                            value={newClientData.name}
                            onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                            placeholder="Client name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700">Email</label>
                          <Input 
                            value={newClientData.email}
                            onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                            placeholder="client@example.com"
                            type="email"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700">Phone (Optional)</label>
                          <Input 
                            value={newClientData.phone}
                            onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                            placeholder="+44 123 456789"
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-3 mt-1 border-t">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setShowNewClientForm(false);
                              setNewClientData({ name: '', email: '', phone: '' });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            className="bg-primary"
                            onClick={async () => {
                              if (!newClientData.name || !newClientData.email) {
                                toast({
                                  title: "Missing information",
                                  description: "Please provide a name and email for the client.",
                                  variant: "destructive"
                                });
                                return;
                              }
                              
                              try {
                                const response = await apiRequest("POST", "/api/clients", {
                                  name: newClientData.name,
                                  email: newClientData.email,
                                  phone: newClientData.phone || undefined
                                });
                                const newClient = await response.json();
                                
                                queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
                                
                                // Set the new client as selected
                                field.onChange(newClient.id);
                                
                                setShowNewClientForm(false);
                                setNewClientData({ name: '', email: '', phone: '' });
                                
                                toast({
                                  title: "Client added",
                                  description: "New client has been added successfully."
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to add new client. Please try again.",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            Add Client
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the job"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Amount (£)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "0" : e.target.value;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and time selection */}
            <div className="space-y-2">
              <FormLabel>Date & Time</FormLabel>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "EEE, d MMM yyyy")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 flex-1">
                  <FormField
                    control={form.control}
                    name="timeHour"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select
                          onValueChange={(val) => field.onChange(parseInt(val))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {hours.map((hour) => (
                              <SelectItem
                                key={hour.value}
                                value={hour.value.toString()}
                              >
                                {hour.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeMinute"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select
                          onValueChange={(val) => field.onChange(parseInt(val))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Min" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {minutes.map((minute) => (
                              <SelectItem
                                key={minute.value}
                                value={minute.value.toString()}
                              >
                                {minute.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {watchStatus === "in-progress" && (
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "0" : e.target.value;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="btn-3d bg-gradient-to-br from-blue-500 to-blue-600"
              >
                {isPending ? "Saving..." : isEditMode ? "Update Job" : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
