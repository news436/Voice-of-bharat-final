import { createClient } from '@supabase/supabase-js';

// Replace with your project URL and Service Role Key
const supabaseUrl = 'https://glskqjpmcolfxteyqhzm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdsc2txanBtY29sZnh0ZXlxaHptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4NTcwMCwiZXhwIjoyMDY2OTYxNzAwfQ.jKRXfy4PGBEZ6nv_WO0ilO4SFiGR1dpkH4jumN4ZTuc'; 

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@vob.com',
    password: 'admin@123',
    email_confirm: true,
    user_metadata: { role: 'admin' }
  });

  if (error) {
    console.error('Error creating admin:', error);
  } else {
    console.log('Admin created:', data);
  }
}

createAdmin(); 