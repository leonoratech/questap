/**
 * Course data types for QuestEdu React Native App
 * Simplified version focused on mobile app needs
 */

import { Timestamp } from 'firebase/firestore';

// ================================
// CORE ENUMS
// ================================

export enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// ================================
// BASE INTERFACES
// ================================

export interface BaseTimestamps {
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface BaseEntity extends BaseTimestamps {
  id?: string;
}

// ================================
// ASSOCIATION INTERFACE
// ================================

/**
 * Course association with college, program, and subject
 * Updated to match questadmin data model
 */
export interface CourseAssociation {
  programId: string;
  programName?: string; // Cached for display
  departmentId?: string; // Optional, if associated with a specific department
  departmentName?: string; // Cached for display
  yearOrSemester: number;
  subjectId: string;
  subjectName?: string; // Cached for display
  language: string;
}

// ================================
// COURSE MODELS
// ================================

/**
 * Main Course interface for mobile app
 * Updated to match questadmin data model
 */
export interface Course extends BaseEntity {
  title: string;
  description?: string;
  instructor: string;
  instructorId: string; // Required, not optional
  category: string;
  categoryId?: string; // ID reference to course category
  subcategory?: string; // Support for subcategories
  level?: CourseLevel;  
  duration?: string | number; // Support both string and number formats
  status?: CourseStatus;
  isPublished?: boolean;
  featured?: boolean;
  rating?: number;
  ratingCount?: number;
  enrollmentCount?: number;
  tags?: string[];
  skills?: string[];
  prerequisites?: string[];
  whatYouWillLearn?: string[]; // New field from admin model
  targetAudience?: string[]; // New field from admin model
  courseImage?: string;
  image?: string; // Legacy support
  promoVideo?: string; // New field from admin model
  progress: number; // User's progress in the course (0-100)
  language?: string;
  subtitles?: string[]; // New field from admin model
  certificates?: boolean;
  lifetimeAccess?: boolean; // New field from admin model
  
  // Mobile-specific fields
  downloadableResources?: boolean;
  mobileAccess?: boolean;
  lastAccessed?: Date;
  bookmarked?: boolean;
  
  // Enhanced course features from admin model
  articlesCount?: number;
  videosCount?: number;
  totalVideoLength?: number; // in minutes
  lastContentUpdate?: Date;
  publishedAt?: Date;
  archivedAt?: Date;
  lastModifiedBy?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  // Multilingual Support & Language Configuration
  primaryLanguage?: string; // Primary language for the course
  supportedLanguages?: string[]; // All supported languages for this course
  enableTranslation?: boolean; // Whether to enable auto-translation features
  
  // Multilingual Content Fields (optional - for future multilingual content)
  multilingualTitle?: Record<string, string>; // Language code -> title
  multilingualDescription?: Record<string, string>; // Language code -> description
  multilingualTags?: Record<string, string[]>; // Language code -> tags array
  multilingualSkills?: Record<string, string[]>; // Language code -> skills array
  multilingualPrerequisites?: Record<string, string[]>; // Language code -> prerequisites array
  multilingualWhatYouWillLearn?: Record<string, string[]>; // Language code -> learning outcomes array
  multilingualTargetAudience?: Record<string, string[]>; // Language code -> target audience array
  
  // Course associations (supports multiple)
  associations?: CourseAssociation[];
  
  // Legacy support for single association
  association?: CourseAssociation;
}

/**
 * Course search criteria
 */
export interface CourseSearchCriteria {
  query?: string;
  category?: string;
  level?: CourseLevel;
  minProgress?: number;
  maxProgress?: number;
  featured?: boolean;
  tags?: string[];
}

/**
 * Course query options
 */
export interface CourseQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Course creation data (excludes system fields)
 * Updated to match questadmin data model
 */
export interface CreateCourseData {
  title: string;
  description?: string;
  instructor: string;
  instructorId: string; // Required, not optional
  category: string;
  categoryId?: string;
  subcategory?: string;
  level?: CourseLevel;  
  duration?: string | number;
  status?: CourseStatus;
  isPublished?: boolean;
  featured?: boolean;
  tags?: string[];
  skills?: string[];
  prerequisites?: string[];
  whatYouWillLearn?: string[];
  targetAudience?: string[];
  courseImage?: string;
  image?: string;
  promoVideo?: string;
  progress: number;
  language?: string;
  subtitles?: string[];
  certificates?: boolean;
  lifetimeAccess?: boolean;
  downloadableResources?: boolean;
  mobileAccess?: boolean;
  articlesCount?: number;
  videosCount?: number;
  totalVideoLength?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  
  // Language configuration
  primaryLanguage?: string;
  supportedLanguages?: string[];
  enableTranslation?: boolean;
  
  // Multilingual content fields
  multilingualTitle?: Record<string, string>;
  multilingualDescription?: Record<string, string>;
  multilingualTags?: Record<string, string[]>;
  multilingualSkills?: Record<string, string[]>;
  multilingualPrerequisites?: Record<string, string[]>;
  multilingualWhatYouWillLearn?: Record<string, string[]>;
  multilingualTargetAudience?: Record<string, string[]>;
  
  // Association fields
  associations?: CourseAssociation[];
}

/**
 * Course update data (partial course data)
 * Updated to match questadmin data model
 */
export interface UpdateCourseData {
  title?: string;
  description?: string;
  instructor?: string;
  instructorId?: string;
  category?: string;
  categoryId?: string;
  subcategory?: string;
  level?: CourseLevel;
  duration?: string | number;
  status?: CourseStatus;
  isPublished?: boolean;
  featured?: boolean;
  tags?: string[];
  skills?: string[];
  prerequisites?: string[];
  whatYouWillLearn?: string[];
  targetAudience?: string[];
  courseImage?: string;
  image?: string;
  promoVideo?: string;
  progress?: number;
  language?: string;
  subtitles?: string[];
  certificates?: boolean;
  lifetimeAccess?: boolean;
  downloadableResources?: boolean;
  mobileAccess?: boolean;
  lastAccessed?: Date;
  bookmarked?: boolean;
  articlesCount?: number;
  videosCount?: number;
  totalVideoLength?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  
  // Language configuration
  primaryLanguage?: string;
  supportedLanguages?: string[];
  enableTranslation?: boolean;
  
  // Multilingual content fields
  multilingualTitle?: Record<string, string>;
  multilingualDescription?: Record<string, string>;
  multilingualTags?: Record<string, string[]>;
  multilingualSkills?: Record<string, string[]>;
  multilingualPrerequisites?: Record<string, string[]>;
  multilingualWhatYouWillLearn?: Record<string, string[]>;
  multilingualTargetAudience?: Record<string, string[]>;
  
  // Association fields
  associations?: CourseAssociation[];
}

// ================================
// OPERATION RESULT TYPES
// ================================

/**
 * Generic operation result
 */
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Query result with pagination
 */
export interface QueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextPageToken?: string;
}

// ================================
// UTILITY TYPES
// ================================

/**
 * Course category mapping
 */
export const COURSE_CATEGORIES = {
  PROGRAMMING: 'Programming',
  DESIGN: 'Design',
  DATA_SCIENCE: 'Data Science',
  BUSINESS: 'Business',
  MARKETING: 'Marketing',
  LANGUAGE: 'Language',
  PERSONAL_DEVELOPMENT: 'Personal Development',
  TECHNOLOGY: 'Technology',
  HEALTH: 'Health & Fitness',
  MUSIC: 'Music',
  ART: 'Art',
  OTHER: 'Other'
} as const;

export type CourseCategory = typeof COURSE_CATEGORIES[keyof typeof COURSE_CATEGORIES];

/**
 * Course progress status
 */
export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

/**
 * Get progress status from progress percentage
 */
export function getProgressStatus(progress: number): ProgressStatus {
  if (progress === 0) return ProgressStatus.NOT_STARTED;
  if (progress >= 100) return ProgressStatus.COMPLETED;
  return ProgressStatus.IN_PROGRESS;
}

/**
 * Format progress as percentage string
 */
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

/**
 * Get course display image
 */
export function getCourseImage(course: Course): string | undefined {
  return course.courseImage || course.image;
}

/**
 * Get course duration in minutes (if numeric)
 */
export function getCourseDurationMinutes(course: Course): number | null {
  if (!course.duration) return null;
  
  // If duration is already a number, return it
  if (typeof course.duration === 'number') {
    return course.duration;
  }
  
  // Try to extract minutes from duration string
  const match = course.duration.match(/(\d+)\s*(hour|hr|h|minute|min|m)/i);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit.startsWith('h')) {
      return value * 60; // Convert hours to minutes
    } else if (unit.startsWith('m')) {
      return value;
    }
  }
  
  return null;
}
