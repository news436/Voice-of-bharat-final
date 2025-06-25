-- Add Hindi content fields to about_us table
ALTER TABLE about_us 
ADD COLUMN short_description_hi TEXT,
ADD COLUMN detailed_content_hi TEXT; 