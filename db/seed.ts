import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

const clients = [
  {
    name: "Acme Inc.",
    email: "contact@acmeinc.com", 
    phone: "555-123-4567",
    address: "123 Business Ave, Enterprise, CA 94105"
  },
  {
    name: "Globex Corp",
    email: "info@globexcorp.com",
    phone: "555-987-6543",
    address: "456 Corporate Blvd, Commerce, NY 10001"
  },
  {
    name: "Smith & Co",
    email: "hello@smithco.com",
    phone: "555-456-7890",
    address: "789 Consultant St, Freelance, TX 78701"
  },
  {
    name: "Johnson LLC",
    email: "contact@johnsonllc.com",
    phone: "555-789-0123",
    address: "321 Business Ln, Enterprise, IL 60601"
  },
  {
    name: "Stellar Shop",
    email: "shop@stellarshop.com",
    phone: "555-234-5678",
    address: "567 Retail Dr, Commerce, CA 94110"
  },
  {
    name: "FutureTech",
    email: "hello@futuretech.io",
    phone: "555-345-6789",
    address: "890 Innovation Way, Tech Valley, WA 98101"
  },
  {
    name: "Green Foods",
    email: "info@greenfoods.com",
    phone: "555-456-7890",
    address: "123 Organic Ln, Natureville, OR 97201"
  },
  {
    name: "MobiTech",
    email: "contact@mobitech.com",
    phone: "555-567-8901",
    address: "456 Mobile Ave, Apptown, CA 94107"
  },
  {
    name: "PrintPro",
    email: "print@printpro.com",
    phone: "555-678-9012",
    address: "789 Design Blvd, Creative City, NY 10003"
  },
  {
    name: "Artisan Goods",
    email: "hello@artisangoods.com",
    phone: "555-789-0123",
    address: "321 Craft St, Handmade, OR 97204"
  },
  {
    name: "NextLevel",
    email: "info@nextlevel.com",
    phone: "555-890-1234",
    address: "654 Progress Ave, Growth, CA 94104"
  },
  {
    name: "Creative Kids",
    email: "hello@creativekids.com",
    phone: "555-901-2345",
    address: "987 Imagination Ln, Playville, WA 98103"
  }
];

const jobs = [
  // Planned jobs
  {
    name: "Website Redesign",
    clientIndex: 0, // Acme Inc.
    description: "Complete website redesign with new branding and e-commerce functionality",
    amount: 2400,
    status: "planned",
    dueDate: "2023-06-24T00:00:00.000Z"
  },
  {
    name: "Logo Design",
    clientIndex: 1, // Globex Corp
    description: "Design a new corporate logo with brand guidelines",
    amount: 800,
    status: "planned",
    dueDate: "2023-06-28T00:00:00.000Z"
  },
  {
    name: "Content Writing",
    clientIndex: 2, // Smith & Co
    description: "Create blog posts and product descriptions for the website",
    amount: 1200,
    status: "planned",
    dueDate: "2023-07-02T00:00:00.000Z"
  },
  {
    name: "SEO Audit",
    clientIndex: 3, // Johnson LLC
    description: "Comprehensive SEO audit with recommendations for improvement",
    amount: 950,
    status: "planned",
    dueDate: "2023-07-10T00:00:00.000Z"
  },
  
  // In Progress jobs
  {
    name: "E-commerce Development",
    clientIndex: 4, // Stellar Shop
    description: "Build an online store with product catalog and payment processing",
    amount: 4500,
    status: "in-progress",
    dueDate: "2023-07-15T00:00:00.000Z",
    progress: 50
  },
  {
    name: "Brand Strategy",
    clientIndex: 5, // FutureTech
    description: "Develop comprehensive brand strategy and messaging",
    amount: 3200,
    status: "in-progress",
    dueDate: "2023-07-20T00:00:00.000Z",
    progress: 75
  },
  {
    name: "Social Media Campaign",
    clientIndex: 6, // Green Foods
    description: "Create and launch a 3-month social media campaign",
    amount: 1800,
    status: "in-progress",
    dueDate: "2023-07-25T00:00:00.000Z",
    progress: 25
  },
  {
    name: "Mobile App UI Design",
    clientIndex: 7, // MobiTech
    description: "Design user interface for iOS and Android mobile application",
    amount: 2700,
    status: "in-progress",
    dueDate: "2023-08-01T00:00:00.000Z",
    progress: 60
  },
  {
    name: "Brochure Design",
    clientIndex: 8, // PrintPro
    description: "Design a trifold brochure for product lineup",
    amount: 950,
    status: "in-progress",
    dueDate: "2023-08-05T00:00:00.000Z",
    progress: 40
  },
  
  // Completed jobs
  {
    name: "Product Photography",
    clientIndex: 9, // Artisan Goods
    description: "Professional photography for 20 handmade products",
    amount: 1200,
    status: "completed",
    dueDate: "2023-06-15T00:00:00.000Z",
    progress: 100
  },
  {
    name: "Marketing Consultation",
    clientIndex: 10, // NextLevel
    description: "Strategic marketing consultation and planning",
    amount: 2500,
    status: "completed",
    dueDate: "2023-06-10T00:00:00.000Z",
    progress: 100
  },
  {
    name: "Illustration Set",
    clientIndex: 11, // Creative Kids
    description: "Create a set of 10 custom illustrations for children's book",
    amount: 1800,
    status: "completed",
    dueDate: "2023-06-05T00:00:00.000Z",
    progress: 100
  }
];

const invoices = [
  {
    number: "INV-1085",
    clientIndex: 0, // Acme Inc.
    jobIndex: 0, // Website Redesign
    amount: 2400,
    status: "draft",
    dueDate: "2023-06-30T00:00:00.000Z",
    notes: "Initial invoice for website redesign project"
  },
  {
    number: "INV-1086",
    clientIndex: 4, // Stellar Shop
    jobIndex: 4, // E-commerce Development
    amount: 1500,
    status: "sent",
    dueDate: "2023-07-05T00:00:00.000Z",
    notes: "50% deposit for e-commerce development"
  },
  {
    number: "INV-1087",
    clientIndex: 9, // Artisan Goods
    jobIndex: 9, // Product Photography
    amount: 1200,
    status: "pending",
    dueDate: "2023-07-08T00:00:00.000Z",
    notes: "Full payment for product photography services"
  },
  {
    number: "INV-1088",
    clientIndex: 5, // FutureTech
    jobIndex: 5, // Brand Strategy
    amount: 3200,
    status: "overdue",
    dueDate: "2023-07-15T00:00:00.000Z",
    notes: "Payment for brand strategy development"
  },
  {
    number: "INV-1089",
    clientIndex: 7, // MobiTech
    jobIndex: 7, // Mobile App UI Design
    amount: 2700,
    status: "draft",
    dueDate: "2023-07-20T00:00:00.000Z",
    notes: "Invoice for mobile app UI design"
  },
  {
    number: "INV-1084",
    clientIndex: 11, // Creative Kids
    jobIndex: 11, // Illustration Set
    amount: 1800,
    status: "paid",
    dueDate: "2023-06-15T00:00:00.000Z",
    notes: "Payment for children's book illustrations"
  },
  {
    number: "INV-1083",
    clientIndex: 10, // NextLevel
    jobIndex: 10, // Marketing Consultation
    amount: 2500,
    status: "paid",
    dueDate: "2023-06-20T00:00:00.000Z",
    notes: "Marketing consultation services"
  }
];

const activities = [
  {
    type: "JOB_STATUS_CHANGE",
    description: "<span class=\"font-medium\">Website Redesign</span> job status changed to <span class=\"text-inprogress font-medium\">In Progress</span>",
    relatedType: "job",
    relatedId: 1,
    createdAt: "2023-06-22T14:30:00.000Z"
  },
  {
    type: "INVOICE_PAID",
    description: "<span class=\"font-medium\">Invoice #1084</span> for <span class=\"font-medium\">Marketing Consultation</span> was paid",
    relatedType: "invoice",
    relatedId: 6,
    createdAt: "2023-06-22T12:00:00.000Z"
  },
  {
    type: "CLIENT_ADDED",
    description: "New client <span class=\"font-medium\">Creative Kids</span> was added",
    relatedType: "client",
    relatedId: 12,
    createdAt: "2023-06-21T16:30:00.000Z"
  },
  {
    type: "JOB_SCHEDULED",
    description: "<span class=\"font-medium\">Logo Design</span> job was scheduled for <span class=\"font-medium\">Jun 28</span>",
    relatedType: "job",
    relatedId: 2,
    createdAt: "2023-06-21T14:15:00.000Z"
  },
  {
    type: "JOB_COMPLETED",
    description: "<span class=\"font-medium\">Illustration Set</span> job was marked as completed",
    relatedType: "job",
    relatedId: 12,
    createdAt: "2023-06-21T10:45:00.000Z"
  }
];

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // 1. Insert clients if they don't exist
    console.log("🧑‍💼 Seeding clients...");
    const existingClients = await db.query.clients.findMany();
    
    if (existingClients.length === 0) {
      for (const client of clients) {
        await db.insert(schema.clients).values({
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
        });
      }
      console.log(`✅ Inserted ${clients.length} clients`);
    } else {
      console.log(`ℹ️ Clients already exist, skipping insertion`);
    }

    // Get all clients for reference in jobs and invoices
    const allClients = await db.query.clients.findMany();
    
    // 2. Insert jobs if they don't exist
    console.log("📝 Seeding jobs...");
    const existingJobs = await db.query.jobs.findMany();
    
    if (existingJobs.length === 0) {
      for (const job of jobs) {
        const clientId = allClients[job.clientIndex]?.id;
        if (clientId) {
          await db.insert(schema.jobs).values({
            name: job.name,
            clientId: clientId,
            description: job.description,
            amount: job.amount,
            status: job.status as any,
            dueDate: new Date(job.dueDate),
            progress: job.progress || 0,
          });
        }
      }
      console.log(`✅ Inserted ${jobs.length} jobs`);
    } else {
      console.log(`ℹ️ Jobs already exist, skipping insertion`);
    }

    // Get all jobs for reference in invoices
    const allJobs = await db.query.jobs.findMany();
    
    // 3. Insert invoices if they don't exist
    console.log("💰 Seeding invoices...");
    const existingInvoices = await db.query.invoices.findMany();
    
    if (existingInvoices.length === 0) {
      for (const invoice of invoices) {
        const clientId = allClients[invoice.clientIndex]?.id;
        const jobId = allJobs[invoice.jobIndex]?.id;
        
        if (clientId) {
          await db.insert(schema.invoices).values({
            number: invoice.number,
            clientId: clientId,
            jobId: jobId,
            amount: invoice.amount,
            status: invoice.status as any,
            dueDate: new Date(invoice.dueDate),
            notes: invoice.notes,
          });
        }
      }
      console.log(`✅ Inserted ${invoices.length} invoices`);
      
      // Update job invoiceId for completed jobs
      const completedInvoices = await db.query.invoices.findMany({
        where: eq(schema.invoices.status, 'paid'),
      });
      
      for (const invoice of completedInvoices) {
        if (invoice.jobId) {
          await db.update(schema.jobs)
            .set({ invoiceId: invoice.id })
            .where(eq(schema.jobs.id, invoice.jobId));
        }
      }
      console.log(`✅ Updated invoice references for completed jobs`);
    } else {
      console.log(`ℹ️ Invoices already exist, skipping insertion`);
    }
    
    // 4. Insert activities if they don't exist
    console.log("📊 Seeding activities...");
    const existingActivities = await db.query.activities.findMany();
    
    if (existingActivities.length === 0) {
      for (const activity of activities) {
        await db.insert(schema.activities).values({
          type: activity.type as any,
          description: activity.description,
          relatedId: activity.relatedId,
          relatedType: activity.relatedType,
          createdAt: new Date(activity.createdAt),
        });
      }
      console.log(`✅ Inserted ${activities.length} activities`);
    } else {
      console.log(`ℹ️ Activities already exist, skipping insertion`);
    }

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed();
