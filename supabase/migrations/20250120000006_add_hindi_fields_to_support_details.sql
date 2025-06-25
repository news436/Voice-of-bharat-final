-- Add Hindi content fields to support_details table
ALTER TABLE support_details 
ADD COLUMN description_hi TEXT,
ADD COLUMN account_holder_name_hi TEXT; 