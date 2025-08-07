import type { Course, CourseSearchCriteria, CreateCourseData, UpdateCourseData } from '../types/course';
import { firebaseCourseService } from './firebase-course-service';

// Re-export types for compatibility
export type {
    Course, CourseLevel, CourseQueryOptions, CourseSearchCriteria, CourseStatus, CreateCourseData, OperationResult,
    QueryResult, UpdateCourseData
} from '../types/course';

/**
 * Get all courses
 */
export const getCourses = async (): Promise<Course[]> => {
  const result = await firebaseCourseService.getAll();
  return result.data;
};

/**
 * Get a single course by ID
 */
export const getCourseById = async (id: string): Promise<Course | null> => {
  return await firebaseCourseService.getById(id);
};

/**
 * Search courses
 */
export const searchCourses = async (searchTerm: string): Promise<Course[]> => {
  const searchCriteria: CourseSearchCriteria = {
    query: searchTerm
  };
  const result = await firebaseCourseService.search(searchCriteria);
  return result.data;
};

/**
 * Get courses by category
 */
export const getCoursesByCategory = async (category: string): Promise<Course[]> => {
  const result = await firebaseCourseService.getByCategory(category);
  return result.data;
};

/**
 * Add a new course
 * Updated to handle new Course data model
 */
export const addCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  const courseData: CreateCourseData = {
    title: course.title,
    instructor: course.instructor,
    instructorId: course.instructorId,
    progress: course.progress,
    image: course.image,
    category: course.category || '',
    description: course.description || '',
    categoryId: course.categoryId,
    subcategory: course.subcategory,
    level: course.level,
    duration: course.duration,
    status: course.status,
    isPublished: course.isPublished,
    featured: course.featured,
    tags: course.tags,
    skills: course.skills,
    prerequisites: course.prerequisites,
    whatYouWillLearn: course.whatYouWillLearn,
    targetAudience: course.targetAudience,
    courseImage: course.courseImage,
    promoVideo: course.promoVideo,
    language: course.language,
    subtitles: course.subtitles,
    certificates: course.certificates,
    lifetimeAccess: course.lifetimeAccess,
    downloadableResources: course.downloadableResources,
    mobileAccess: course.mobileAccess,
    articlesCount: course.articlesCount,
    videosCount: course.videosCount,
    totalVideoLength: course.totalVideoLength,
    seoTitle: course.seoTitle,
    seoDescription: course.seoDescription,
    seoKeywords: course.seoKeywords,
    primaryLanguage: course.primaryLanguage,
    supportedLanguages: course.supportedLanguages,
    enableTranslation: course.enableTranslation,
    multilingualTitle: course.multilingualTitle,
    multilingualDescription: course.multilingualDescription,
    multilingualTags: course.multilingualTags,
    multilingualSkills: course.multilingualSkills,
    multilingualPrerequisites: course.multilingualPrerequisites,
    multilingualWhatYouWillLearn: course.multilingualWhatYouWillLearn,
    multilingualTargetAudience: course.multilingualTargetAudience,
    associations: course.associations
  };
  
  const result = await firebaseCourseService.create(courseData);
  return result.success ? result.data! : null;
};

/**
 * Update a course
 * Updated to handle new Course data model
 */
export const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
  const updateData: UpdateCourseData = {};
  
  // Basic fields
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.instructor !== undefined) updateData.instructor = updates.instructor;
  if (updates.instructorId !== undefined) updateData.instructorId = updates.instructorId;
  if (updates.progress !== undefined) updateData.progress = updates.progress;
  if (updates.image !== undefined) updateData.image = updates.image;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.description !== undefined) updateData.description = updates.description;
  
  // Enhanced fields
  if (updates.categoryId !== undefined) updateData.categoryId = updates.categoryId;
  if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
  if (updates.level !== undefined) updateData.level = updates.level;
  if (updates.duration !== undefined) updateData.duration = updates.duration;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.isPublished !== undefined) updateData.isPublished = updates.isPublished;
  if (updates.featured !== undefined) updateData.featured = updates.featured;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.skills !== undefined) updateData.skills = updates.skills;
  if (updates.prerequisites !== undefined) updateData.prerequisites = updates.prerequisites;
  if (updates.whatYouWillLearn !== undefined) updateData.whatYouWillLearn = updates.whatYouWillLearn;
  if (updates.targetAudience !== undefined) updateData.targetAudience = updates.targetAudience;
  if (updates.courseImage !== undefined) updateData.courseImage = updates.courseImage;
  if (updates.promoVideo !== undefined) updateData.promoVideo = updates.promoVideo;
  if (updates.language !== undefined) updateData.language = updates.language;
  if (updates.subtitles !== undefined) updateData.subtitles = updates.subtitles;
  if (updates.certificates !== undefined) updateData.certificates = updates.certificates;
  if (updates.lifetimeAccess !== undefined) updateData.lifetimeAccess = updates.lifetimeAccess;
  if (updates.downloadableResources !== undefined) updateData.downloadableResources = updates.downloadableResources;
  if (updates.mobileAccess !== undefined) updateData.mobileAccess = updates.mobileAccess;
  if (updates.lastAccessed !== undefined) updateData.lastAccessed = updates.lastAccessed;
  if (updates.bookmarked !== undefined) updateData.bookmarked = updates.bookmarked;
  
  // Course features
  if (updates.articlesCount !== undefined) updateData.articlesCount = updates.articlesCount;
  if (updates.videosCount !== undefined) updateData.videosCount = updates.videosCount;
  if (updates.totalVideoLength !== undefined) updateData.totalVideoLength = updates.totalVideoLength;
  if (updates.seoTitle !== undefined) updateData.seoTitle = updates.seoTitle;
  if (updates.seoDescription !== undefined) updateData.seoDescription = updates.seoDescription;
  if (updates.seoKeywords !== undefined) updateData.seoKeywords = updates.seoKeywords;
  
  // Language configuration
  if (updates.primaryLanguage !== undefined) updateData.primaryLanguage = updates.primaryLanguage;
  if (updates.supportedLanguages !== undefined) updateData.supportedLanguages = updates.supportedLanguages;
  if (updates.enableTranslation !== undefined) updateData.enableTranslation = updates.enableTranslation;
  
  // Multilingual content fields
  if (updates.multilingualTitle !== undefined) updateData.multilingualTitle = updates.multilingualTitle;
  if (updates.multilingualDescription !== undefined) updateData.multilingualDescription = updates.multilingualDescription;
  if (updates.multilingualTags !== undefined) updateData.multilingualTags = updates.multilingualTags;
  if (updates.multilingualSkills !== undefined) updateData.multilingualSkills = updates.multilingualSkills;
  if (updates.multilingualPrerequisites !== undefined) updateData.multilingualPrerequisites = updates.multilingualPrerequisites;
  if (updates.multilingualWhatYouWillLearn !== undefined) updateData.multilingualWhatYouWillLearn = updates.multilingualWhatYouWillLearn;
  if (updates.multilingualTargetAudience !== undefined) updateData.multilingualTargetAudience = updates.multilingualTargetAudience;
  
  // Association fields
  if (updates.associations !== undefined) updateData.associations = updates.associations;
  
  const result = await firebaseCourseService.update(courseId, updateData);
  return result.success;
};

/**
 * Delete a course
 */
export const deleteCourse = async (courseId: string): Promise<boolean> => {
  const result = await firebaseCourseService.delete(courseId);
  return result.success;
};

/**
 * Subscribe to courses changes in real-time
 */
export const subscribeToCoursesChanges = (callback: (courses: Course[]) => void): (() => void) => {
  return firebaseCourseService.subscribeToChanges(callback);
};

/**
 * Subscribe to a single course changes
 */
export const subscribeToSingleCourse = (id: string, callback: (course: Course | null) => void): (() => void) => {
  return firebaseCourseService.subscribeToSingle(id, callback);
};

/**
 * Get courses by college ID
 */
export const getCoursesByCollege = async (collegeId: string): Promise<Course[]> => {
  const result = await firebaseCourseService.getCoursesByCollege(collegeId);
  return result.data;
};

/**
 * Get courses with association filters
 */
export const getCoursesWithFilters = async (filters: {
  collegeId?: string;
  programId?: string;
  yearOrSemester?: number;
  subjectId?: string;
  departmentId?: string;
}): Promise<Course[]> => {
  const result = await firebaseCourseService.getCoursesWithFilters(filters);
  return result.data;
};

/**
 * Subscribe to courses changes with college filter
 */
export const subscribeToCollegeCourses = (collegeId: string, callback: (courses: Course[]) => void): (() => void) => {
  return firebaseCourseService.subscribeToCollegeCourses(collegeId, callback);
};

/**
 * Advanced search courses with multiple filters
 */
export const searchCoursesWithFilters = async (filters: {
  query?: string;
  programId?: string;
  subjectId?: string;
  yearOrSemester?: number;
  departmentId?: string;
}): Promise<Course[]> => {
  try {
    // If we have specific filters, use the filtered query
    if (filters.programId || filters.subjectId || filters.yearOrSemester || filters.departmentId) {
      const result = await firebaseCourseService.getCoursesWithFilters(filters);
      
      // If we also have a text query, filter the results further
      if (filters.query && filters.query.trim()) {
        const query = filters.query.toLowerCase();
        return result.data.filter(course => 
          course.title.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query) ||
          course.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          course.skills?.some(skill => skill.toLowerCase().includes(query))
        );
      }
      
      return result.data;
    }
    
    // If only text query, use the regular search
    if (filters.query && filters.query.trim()) {
      return await searchCourses(filters.query);
    }
    
    // If no filters, return empty array
    return [];
  } catch (error) {
    console.error('❌ Error in advanced search:', error);
    return [];
  }
};
