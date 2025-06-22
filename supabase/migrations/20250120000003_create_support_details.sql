CREATE TABLE support_details (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    description TEXT,
    account_holder_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    bank_name TEXT,
    qr_code_image_url TEXT,
    upi_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with a single row of data
INSERT INTO support_details (
    description,
    account_holder_name,
    account_number,
    ifsc_code,
    bank_name,
    qr_code_image_url,
    upi_id
) VALUES (
    'Your support is vital to our mission. Every contribution, no matter the size, empowers us to continue delivering fearless, independent journalism and to amplify the voices that matter. By supporting Voice of Bharat, you are investing in a more informed and engaged society.',
    'VOICE OF BHARAT FOUNDATION',
    '123456789012',
    'VOBF0001234',
    'National Bank of India',
    '/placeholder-qr.png',
    'voiceofbharat@upi'
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
CREATE TRIGGER handle_support_details_update
    BEFORE UPDATE ON support_details
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security
ALTER TABLE support_details ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to support details"
ON support_details
FOR SELECT
USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin write access to support details"
ON support_details
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role'); 