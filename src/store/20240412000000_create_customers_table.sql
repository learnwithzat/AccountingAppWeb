/** @format */

-- Create custom types for customer status and type if they don't exist
DO $$ BEGIN
    CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE customer_type AS ENUM ('individual', 'business', 'non_profit', 'government');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    alternative_phone TEXT,
    type customer_type NOT NULL DEFAULT 'individual',
    status customer_status NOT NULL DEFAULT 'active',
    tax_id TEXT,
    website TEXT,

    -- Addresses
    billing_address TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_postal_code TEXT,
    billing_country TEXT,

    shipping_address TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT,

    -- Additional Info
    notes TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Statistics
    lifetime_spent DECIMAL(15, 2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);