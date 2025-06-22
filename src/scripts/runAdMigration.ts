import { execSync } from 'child_process';

console.log('🚀 Running database migration for enhanced ads table...');

try {
  execSync('npx supabase db push', { stdio: 'inherit' });
  console.log('✅ Migration completed successfully!');
  console.log('');
  console.log('📋 What\'s new in the Ad Manager:');
  console.log('• Image upload support with Cloudinary integration');
  console.log('• Clickable image ads with redirect URLs');
  console.log('• Recommended banner dimensions for each slot');
  console.log('• Automatic image sizing with aspect ratio preservation');
  console.log('• Enhanced preview with proper dimensions');
  console.log('');
  console.log('🎯 Recommended banner dimensions:');
  console.log('• Slots 1, 4, 6: 300×250 (Sidebar/Medium Rectangle)');
  console.log('• Slots 2, 3, 5, 7: 728×90 (Leaderboard Banner)');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} 