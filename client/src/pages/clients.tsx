import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MoreHorizontal, Search, Mail, Phone, MapPin, PenSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Client } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const clientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function Clients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      if (isEditMode && selectedClient) {
        return apiRequest("PUT", `/api/clients/${selectedClient.id}`, data);
      } else {
        return apiRequest("POST", "/api/clients", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: isEditMode ? "Client updated" : "Client created",
        description: isEditMode
          ? "The client has been updated successfully."
          : "The client has been created successfully.",
      });
      setClientDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: isEditMode
          ? "Failed to update client. Please try again."
          : "Failed to create client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      return apiRequest("DELETE", `/api/clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const openCreateClientDialog = () => {
    setSelectedClient(null);
    setIsEditMode(false);
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
    setClientDialogOpen(true);
  };

  const openEditClientDialog = (client: Client) => {
    setSelectedClient(client);
    setIsEditMode(true);
    form.reset({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      address: client.address || "",
      notes: client.notes || "",
    });
    setClientDialogOpen(true);
  };

  const handleDeleteClient = (clientId: number) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const onSubmit = (data: ClientFormValues) => {
    createClientMutation.mutate(data);
  };

  const filteredClients = clients?.filter(
    (client) => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm))
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Clients</h1>
        <div className="flex gap-2">
          <Button onClick={openCreateClientDialog}>
            <Plus className="h-4 w-4 mr-1" /> Add Client
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={viewMode === "grid" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <i className="ri-grid-fill h-4 w-4"></i>
            </Button>
            <Button 
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-none"
            >
              <i className="ri-list-check h-4 w-4"></i>
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search clients..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Active Jobs</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : filteredClients && filteredClients.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id}>
                <CardHeader>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription>
                    {client.jobCount} active job{client.jobCount !== 1 && 's'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">{client.email}</a>
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <a href={`tel:${client.phone}`} className="hover:underline">{client.phone}</a>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditClientDialog(client)}
                  >
                    <PenSquare className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Active Jobs</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                        {client.email}
                      </a>
                    </TableCell>
                    <TableCell>{client.phone || "-"}</TableCell>
                    <TableCell>{client.jobCount || 0}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditClientDialog(client)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h3 className="text-lg font-medium mb-2">No clients found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? "No clients match your search criteria." 
              : "You haven't added any clients yet."}
          </p>
          {!searchTerm && (
            <Button onClick={openCreateClientDialog}>
              <Plus className="h-4 w-4 mr-1" /> Add Your First Client
            </Button>
          )}
        </div>
      )}

      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Client" : "Add New Client"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update client information"
                : "Fill in the details to add a new client"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional information about the client"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setClientDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createClientMutation.isPending}
                >
                  {createClientMutation.isPending 
                    ? "Saving..." 
                    : isEditMode ? "Update Client" : "Add Client"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
