/**
 * College Data Service for QuestEdu React Native App
 * Handles fetching college programs and subjects for filtering
 */

import {
  collection,
  getDocs,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from './firebase-config';

export interface College {
  id: string;
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
  isActive: boolean;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Program {
  id: string;
  name: string;
  collegeId: string;
  yearsOrSemesters: number;
  semesterType: 'years' | 'semesters';
  description: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
  // Extended fields for filtering
  department?: string;
  language?: string;
  programCode?: string;
  category?: string;
}

export interface Subject {
  id: string;
  name: string;
  programId: string;
  collegeId: string;
  yearOrSemester: number;
  instructorId?: string;
  description?: string;
  credits?: number;
  isDefaultEnrollment?: boolean;
}

const db = getFirestoreDb();

/**
 * Get all active colleges
 */
export const getAllColleges = async (): Promise<College[]> => {
  try {
    console.log('🏫 Fetching colleges from Firebase...');
    
    // Check if we have a Firebase Auth user
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ No authenticated user found. Cannot fetch colleges.');
      throw new Error('Authentication required to fetch colleges. Please sign in.');
    }
    
    console.log('✅ Authenticated user found:', currentUser.email);
    
    const collegesRef = collection(db, 'colleges');
    const q = query(
      collegesRef,
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    console.log(`📊 Found ${querySnapshot.docs.length} colleges`);
    
    const colleges = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`🔍 College data for ${doc.id}:`, {
        name: data.name,
        isActive: data.isActive,
        hasRequiredFields: !!(data.name && data.description !== undefined)
      });
      
      return {
        id: doc.id,
        ...data
      } as College;
    });

    return colleges;
  } catch (error) {
    console.error('❌ Error fetching colleges:', error);
    throw error; // Re-throw to let the UI handle the error
  }
};

/**
 * Get programs for a specific college
 */
export const getCollegePrograms = async (collegeId: string): Promise<Program[]> => {
  try {
    console.log(`🎓 Fetching programs for college: ${collegeId || 'all colleges'}`);
    
    // Check if we have a Firebase Auth user
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ No authenticated user found. Cannot fetch programs.');
      throw new Error('Authentication required to fetch programs. Please sign in.');
    }
    
    console.log('✅ Authenticated user found for programs:', currentUser.email);
    
    const programsRef = collection(db, 'programs');
    let q;
    
    if (collegeId) {
      // Fetch programs for a specific college
      q = query(
        programsRef,
        where('collegeId', '==', collegeId),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
    } else {
      // Fetch all active programs (when no specific college is provided)
      q = query(
        programsRef,
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
    }

    const querySnapshot = await getDocs(q);
    console.log(`📊 Found ${querySnapshot.docs.length} programs ${collegeId ? `for college ${collegeId}` : 'across all colleges'}`);
    
    const programs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`🔍 Program data for ${doc.id}:`, {
        name: data.name,
        collegeId: data.collegeId,
        isActive: data.isActive
      });
      
      return {
        id: doc.id,
        ...data
      } as Program;
    });

    return programs;
  } catch (error) {
    console.error(`❌ Error fetching college programs for ${collegeId}:`, error);
    throw error; // Re-throw to let the UI handle the error
  }
};

/**
 * Get all active programs across all colleges
 */
export const getAllPrograms = async (): Promise<Program[]> => {
  try {
    console.log('🎓 Fetching all active programs...');
    
    // Check if we have a Firebase Auth user
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ No authenticated user found. Cannot fetch programs.');
      throw new Error('Authentication required to fetch programs. Please sign in.');
    }
    
    console.log('✅ Authenticated user found for programs:', currentUser.email);
    
    const programsRef = collection(db, 'programs');
    const q = query(
      programsRef,
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    console.log(`📊 Found ${querySnapshot.docs.length} programs across all colleges`);
    
    const programs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Program;
    });

    return programs;
  } catch (error) {
    console.error('❌ Error fetching all programs:', error);
    throw error;
  }
};

/**
 * Get subjects for a specific program
 */
export const getProgramSubjects = async (programId: string, collegeId: string): Promise<Subject[]> => {
  try {
    console.log(`📚 Fetching subjects for program: ${programId}`);
    
    // Check if we have a Firebase Auth user
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ No authenticated user found. Cannot fetch subjects.');
      throw new Error('Authentication required to fetch subjects. Please sign in.');
    }
    
    const subjectsRef = collection(db, 'subjects');
    const q = query(
      subjectsRef,
      where('programId', '==', programId),
      where('collegeId', '==', collegeId),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    console.log(`📊 Found ${querySnapshot.docs.length} subjects for program ${programId}`);
    
    const subjects = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Subject;
    });

    return subjects;
  } catch (error) {
    console.error(`❌ Error fetching subjects for program ${programId}:`, error);
    throw error;
  }
};

/**
 * Get subjects for a specific program (simple version - just programId)
 */
export const getSubjectsByProgramId = async (programId: string): Promise<Subject[]> => {
  try {
    console.log(`📚 Fetching subjects for program: ${programId}`);
    
    // Check if we have a Firebase Auth user
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ No authenticated user found. Cannot fetch subjects.');
      throw new Error('Authentication required to fetch subjects. Please sign in.');
    }
    
    const subjectsRef = collection(db, 'subjects');
    const q = query(
      subjectsRef,
      where('programId', '==', programId),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    console.log(`📊 Found ${querySnapshot.docs.length} subjects for program ${programId}`);
    
    const subjects = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Subject;
    });

    return subjects;
  } catch (error) {
    console.error(`❌ Error fetching subjects for program ${programId}:`, error);
    return []; // Return empty array on error to prevent crashes
  }
};

/**
 * Get subjects for a specific program and year/semester
 */
export const getProgramSubjectsByYear = async (
  programId: string, 
  collegeId: string, 
  yearOrSemester: number
): Promise<Subject[]> => {
  try {
    const subjectsRef = collection(db, 'subjects');
    const q = query(
      subjectsRef,
      where('programId', '==', programId),
      where('collegeId', '==', collegeId),
      where('yearOrSemester', '==', yearOrSemester),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Subject));
  } catch (error) {
    console.error('Error fetching program subjects by year:', error);
    return [];
  }
};

/**
 * Get college information by ID
 */
export const getCollegeById = async (collegeId: string): Promise<College | null> => {
  try {
    const collegesRef = collection(db, 'colleges');
    const q = query(collegesRef, where('__name__', '==', collegeId));
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as College;
  } catch (error) {
    console.error('Error fetching college:', error);
    return null;
  }
};

/**
 * Get available years/semesters for a program
 */
export const getProgramYears = (program: Program): Array<{ value: number; label: string }> => {
  const years = [];
  for (let i = 1; i <= program.yearsOrSemesters; i++) {
    years.push({
      value: i,
      label: `${program.semesterType === 'years' ? 'Year' : 'Semester'} ${i}`
    });
  }
  return years;
};
