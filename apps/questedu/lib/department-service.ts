/**
 * Department Service for QuestEdu React Native App
 * Handles fetching departments for profile completion
 */

import {
    collection,
    getDocs,
    orderBy,
    query,
    where
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from './firebase-config';

export interface Department {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const db = getFirestoreDb();

/**
 * Get all active departments
 */
export const getAllDepartments = async (): Promise<Department[]> => {
  try {
    console.log('🏢 Fetching all active departments...');
    
    // Check if we have a Firebase Auth user
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ No authenticated user found. Cannot fetch departments.');
      throw new Error('Authentication required to fetch departments. Please sign in.');
    }
    
    console.log('✅ Authenticated user found for departments:', currentUser.email);
    
    const departmentsRef = collection(db, 'departments');
    const q = query(
      departmentsRef,
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    console.log(`📊 Found ${querySnapshot.docs.length} departments`);
    
    const departments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Department;
    });

    return departments;
  } catch (error) {
    console.error('❌ Error fetching departments:', error);
    throw error;
  }
};

/**
 * Get departments for search/dropdown (simplified version)
 */
export const getDepartmentsForDropdown = async (): Promise<Array<{ id: string; name: string }>> => {
  try {
    console.log('🏢 Fetching departments for dropdown...');
    
    const departments = await getAllDepartments();
    const departmentsForDropdown = departments.map(department => ({
      id: department.id,
      name: department.name
    }));
    
    console.log(`✅ Found ${departmentsForDropdown.length} departments for dropdown`);
    return departmentsForDropdown;
  } catch (error) {
    console.error('❌ Error fetching departments for dropdown:', error);
    return [];
  }
};
