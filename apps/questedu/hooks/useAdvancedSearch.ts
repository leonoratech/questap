import { useEffect, useState } from 'react';
import { getAllProgramsForSearch, getAllUniqueSubjects, getAllUniqueYears } from '../lib/college-data-service';
import { searchCoursesWithFilters } from '../lib/course-service';
import type { Course } from '../types/course';

interface SearchFilters {
  query?: string;
  programId?: string;
  subjectId?: string;
  yearOrSemester?: number;
}

interface FilterOptions {
  programs: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
  years: Array<{ value: number; label: string }>;
}

export const useAdvancedSearch = () => {
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [searching, setSearching] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    programs: [],
    subjects: [],
    years: []
  });
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setLoadingFilters(true);
      
      if (__DEV__) {
        console.log('🔍 [useAdvancedSearch] Loading filter options...');
      }

      const [programs, subjects, years] = await Promise.all([
        getAllProgramsForSearch(),
        getAllUniqueSubjects(),
        getAllUniqueYears()
      ]);

      setFilterOptions({
        programs,
        subjects,
        years
      });

      if (__DEV__) {
        console.log('✅ [useAdvancedSearch] Filter options loaded:', {
          programs: programs.length,
          subjects: subjects.length,
          years: years.length
        });
      }
    } catch (error) {
      console.error('❌ [useAdvancedSearch] Error loading filter options:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

  const searchWithFilters = async (filters: SearchFilters) => {
    try {
      setSearching(true);
      setCurrentFilters(filters);

      if (__DEV__) {
        console.log('🔍 [useAdvancedSearch] Searching with filters:', filters);
      }

      // If no filters are provided, clear results
      if (!filters.query?.trim() && !filters.programId && !filters.subjectId && !filters.yearOrSemester) {
        setSearchResults([]);
        return;
      }

      const results = await searchCoursesWithFilters(filters);
      setSearchResults(results);

      if (__DEV__) {
        console.log('✅ [useAdvancedSearch] Search completed:', {
          resultsCount: results.length,
          filters
        });
      }
    } catch (error) {
      console.error('❌ [useAdvancedSearch] Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setCurrentFilters({});
  };

  const clearFilters = () => {
    const clearedFilters = { query: currentFilters.query };
    setCurrentFilters(clearedFilters);
    if (clearedFilters.query?.trim()) {
      searchWithFilters(clearedFilters);
    } else {
      clearSearch();
    }
  };

  return {
    searchResults,
    searching,
    filterOptions,
    loadingFilters,
    currentFilters,
    searchWithFilters,
    clearSearch,
    clearFilters,
    refreshFilterOptions: loadFilterOptions
  };
};
