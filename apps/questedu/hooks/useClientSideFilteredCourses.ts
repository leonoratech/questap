import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCourses } from '../lib/course-service';
import type { Course } from '../types/course';

interface CourseFilters {
  programId?: string;
  yearOrSemester?: number;
  subjectId?: string;
  departmentId?: string;
}

export const useClientSideFilteredCourses = (filters?: CourseFilters) => {
  const { userProfile } = useAuth();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all courses once on mount
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (__DEV__) {
          console.log('📋 [useClientSideFilteredCourses] Loading all courses...');
        }
        
        const courses = await getCourses();
        
        if (__DEV__) {
          console.log('✅ [useClientSideFilteredCourses] Loaded courses:', {
            count: courses.length,
            sample: courses.slice(0, 3).map(c => ({
              id: c.id,
              title: c.title,
              associations: c.associations,
              association: (c as any).association
            }))
          });
        }
        
        setAllCourses(courses);
      } catch (err) {
        console.error('❌ [useClientSideFilteredCourses] Error loading courses:', err);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  // Apply filters client-side using useMemo for performance
  const filteredCourses = useMemo(() => {
    if (allCourses.length === 0) {
      return [];
    }

    // Auto-apply user's programId if they have one and no explicit programId filter is provided
    const effectiveFilters = { ...filters };
    if (userProfile?.programId && !effectiveFilters.programId) {
      effectiveFilters.programId = userProfile.programId;
    }

    if (__DEV__) {
      console.log('🔍 [useClientSideFilteredCourses] Applying filters:', effectiveFilters);
    }

    // If no filters, return appropriate courses based on user profile
    if (!effectiveFilters.programId && !effectiveFilters.yearOrSemester && 
        !effectiveFilters.subjectId && !effectiveFilters.departmentId) {
      
      if (userProfile?.programId) {
        // User has a program but no specific filters - show program courses
        const programCourses = allCourses.filter(course => {
          const rawData = course as any;
          
          // Check new associations array
          const hasMatchingAssociation = course.associations?.some(assoc => 
            assoc.programId === userProfile.programId
          );
          
          // Check legacy association object
          const hasLegacyAssociation = rawData.association && 
            rawData.association.programId === userProfile.programId;
          
          // Check direct programId field (legacy support)
          const hasDirectProgram = rawData.programId === userProfile.programId;
          
          return hasMatchingAssociation || hasLegacyAssociation || hasDirectProgram;
        });

        if (__DEV__) {
          console.log('🎯 [useClientSideFilteredCourses] Filtered by user program:', {
            programId: userProfile.programId,
            resultCount: programCourses.length
          });
        }

        return programCourses;
      } else {
        // No program association - show all courses
        if (__DEV__) {
          console.log('📋 [useClientSideFilteredCourses] No program filter, showing all courses');
        }
        return allCourses;
      }
    }

    // Apply specific filters
    const filtered = allCourses.filter(course => {
      const rawData = course as any;
      
      if (__DEV__) {
        console.log('🔍 [useClientSideFilteredCourses] Examining course:', {
          id: course.id,
          title: course.title,
          associations: course.associations,
          association: rawData.association
        });
      }

      // Program filter
      if (effectiveFilters.programId) {
        const hasDirectProgramId = rawData.programId === effectiveFilters.programId;
        const hasAssociationProgramId = rawData.association?.programId === effectiveFilters.programId;
        const hasAssociationsProgramId = course.associations?.some((assoc: any) => 
          assoc.programId === effectiveFilters.programId
        );
        
        if (!hasDirectProgramId && !hasAssociationProgramId && !hasAssociationsProgramId) {
          return false;
        }
      }

      // Year/Semester filter
      if (effectiveFilters.yearOrSemester) {
        const hasDirectYear = rawData.yearOrSemester === effectiveFilters.yearOrSemester;
        const hasAssociationYear = rawData.association?.yearOrSemester === effectiveFilters.yearOrSemester;
        const hasAssociationsYear = course.associations?.some((assoc: any) => 
          assoc.yearOrSemester === effectiveFilters.yearOrSemester
        );
        
        if (!hasDirectYear && !hasAssociationYear && !hasAssociationsYear) {
          return false;
        }
      }

      // Subject filter
      if (effectiveFilters.subjectId) {
        const hasDirectSubject = rawData.subjectId === effectiveFilters.subjectId;
        const hasAssociationSubject = rawData.association?.subjectId === effectiveFilters.subjectId;
        const hasAssociationsSubject = course.associations?.some((assoc: any) => 
          assoc.subjectId === effectiveFilters.subjectId
        );
        
        if (!hasDirectSubject && !hasAssociationSubject && !hasAssociationsSubject) {
          return false;
        }
      }

      // Department filter
      if (effectiveFilters.departmentId) {
        const hasDirectDepartmentId = rawData.departmentId === effectiveFilters.departmentId;
        const hasAssociationDepartmentId = rawData.association?.departmentId === effectiveFilters.departmentId;
        const hasAssociationsDepartmentId = course.associations?.some((assoc: any) => 
          assoc.departmentId === effectiveFilters.departmentId
        );
        
        if (!hasDirectDepartmentId && !hasAssociationDepartmentId && !hasAssociationsDepartmentId) {
          return false;
        }
      }

      return true;
    });

    if (__DEV__) {
      console.log('✅ [useClientSideFilteredCourses] Client-side filtering result:', {
        totalCourses: allCourses.length,
        filteredCount: filtered.length,
        filters: effectiveFilters
      });
    }

    return filtered;
  }, [allCourses, filters, userProfile?.programId]);

  const refreshCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (__DEV__) {
        console.log('🔄 [useClientSideFilteredCourses] Refreshing all courses...');
      }
      
      const courses = await getCourses();
      setAllCourses(courses);
      
      if (__DEV__) {
        console.log('🔄 [useClientSideFilteredCourses] Refresh complete:', courses.length, 'courses');
      }
    } catch (err) {
      console.error('❌ [useClientSideFilteredCourses] Error refreshing courses:', err);
      setError('Failed to refresh courses');
    } finally {
      setLoading(false);
    }
  };

  return {
    courses: filteredCourses,
    loading,
    error,
    refreshCourses,
    hasCollegeAssociation: !!userProfile?.programId,
    totalCourses: allCourses.length
  };
};
