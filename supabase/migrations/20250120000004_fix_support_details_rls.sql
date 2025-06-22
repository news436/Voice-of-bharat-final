-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow admin write access to support details" ON support_details;

-- Create a new policy that allows authenticated users with admin/editor roles
CREATE POLICY "Allow authenticated users to manage support details"
ON support_details
FOR ALL
USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Also allow service role access for backend operations
CREATE POLICY "Allow service role access to support details"
ON support_details
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role'); 