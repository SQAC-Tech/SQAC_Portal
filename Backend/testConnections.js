import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { supabase } from './src/config/supabase.js';

dotenv.config();

async function testConnections() {
  console.log('--- Starting Supabase & MongoDB Connection Tests ---');

  // 1. Test MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB: Connected successfully.');
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ MongoDB: Connection failed:', err.message);
  }

  // 2. Test Supabase Storage
  try {
    const bucketName = process.env.SUPABASE_BUCKET || 'certificates';
    console.log(`Testing Supabase Bucket: ${bucketName}`);
    
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) throw error;
    
    const bucketExists = data.find(b => b.name === bucketName);
    if (bucketExists) {
      console.log(`✅ Supabase Storage: Bucket "${bucketName}" exists.`);
    } else {
      console.log(`❌ Supabase Storage: Bucket "${bucketName}" NOT found. Please create it in Supabase dashboard.`);
    }

    // Try a small upload test
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload('test.txt', 'Hello Supabase', { upsert: true });

    if (uploadError) {
      console.error('❌ Supabase Storage: Write test failed:', uploadError.message);
    } else {
      console.log('✅ Supabase Storage: Write test successful.');
      await supabase.storage.from(bucketName).remove(['test.txt']);
      console.log('✅ Supabase Storage: Delete test successful.');
    }

  } catch (err) {
    console.error('❌ Supabase Storage: Test failed:', err.message);
  }

  // 3. Test Supabase Database
  try {
    console.log('Testing Supabase Database connection...');
    const { error: dbError } = await supabase.from('_connection_test_').select('*').limit(1);
    
    if (dbError) {
      // If it's just a "table not found" error, the connection/auth is actually working
      const isTableNotFound = dbError.code === '42P01' || dbError.code === 'PGRST205' || dbError.status === 404;
      
      if (isTableNotFound) {
        console.log('✅ Supabase Database: Connection/Auth successful.');
      } else {
        console.error('❌ Supabase Database Error:', dbError.message);
        console.error('   Code:', dbError.code, 'Status:', dbError.status);
        if (dbError.message.includes('JWS') || dbError.message.includes('JWT') || dbError.status === 401) {
          console.error('   Hint: Your SUPABASE_KEY in .env appears to be invalid.');
        }
      }
    } else {
      console.log('✅ Supabase Database: Connection successful.');
    }
  } catch (err) {
    console.error('❌ Supabase Database: Test failed:', err.message);
  }

  console.log('--- Tests Completed ---');
  process.exit(0);
}

testConnections();
