// Define core types for the application

export type Job = {
  id: number;
  name: string;
  clientId: number;
  clientName: string;
  description?: string;
  amount: number;
  status: 'booked' | 'in-progress' | 'done' | 'paid';
  dueDate?: string | Date;
  progress?: number;
  invoiceId?: number;
  invoiceStatus?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type Client = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  jobCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type Invoice = {
  id: number;
  number: string;
  clientId: number;
  clientName: string;
  jobId?: number;
  jobName?: string;
  amount: number;
  status: string;
  dueDate: string | Date;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type Activity = {
  id: number;
  type: string;
  description: string;
  relatedId?: number;
  relatedType?: string;
  createdAt: string | Date;
};

export type DashboardStats = {
  activeJobs: number;
  pendingInvoices: number;
  monthlyRevenue: number;
  totalClients: number;
};

export type ReportData = {
  jobsPerMonth: {
    month: string;
    count: number;
  }[];
  revenuePerMonth: {
    month: string;
    amount: number;
  }[];
  clientDistribution: {
    name: string;
    value: number;
  }[];
  statusDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
};
