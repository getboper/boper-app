import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  jobInsertSchema, 
  clientInsertSchema,
  invoiceInsertSchema
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod-validation-error";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiPrefix = "/api";

  // Dashboard
  app.get(`${apiPrefix}/dashboard`, async (req, res) => {
    try {
      const data = await storage.getDashboardData();
      return res.json(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Clients
  app.get(`${apiPrefix}/clients`, async (req, res) => {
    try {
      const clients = await storage.getClients();
      return res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/clients/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid client ID" });
      }

      const client = await storage.getClientById(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      return res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/clients`, async (req, res) => {
    try {
      const validatedData = clientInsertSchema.parse(req.body);
      const client = await storage.insertClient(validatedData);
      return res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating client:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put(`${apiPrefix}/clients/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid client ID" });
      }

      const validatedData = clientInsertSchema.parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      return res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating client:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete(`${apiPrefix}/clients/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid client ID" });
      }

      await storage.deleteClient(id);
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting client:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Jobs
  app.get(`${apiPrefix}/jobs`, async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      return res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/jobs/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }

      const job = await storage.getJobById(id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      return res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/jobs`, async (req, res) => {
    try {
      console.log("Received job data:", req.body);
      
      // Pre-process the data before validation
      const jobData = {
        ...req.body,
        clientId: parseInt(req.body.clientId),
        // Keep amount as string since schema expects it that way
        // amount: typeof req.body.amount === 'string' ? parseFloat(req.body.amount) : req.body.amount,
        progress: typeof req.body.progress === 'string' ? parseInt(req.body.progress) : req.body.progress || 0,
        // Convert date string to Date object if present
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
      };
      
      console.log("Processed job data:", jobData);
      
      const validatedData = jobInsertSchema.parse(jobData);
      console.log("Validated job data:", validatedData);
      
      const job = await storage.insertJob(validatedData);
      return res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating job:", error);
      return res.status(500).json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put(`${apiPrefix}/jobs/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }

      console.log("Received job update data:", req.body);
      
      // Pre-process the data before validation
      const jobData = {
        ...req.body,
        clientId: parseInt(req.body.clientId),
        // Keep amount as string since schema expects it that way
        // amount: typeof req.body.amount === 'string' ? parseFloat(req.body.amount) : req.body.amount,
        progress: typeof req.body.progress === 'string' ? parseInt(req.body.progress) : req.body.progress || 0,
        // Convert date string to Date object if present
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
      };
      
      console.log("Processed job update data:", jobData);
      
      const validatedData = jobInsertSchema.parse(jobData);
      console.log("Validated job update data:", validatedData);
      
      const job = await storage.updateJob(id, validatedData);
      return res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating job:", error);
      return res.status(500).json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch(`${apiPrefix}/jobs/:id/status`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }

      const statusSchema = z.object({
        status: z.enum(["planned", "in-progress", "completed"]),
      });
      
      const { status } = statusSchema.parse(req.body);
      const job = await storage.updateJobStatus(id, status);
      return res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating job status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete(`${apiPrefix}/jobs/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }

      await storage.deleteJob(id);
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting job:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create invoice for a job
  app.post(`${apiPrefix}/jobs/:id/invoice`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid job ID" });
      }

      const job = await storage.getJobById(id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Get the next invoice number
      const invoices = await storage.getInvoices();
      const lastInvoice = invoices.sort((a, b) => b.id - a.id)[0];
      const lastNumber = lastInvoice ? parseInt(lastInvoice.number.replace(/\D/g, '')) : 0;
      const newInvoiceNumber = `INV-${String(lastNumber + 1).padStart(4, '0')}`;

      // Create invoice for the job
      const invoice = await storage.insertInvoice({
        number: newInvoiceNumber,
        clientId: job.clientId,
        jobId: job.id,
        amount: String(job.amount),
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      return res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice for job:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Invoices
  app.get(`${apiPrefix}/invoices`, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      return res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/invoices/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      const invoice = await storage.getInvoiceById(id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      return res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/invoices`, async (req, res) => {
    try {
      const validatedData = invoiceInsertSchema.parse(req.body);
      const invoice = await storage.insertInvoice(validatedData);
      return res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating invoice:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put(`${apiPrefix}/invoices/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      const validatedData = invoiceInsertSchema.parse(req.body);
      const invoice = await storage.updateInvoice(id, validatedData);
      return res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating invoice:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch(`${apiPrefix}/invoices/:id/status`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      const statusSchema = z.object({
        status: z.enum(["draft", "sent", "pending", "paid", "overdue"]),
      });
      
      const { status } = statusSchema.parse(req.body);
      const invoice = await storage.updateInvoiceStatus(id, status);
      return res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating invoice status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/invoices/:id/send`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      // Update invoice status to sent
      const invoice = await storage.updateInvoiceStatus(id, "sent");
      return res.json(invoice);
    } catch (error) {
      console.error("Error sending invoice:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete(`${apiPrefix}/invoices/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      await storage.deleteInvoice(id);
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Activities
  app.get(`${apiPrefix}/activities`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const activities = await storage.getActivities(limit);
      return res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reports
  app.get(`${apiPrefix}/reports`, async (req, res) => {
    try {
      const reportData = await storage.getReportData();
      return res.json(reportData);
    } catch (error) {
      console.error("Error generating reports:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Stripe payment integration
  app.post(`${apiPrefix}/create-payment-intent`, async (req, res) => {
    try {
      const { amount, invoiceId } = req.body;
      
      if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
      }

      // Convert GBP amount to pennies (Stripe requires the smallest currency unit)
      const amountInPennies = Math.round(parseFloat(amount) * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPennies,
        currency: 'gbp',
        // Store metadata about the invoice for reference
        metadata: {
          invoiceId: invoiceId || '',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Subscription handling
  app.post(`${apiPrefix}/create-subscription`, async (req, res) => {
    try {
      const { plan } = req.body;
      
      if (!plan || !['monthly', 'yearly'].includes(plan)) {
        return res.status(400).json({ error: "Valid plan type (monthly or yearly) is required" });
      }
      
      // Get pricing based on plan
      const amount = plan === 'monthly' ? 900 : 9000; // £9/month or £90/year in pennies
      
      // In a real app, we would create or retrieve a customer first
      // const customer = await stripe.customers.create({
      //   email: user.email,
      //   name: user.name
      // });
      
      // For now, create a simple payment intent for the subscription amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'gbp',
        metadata: {
          subscriptionType: plan
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Handle subscription success
  app.post(`${apiPrefix}/subscription-success`, async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ error: "Payment intent ID is required" });
      }
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: "Payment hasn't succeeded yet" });
      }
      
      // Get subscription type from metadata
      const subscriptionType = paymentIntent.metadata.subscriptionType || 'monthly';
      
      // In a real app, we would:
      // 1. Store subscription info in a user record
      // 2. Set subscription expiration date
      // 3. Track subscription lifecycle
      
      // For demo purposes, we'll just create an activity record
      await storage.createActivity({
        type: "PAYMENT_RECEIVED",
        description: `New ${subscriptionType} subscription activated`,
        relatedId: 0,
        relatedType: "subscription",
      });
      
      return res.json({ 
        success: true,
        subscriptionType,
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + (subscriptionType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000)
      });
    } catch (error) {
      console.error("Error processing subscription:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Mark invoice as paid after successful payment
  app.post(`${apiPrefix}/payment-success`, async (req, res) => {
    try {
      const { invoiceId, paymentIntentId } = req.body;
      
      if (!invoiceId) {
        return res.status(400).json({ error: "Invoice ID is required" });
      }
      
      // Verify payment with Stripe
      if (paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({ error: "Payment hasn't succeeded yet" });
        }
      }
      
      const id = parseInt(invoiceId);
      const invoice = await storage.getInvoiceById(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // Update invoice status to paid
      const updatedInvoice = await storage.updateInvoiceStatus(id, "paid");
      
      // If the invoice is for a job, update the job status to paid
      if (invoice.jobId) {
        await storage.updateJobStatus(invoice.jobId, "paid");
        
        // Create activity for payment
        await storage.createActivity({
          type: "PAYMENT_RECEIVED",
          description: `Payment received for invoice #${invoice.number}`,
          relatedId: invoice.id,
          relatedType: "invoice",
        });
      }
      
      return res.json(updatedInvoice);
    } catch (error) {
      console.error("Error processing payment success:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
