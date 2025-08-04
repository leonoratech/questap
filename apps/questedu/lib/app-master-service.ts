/**
 * App Master Service for QuestEdu React Native App
 * Handles fetching application-level configuration data
 */

import {
    doc,
    getDoc
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from './firebase-config';

export interface AppMasterCollege {
  name: string;
  accreditation: string;
  affiliation: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  website: string;
  principalName: string;
  description: string;
}

export interface AppMaster {
  id: string;
  college: AppMasterCollege;
  createdAt?: Date;
  updatedAt?: Date;
}

const db = getFirestoreDb();

/**
 * Get college information from appMaster collection
 */
export const getCollegeFromAppMaster = async (): Promise<AppMasterCollege | null> => {
  try {
    console.log('🏫 Fetching college from appMaster...');
    
    // Check if we have a Firebase Auth user
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ No authenticated user found. Cannot fetch college from appMaster.');
      throw new Error('Authentication required to fetch college information. Please sign in.');
    }
    
    console.log('✅ Authenticated user found:', currentUser.email);
    
    const appMasterRef = doc(db, 'appMaster', 'college');
    const appMasterDoc = await getDoc(appMasterRef);
    
    if (!appMasterDoc.exists()) {
      console.warn('📊 AppMaster college document not found');
      return null;
    }
    
    const data = appMasterDoc.data();
    console.log('✅ Successfully fetched college from appMaster:', data.college?.name);
    
    return data.college as AppMasterCollege;
  } catch (error) {
    console.error('❌ Error fetching college from appMaster:', error);
    throw error;
  }
};

/**
 * Get the full appMaster configuration
 */
export const getAppMaster = async (): Promise<AppMaster | null> => {
  try {
    console.log('📊 Fetching appMaster configuration...');
    
    // Check if we have a Firebase Auth user
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ No authenticated user found. Cannot fetch appMaster.');
      throw new Error('Authentication required to fetch app configuration. Please sign in.');
    }
    
    const appMasterRef = doc(db, 'appMaster', 'college');
    const appMasterDoc = await getDoc(appMasterRef);
    
    if (!appMasterDoc.exists()) {
      console.warn('📊 AppMaster document not found');
      return null;
    }
    
    const data = appMasterDoc.data();
    console.log('✅ Successfully fetched appMaster configuration');
    
    return {
      id: appMasterDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as AppMaster;
  } catch (error) {
    console.error('❌ Error fetching appMaster:', error);
    throw error;
  }
};
