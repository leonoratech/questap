#!/usr/bin/env node

/**
 * Test script to verify the College functionality
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  try {
    if (process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL && process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        client_email: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
        private_key: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
      console.log('✅ Firebase Admin SDK initialized');
    } else {
      console.error('❌ No Firebase credentials found');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    process.exit(1);
  }
}

async function testCollegeFunctionality() {
  try {
    console.log('🧪 Testing College Functionality');
    console.log('='.repeat(40));
    
    const adminDb = admin.firestore();
    
    // Test 1: Check if appMaster collection exists
    console.log('\n1. Checking appMaster collection...');
    const appMasterRef = adminDb.collection('appMaster').doc('college');
    const appMasterDoc = await appMasterRef.get();
    
    if (appMasterDoc.exists) {
      const data = appMasterDoc.data();
      console.log('✅ appMaster document found');
      console.log('   College Name:', data?.college?.name || 'Not set');
      console.log('   Last Updated:', data?.updatedAt?.toDate?.() || 'Unknown');
    } else {
      console.log('❌ appMaster document not found');
      return;
    }
    
    // Test 2: Verify college data structure
    console.log('\n2. Verifying college data structure...');
    const collegeData = appMasterDoc.data()?.college;
    
    if (collegeData) {
      const requiredFields = ['name', 'affiliation', 'accreditation', 'principalName', 'description', 'contact', 'address', 'website'];
      const missingFields = requiredFields.filter(field => !collegeData[field]);
      
      if (missingFields.length === 0) {
        console.log('✅ All required fields present');
        console.log('   Fields:', Object.keys(collegeData).join(', '));
      } else {
        console.log('⚠️  Missing fields:', missingFields.join(', '));
      }
    }
    
    // Test 3: Test nested data
    console.log('\n3. Testing nested data...');
    if (collegeData?.contact) {
      console.log('✅ Contact info:', {
        phone: collegeData.contact.phone,
        email: collegeData.contact.email
      });
    } else {
      console.log('❌ Contact info missing');
    }
    
    if (collegeData?.address) {
      console.log('✅ Address info:', {
        city: collegeData.address.city,
        state: collegeData.address.state,
        country: collegeData.address.country
      });
    } else {
      console.log('❌ Address info missing');
    }
    
    console.log('\n🎉 College functionality test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testCollegeFunctionality().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error.message);
  process.exit(1);
});
