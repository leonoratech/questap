import { BaseEntity } from './basemodel';
// User roles
export enum UserRole {
  SUPERADMIN = 'superadmin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}

export interface UserProfile extends BaseEntity {
  uid: string
  email: string
  firstName: string
  lastName: string
  displayName: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  lastLoginAt: Date
  profilePicture?: string
  bio?: string
  departmentId?: string
  departmentName?: string  
  description?: string
  
  // Contact Information
  phone?: string
  districtName?: string
  
  // Instructor-specific fields
  coreTeachingSkills?: string[]
  additionalTeachingSkills?: string[]
  
  // Student-specific fields  
  programId?: string
  programCode?: string
  mainSubjects?: string[]
  class?: string
  
  // Profile completion status
  profileCompleted?: boolean
}