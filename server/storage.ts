import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, or, gte, lte, SQL, sql, between } from "drizzle-orm";
import { count } from "drizzle-orm";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

// Client-related operations
export const storage = {
  // Clients
  async getClients() {
    // Fetch all clients with their job counts
    const clients = await db.query.clients.findMany({
      orderBy: [desc(schema.clients.name)],
    });

    // For each client, count their jobs
    const clientsWithJobCount = await Promise.all(
      clients.map(async (client) => {
        const jobCount = await db
          .select({ count: count() })
          .from(schema.jobs)
          .where(eq(schema.jobs.clientId, client.id));
        
        return {
          ...client,
          jobCount: jobCount[0]?.count || 0,
        };
      })
    );

    return clientsWithJobCount;
  },

  async getClientById(id: number) {
    return db.query.clients.findFirst({
      where: eq(schema.clients.id, id),
    });
  },

  async insertClient(client: schema.ClientInsert) {
    const result = await db.insert(schema.clients).values(client).returning();
    
    // Create activity for new client
    await this.createActivity({
      type: "CLIENT_ADDED",
      description: `New client <span class="font-medium">${client.name}</span> was added`,
      relatedId: result[0].id,
      relatedType: "client",
    });
    
    return result[0];
  },

  async updateClient(id: number, client: Partial<schema.ClientInsert>) {
    return (await db.update(schema.clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(schema.clients.id, id))
      .returning())[0];
  },

  async deleteClient(id: number) {
    return db.delete(schema.clients).where(eq(schema.clients.id, id));
  },

  // Jobs
  async getJobs() {
    const jobs = await db.query.jobs.findMany({
      orderBy: [desc(schema.jobs.updatedAt)],
    });

    // Get client names for each job
    const jobsWithClientNames = await Promise.all(
      jobs.map(async (job) => {
        const client = await this.getClientById(job.clientId);
        
        // If job has an invoice, get its status
        let invoiceStatus = undefined;
        if (job.invoiceId) {
          const invoice = await db.query.invoices.findFirst({
            where: eq(schema.invoices.id, job.invoiceId),
          });
          invoiceStatus = invoice?.status;
        }
        
        return {
          ...job,
          clientName: client?.name || "Unknown Client",
          invoiceStatus,
        };
      })
    );

    return jobsWithClientNames;
  },
  
  async getJobsByStatus(status: string) {
    const jobs = await db.query.jobs.findMany({
      where: eq(schema.jobs.status, status as any),
      orderBy: [desc(schema.jobs.updatedAt)],
    });

    return Promise.all(
      jobs.map(async (job) => {
        const client = await this.getClientById(job.clientId);
        return {
          ...job,
          clientName: client?.name || "Unknown Client",
        };
      })
    );
  },

  async getJobById(id: number) {
    return db.query.jobs.findFirst({
      where: eq(schema.jobs.id, id),
    });
  },

  async insertJob(job: schema.JobInsert) {
    const result = await db.insert(schema.jobs).values(job).returning();
    
    // Create activity for new job
    const client = await this.getClientById(job.clientId);
    await this.createActivity({
      type: "JOB_SCHEDULED",
      description: `<span class="font-medium">${job.name}</span> job was scheduled for <span class="font-medium">${format(new Date(job.dueDate || new Date()), 'MMM dd')}</span>`,
      relatedId: result[0].id,
      relatedType: "job",
    });
    
    return result[0];
  },

  async updateJob(id: number, job: Partial<schema.JobInsert>) {
    return (await db.update(schema.jobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(schema.jobs.id, id))
      .returning())[0];
  },

  async updateJobStatus(id: number, status: string) {
    const job = await this.getJobById(id);
    const result = await db.update(schema.jobs)
      .set({ 
        status: status as any, 
        updatedAt: new Date(),
        // If completing a job, set progress to 100
        ...(status === 'completed' ? { progress: 100 } : {}),
      })
      .where(eq(schema.jobs.id, id))
      .returning();
    
    // Create activity for status change
    const statusDisplayText = status === 'in-progress' ? 'In Progress' : 
                             status.charAt(0).toUpperCase() + status.slice(1);
    
    const statusColor = status === 'in-progress' ? 'text-inprogress' : 
                       status === 'completed' ? 'text-secondary' : 
                       'text-primary';
    
    await this.createActivity({
      type: status === 'completed' ? "JOB_COMPLETED" : "JOB_STATUS_CHANGE",
      description: `<span class="font-medium">${job?.name}</span> job status changed to <span class="${statusColor} font-medium">${statusDisplayText}</span>`,
      relatedId: id,
      relatedType: "job",
    });
    
    return result[0];
  },

  async deleteJob(id: number) {
    return db.delete(schema.jobs).where(eq(schema.jobs.id, id));
  },

  // Invoices
  async getInvoices() {
    const invoices = await db.query.invoices.findMany({
      orderBy: [desc(schema.invoices.updatedAt)],
    });

    // Get client names and job names for each invoice
    return Promise.all(
      invoices.map(async (invoice) => {
        const client = await this.getClientById(invoice.clientId);
        
        let jobName = undefined;
        if (invoice.jobId) {
          const job = await this.getJobById(invoice.jobId);
          jobName = job?.name;
        }
        
        return {
          ...invoice,
          clientName: client?.name || "Unknown Client",
          jobName,
        };
      })
    );
  },

  async getInvoiceById(id: number) {
    return db.query.invoices.findFirst({
      where: eq(schema.invoices.id, id),
    });
  },

  async insertInvoice(invoice: schema.InvoiceInsert) {
    const result = await db.insert(schema.invoices).values(invoice).returning();
    
    // If invoice is associated with a job, update the job's invoiceId
    if (invoice.jobId) {
      await db.update(schema.jobs)
        .set({ invoiceId: result[0].id })
        .where(eq(schema.jobs.id, invoice.jobId));
    }
    
    return result[0];
  },

  async updateInvoice(id: number, invoice: Partial<schema.InvoiceInsert>) {
    return (await db.update(schema.invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(schema.invoices.id, id))
      .returning())[0];
  },

  async updateInvoiceStatus(id: number, status: string) {
    const result = await db.update(schema.invoices)
      .set({ 
        status: status as any, 
        updatedAt: new Date() 
      })
      .where(eq(schema.invoices.id, id))
      .returning();
    
    // Create activity if invoice is paid
    if (status === 'paid') {
      const invoice = result[0];
      let jobName = "service";
      
      if (invoice.jobId) {
        const job = await this.getJobById(invoice.jobId);
        jobName = job?.name || "service";
      }
      
      await this.createActivity({
        type: "INVOICE_PAID",
        description: `<span class="font-medium">Invoice #${invoice.number}</span> for <span class="font-medium">${jobName}</span> was paid`,
        relatedId: id,
        relatedType: "invoice",
      });
    }
    
    return result[0];
  },

  async deleteInvoice(id: number) {
    // Find the invoice to check if it's linked to a job
    const invoice = await this.getInvoiceById(id);
    
    if (invoice?.jobId) {
      // Remove the reference from the job
      await db.update(schema.jobs)
        .set({ invoiceId: null })
        .where(eq(schema.jobs.id, invoice.jobId));
    }
    
    return db.delete(schema.invoices).where(eq(schema.invoices.id, id));
  },

  // Activities
  async getActivities(limit = 5) {
    return db.query.activities.findMany({
      orderBy: [desc(schema.activities.createdAt)],
      limit,
    });
  },

  async createActivity(activity: schema.ActivityInsert) {
    return (await db.insert(schema.activities).values(activity).returning())[0];
  },

  // Dashboard
  async getDashboardData() {
    // Get stats
    const activeJobs = await db.select({ count: count() })
      .from(schema.jobs)
      .where(or(
        eq(schema.jobs.status, 'planned'),
        eq(schema.jobs.status, 'in-progress')
      ));
    
    const pendingInvoices = await db.select({ count: count() })
      .from(schema.invoices)
      .where(or(
        eq(schema.invoices.status, 'draft'),
        eq(schema.invoices.status, 'sent'),
        eq(schema.invoices.status, 'pending'),
        eq(schema.invoices.status, 'overdue')
      ));
    
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());
    
    const monthlyRevenue = await db.select({
      total: sql<number>`COALESCE(SUM(${schema.invoices.amount}), 0)`,
    })
      .from(schema.invoices)
      .where(and(
        eq(schema.invoices.status, 'paid'),
        gte(schema.invoices.updatedAt, currentMonthStart),
        lte(schema.invoices.updatedAt, currentMonthEnd)
      ));
    
    const totalClients = await db.select({ count: count() })
      .from(schema.clients);
    
    // Get jobs by status
    const plannedJobs = await this.getJobsByStatus('planned');
    const inProgressJobs = await this.getJobsByStatus('in-progress');
    const completedJobs = await this.getJobsByStatus('completed');
    
    // Get upcoming invoices (sorted by due date, limited to 5)
    const upcomingInvoices = await db.query.invoices.findMany({
      where: or(
        eq(schema.invoices.status, 'draft'),
        eq(schema.invoices.status, 'sent'),
        eq(schema.invoices.status, 'pending'),
        eq(schema.invoices.status, 'overdue')
      ),
      orderBy: [schema.invoices.dueDate],
      limit: 5,
    });
    
    const upcomingInvoicesWithDetails = await Promise.all(
      upcomingInvoices.map(async (invoice) => {
        const client = await this.getClientById(invoice.clientId);
        
        return {
          ...invoice,
          clientName: client?.name || "Unknown Client",
        };
      })
    );
    
    return {
      stats: {
        activeJobs: activeJobs[0]?.count || 0,
        pendingInvoices: pendingInvoices[0]?.count || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        totalClients: totalClients[0]?.count || 0,
      },
      jobs: {
        planned: plannedJobs,
        inProgress: inProgressJobs,
        completed: completedJobs,
      },
      upcomingInvoices: upcomingInvoicesWithDetails,
    };
  },

  // Reports
  async getReportData() {
    // Get jobs per month for the last 6 months
    const jobsPerMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      
      const jobCount = await db.select({ count: count() })
        .from(schema.jobs)
        .where(and(
          gte(schema.jobs.createdAt, monthStart),
          lte(schema.jobs.createdAt, monthEnd)
        ));
      
      jobsPerMonth.push({
        month: format(monthStart, 'MMM'),
        count: jobCount[0]?.count || 0,
      });
    }
    
    // Get revenue per month for the last 6 months
    const revenuePerMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      
      const revenue = await db.select({
        total: sql<number>`COALESCE(SUM(${schema.invoices.amount}), 0)`,
      })
        .from(schema.invoices)
        .where(and(
          eq(schema.invoices.status, 'paid'),
          gte(schema.invoices.updatedAt, monthStart),
          lte(schema.invoices.updatedAt, monthEnd)
        ));
      
      revenuePerMonth.push({
        month: format(monthStart, 'MMM'),
        amount: revenue[0]?.total || 0,
      });
    }
    
    // Get top clients by revenue
    const clients = await this.getClients();
    const clientRevenue = await Promise.all(
      clients.map(async (client) => {
        const revenue = await db.select({
          total: sql<number>`COALESCE(SUM(${schema.invoices.amount}), 0)`,
        })
          .from(schema.invoices)
          .where(and(
            eq(schema.invoices.clientId, client.id),
            eq(schema.invoices.status, 'paid')
          ));
        
        return {
          name: client.name,
          value: revenue[0]?.total || 0,
        };
      })
    );
    
    // Sort and get top 5 clients
    const clientDistribution = clientRevenue
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    // Get job status distribution
    const plannedCount = await db.select({ count: count() })
      .from(schema.jobs)
      .where(eq(schema.jobs.status, 'planned'));
    
    const inProgressCount = await db.select({ count: count() })
      .from(schema.jobs)
      .where(eq(schema.jobs.status, 'in-progress'));
    
    const completedCount = await db.select({ count: count() })
      .from(schema.jobs)
      .where(eq(schema.jobs.status, 'completed'));
    
    const statusDistribution = [
      { name: 'Planned', value: plannedCount[0]?.count || 0, color: 'hsl(var(--chart-1))' },
      { name: 'In Progress', value: inProgressCount[0]?.count || 0, color: 'hsl(var(--chart-4))' },
      { name: 'Completed', value: completedCount[0]?.count || 0, color: 'hsl(var(--chart-2))' },
    ];
    
    return {
      jobsPerMonth,
      revenuePerMonth,
      clientDistribution,
      statusDistribution,
    };
  }
};
