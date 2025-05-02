import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoiceTable from "@/components/ui/invoice-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Invoice, Job, Client } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const invoiceFormSchema = z.object({
  jobId: z.coerce.number().optional(),
  clientId: z.coerce.number().min(1, "Please select a client"),
  number: z.string().min(1, "Invoice number is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  status: z.enum(["draft", "sent", "pending", "paid", "overdue"]),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function Invoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: invoices, isLoading: isInvoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  const { data: jobs, isLoading: isJobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  const { data: clients, isLoading: isClientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      jobId: undefined,
      clientId: undefined,
      number: "",
      amount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "draft",
      notes: "",
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormValues) => {
      if (isEditMode && selectedInvoice) {
        return apiRequest("PUT", `/api/invoices/${selectedInvoice.id}`, data);
      } else {
        return apiRequest("POST", "/api/invoices", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: isEditMode ? "Invoice updated" : "Invoice created",
        description: isEditMode
          ? "The invoice has been updated successfully."
          : "The invoice has been created successfully.",
      });
      setInvoiceDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: isEditMode
          ? "Failed to update invoice. Please try again."
          : "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/invoices/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Status updated",
        description: "The invoice status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/invoices/${id}/send`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Invoice sent",
        description: "The invoice has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const openCreateInvoiceDialog = () => {
    setSelectedInvoice(null);
    setIsEditMode(false);
    form.reset({
      jobId: undefined,
      clientId: undefined,
      number: generateInvoiceNumber(),
      amount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "draft",
      notes: "",
    });
    setInvoiceDialogOpen(true);
  };

  // This is now a wrapper function that accepts an ID parameter to match the InvoiceTable component
  const openEditInvoiceDialog = (id: number) => {
    const invoice = invoices?.find(inv => inv.id === id);
    if (!invoice) {
      toast({
        title: "Error",
        description: "Invoice not found",
        variant: "destructive",
      });
      return;
    }
    editInvoice(invoice);
  };

  // The actual implementation that works with the full invoice object
  const editInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditMode(true);
    form.reset({
      jobId: invoice.jobId,
      clientId: invoice.clientId,
      number: invoice.number,
      amount: invoice.amount,
      dueDate: new Date(invoice.dueDate),
      status: invoice.status as any,
      notes: invoice.notes || "",
    });
    setInvoiceDialogOpen(true);
  };

  // Wrapper function that accepts an id parameter to match the expected signature
  const handleViewInvoice = (id: number) => {
    generateAndViewInvoicePdf(id);
  };

  // Actual implementation with no signature constraints
  const generateAndViewInvoicePdf = async (id: number) => {
    const invoice = invoices?.find(inv => inv.id === id);
    if (!invoice) {
      toast({
        title: "Error",
        description: "Invoice not found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get client and job data for the PDF
      const client = clients?.find(c => c.id === invoice.clientId);
      const job = invoice.jobId ? jobs?.find(j => j.id === invoice.jobId) : undefined;
      
      if (!client) {
        throw new Error("Client data not found");
      }
      
      // Dynamically import the PDF generator to reduce initial bundle size
      const { openInvoicePdf } = await import("@/lib/generateInvoicePdf");
      
      // Generate and open the PDF in a new tab
      openInvoicePdf({
        invoice,
        client,
        job
      });
      
      // Track view event
      toast({
        title: "Invoice Opened",
        description: `Invoice #${invoice.number} opened in a new tab`,
      });
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate invoice PDF",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = (id: number) => {
    statusMutation.mutate({ id, status: "paid" });
  };

  const handleSendInvoice = (id: number) => {
    sendInvoiceMutation.mutate(id);
  };

  const handleDeleteInvoice = (id: number) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  const onSubmit = (data: InvoiceFormValues) => {
    createInvoiceMutation.mutate(data);
  };

  // Generate a simple invoice number
  const generateInvoiceNumber = () => {
    const lastInvoice = invoices?.sort((a, b) => b.id - a.id)[0];
    const lastNumber = lastInvoice ? parseInt(lastInvoice.number.replace(/\D/g, '')) : 0;
    return `INV-${String(lastNumber + 1).padStart(4, '0')}`;
  };

  // Filter invoices based on tab and search
  const filteredInvoices = invoices?.filter(invoice => {
    const matchesTab = activeTab === "all" || invoice.status === activeTab;
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Handle job selection - set client and amount automatically
  const handleJobChange = (jobId: string) => {
    if (jobId) {
      const selectedJob = jobs?.find(job => job.id === parseInt(jobId));
      if (selectedJob) {
        form.setValue("clientId", selectedJob.clientId);
        form.setValue("amount", selectedJob.amount);
      }
    }
  };

  const watchJobId = form.watch("jobId");

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Invoices</h1>
        <Button onClick={openCreateInvoiceDialog}>
          <Plus className="h-4 w-4 mr-1" /> New Invoice
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search invoices..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <InvoiceTable
          invoices={filteredInvoices || []}
          onView={handleViewInvoice}
          onEdit={openEditInvoiceDialog}
          onDelete={handleDeleteInvoice}
          onMarkAsPaid={handleMarkAsPaid}
          onSend={handleSendInvoice}
          isLoading={isInvoicesLoading}
        />
      </div>

      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the invoice details"
                : "Fill out the information to create a new invoice"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Job (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleJobChange(value);
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a job" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No related job</SelectItem>
                        {jobs?.map((job) => (
                          <SelectItem key={job.id} value={job.id.toString()}>
                            {job.name}
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
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value?.toString()}
                      disabled={!!watchJobId || isClientsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (£)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        disabled={!!watchJobId}
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

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Due Date</FormLabel>
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
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInvoiceDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createInvoiceMutation.isPending}
                >
                  {createInvoiceMutation.isPending
                    ? "Saving..."
                    : isEditMode
                    ? "Update Invoice"
                    : "Create Invoice"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
