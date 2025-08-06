import { Timestamp } from 'firebase-admin/firestore'

// Language options for courses
export const COURSE_LANGUAGES = {
  ENGLISH: 'English',
  TELUGU: 'Telugu'
} as const

export type CourseLanguage = typeof COURSE_LANGUAGES[keyof typeof COURSE_LANGUAGES]

// Course data model interface
export interface Course {
  id?: string
  title: string
  description: string
  subjectId: string
  subjectName: string
  language: string
  instructor: string
  instructorId: string
  duration?: number // Duration in hours
  status: 'draft' | 'published' | 'archived'
  isPublished: boolean
  featured?: boolean
  rating?: number
  ratingCount?: number
  tags?: string[]
  skills?: string[]
  prerequisites?: string[]
  objectives?: string[]
  syllabus?: string
  // Image and media fields
  image?: string // Main course image URL
  imageFileName?: string // Original filename for storage reference
  imageStoragePath?: string // Firebase Storage path
  thumbnailUrl?: string // Thumbnail version of the image
  videoUrl?: string
  resources?: CourseResource[]
  // Association fields (optional, now supports multiple associations)
  associations?: CourseAssociation[]
  createdAt: Date | Timestamp
  updatedAt: Date | Timestamp
  createdBy?: string
}

export interface CourseResource {
  id: string
  title: string
  type: 'pdf' | 'video' | 'link' | 'document'
  url: string
  description?: string
}

export interface CourseAssociation {
  programId: string
  programName?: string // Cached for display
  departmentId?: string // Optional, if associated with a specific department
  departmentName?: string // Cached for display
  yearOrSemester: number
}

export interface CreateCourseRequest {
  title: string
  description: string
  subjectId: string
  subjectName?: string // Will be populated from subjects collection
  language: string // 'English' or 'Telugu'
  instructorId: string
  duration?: number
  status?: 'draft' | 'published'
  featured?: boolean
  tags?: string[]
  skills?: string[]
  prerequisites?: string[]
  objectives?: string[]
  syllabus?: string
  // Image and media fields
  image?: string
  imageFileName?: string
  imageStoragePath?: string
  thumbnailUrl?: string
  videoUrl?: string
  // Association fields (optional, now supports multiple associations)
  associations?: CourseAssociation[]
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  id: string
  isPublished?: boolean
}

export interface CourseStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  archivedCourses: number
  averageRating: number
  coursesByCategory: Record<string, number>
  coursesByDifficulty: Record<string, number>
}

export interface CourseSearchFilters {
  search?: string
  instructorId?: string
  status?: string
  featured?: boolean
  limit?: number
  browsing?: boolean
}
