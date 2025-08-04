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
  // Subjects array from the program object
  subjects?: Subject[];
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
      const program = {
        id: doc.id,
        ...data
      } as Program;
      
      // Log if subjects are included in the program document
      if (program.subjects && program.subjects.length > 0) {
        console.log(`📚 Program "${program.name}" includes ${program.subjects.length} subjects`);
      }
      
      return program;
    });

    return programs;
  } catch (error) {
    console.error('❌ Error fetching all programs:', error);
    throw error;
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

/**
 * Get unique subjects and years from courses for a specific program
 */
export const getUniqueSubjectsAndYearsFromCourses = async (programId: string): Promise<{
  subjects: Array<{ id: string; name: string }>;
  years: Array<{ value: number; label: string }>;
}> => {
  try {
    console.log(`📚 Getting unique subjects and years for program: ${programId}`);
    
    // Check if we have a Firebase Auth user
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ No authenticated user found. Cannot fetch courses.');
      throw new Error('Authentication required to fetch courses. Please sign in.');
    }

    // Get all programs to find the specific program
    const programs = await getAllPrograms();
    const program = programs.find(p => p.id === programId);
    
    if (!program) {
      console.warn(`Program with ID ${programId} not found`);
      return { subjects: [], years: [] };
    }

    // Get unique subjects from the program's subjects array
    const subjects = program.subjects ? program.subjects.map(subject => ({
      id: subject.id || '',
      name: subject.name
    })) : [];

    // Get years/semesters for the program
    const years = getProgramYears(program);

    console.log(`✅ Found ${subjects.length} subjects and ${years.length} years for program ${program.name}`);
    
    return { subjects, years };
  } catch (error) {
    console.error('❌ Error getting unique subjects and years:', error);
    return { subjects: [], years: [] };
  }
};
