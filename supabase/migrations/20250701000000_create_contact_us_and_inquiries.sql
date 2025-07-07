-- Create table for storing contact details
CREATE TABLE IF NOT EXISTS public.contact_us (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    address text,
    email text,
    phone text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create table for storing user inquiries
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
); 