-- Create the necessary schema
CREATE SCHEMA IF NOT EXISTS public;

-- Create enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM ('planned', 'in-progress', 'completed');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
        CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'pending', 'paid', 'overdue');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
        CREATE TYPE activity_type AS ENUM ('JOB_STATUS_CHANGE', 'PAYMENT_RECEIVED', 'CLIENT_ADDED', 'JOB_SCHEDULED', 'JOB_COMPLETED');
    END IF;
END $$;

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    description TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    status job_status DEFAULT 'planned' NOT NULL,
    due_date TIMESTAMP,
    invoice_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    number TEXT NOT NULL,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    job_id INTEGER REFERENCES jobs(id),
    amount NUMERIC(10, 2) NOT NULL,
    status invoice_status DEFAULT 'draft' NOT NULL,
    due_date TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    type activity_type NOT NULL,
    description TEXT NOT NULL,
    related_id INTEGER,
    related_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add reference from jobs to invoices
ALTER TABLE jobs ADD CONSTRAINT fk_job_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;