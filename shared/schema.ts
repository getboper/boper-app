import { pgTable, text, serial, integer, boolean, decimal, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Enums
export const jobStatusEnum = pgEnum('job_status', ['planned', 'in-progress', 'completed']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'pending', 'paid', 'overdue']);
export const activityTypeEnum = pgEnum('activity_type', ['JOB_STATUS_CHANGE', 'PAYMENT_RECEIVED', 'CLIENT_ADDED', 'JOB_SCHEDULED', 'JOB_COMPLETED']);

// Clients table
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Jobs table
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: jobStatusEnum('status').notNull().default('planned'),
  dueDate: timestamp('due_date'),
  progress: integer('progress').default(0),
  invoiceId: integer('invoice_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Invoices table
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  number: text('number').notNull(),
  clientId: integer('client_id').references(() => clients.id).notNull(),
  jobId: integer('job_id').references(() => jobs.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: invoiceStatusEnum('status').notNull().default('draft'),
  dueDate: timestamp('due_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activities table
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  type: activityTypeEnum('type').notNull(),
  description: text('description').notNull(),
  relatedId: integer('related_id'),
  relatedType: text('related_type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relationships
export const clientsRelations = relations(clients, ({ many }) => ({
  jobs: many(jobs),
  invoices: many(invoices),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  client: one(clients, { fields: [jobs.clientId], references: [clients.id] }),
  invoice: one(invoices, { fields: [jobs.invoiceId], references: [invoices.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  job: one(jobs, { fields: [invoices.jobId], references: [jobs.id] }),
}));

// Insert schemas with validation
export const clientInsertSchema = createInsertSchema(clients, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Must provide a valid email")
});

export const jobInsertSchema = createInsertSchema(jobs, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  amount: (schema) => schema.min(0, "Amount cannot be negative"),
  progress: (schema) => schema.min(0, "Progress cannot be negative")
});

export const invoiceInsertSchema = createInsertSchema(invoices, {
  number: (schema) => schema.min(1, "Invoice number is required"),
  amount: (schema) => schema.min(0, "Amount cannot be negative")
});

export const activityInsertSchema = createInsertSchema(activities);

// Select schemas
export const clientSelectSchema = createSelectSchema(clients);
export const jobSelectSchema = createSelectSchema(jobs);
export const invoiceSelectSchema = createSelectSchema(invoices);
export const activitySelectSchema = createSelectSchema(activities);

// Types
export type Client = typeof clients.$inferSelect;
export type ClientInsert = z.infer<typeof clientInsertSchema>;

export type Job = typeof jobs.$inferSelect;
export type JobInsert = z.infer<typeof jobInsertSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InvoiceInsert = z.infer<typeof invoiceInsertSchema>;

export type Activity = typeof activities.$inferSelect;
export type ActivityInsert = z.infer<typeof activityInsertSchema>;

// User authentication will be implemented in a future update
