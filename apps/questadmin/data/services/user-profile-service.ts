/**
 * User Profile Service
 * Client-side service for user profile management with department integration
 */

import { getAuthHeaders } from '../config/firebase-auth'
import { Department } from '../models/department'
import { UserProfile, UserRole } from '../models/user-model'

export interface UpdateUserProfileRequest {
  firstName?: string
  lastName?: string
  bio?: string
  departmentId?: string
  departmentName?: string
  description?: string
  coreTeachingSkills?: string[]
  additionalTeachingSkills?: string[]
  mainSubjects?: string[]
  class?: string
  profileCompleted?: boolean
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  user?: UserProfile
  departments?: Department[]
  error?: string
  message?: string
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch profile')
    }

    const data: ApiResponse = await response.json()
    return data.user || null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw new Error('Failed to fetch profile')
  }
}

/**
 * Update user profile with department integration
 */
export async function updateUserProfile(updates: UpdateUserProfileRequest): Promise<UserProfile> {
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update profile')
    }

    const data: ApiResponse = await response.json()
    return data.user!
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update profile')
  }
}

/**
 * Get available departments for profile selection
 */
export async function getAvailableDepartments(): Promise<Department[]> {
  try {
    const response = await fetch('/api/departments', {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch departments')
    }

    const data: ApiResponse = await response.json()
    return data.departments?.filter(dept => dept.isActive) || []
  } catch (error) {
    console.error('Error fetching departments:', error)
    // Return empty array on error, don't throw
    return []
  }
}

/**
 * Validate profile data before submission
 */
export function validateProfileData(data: UpdateUserProfileRequest, role: UserRole): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Basic validation
  if (data.firstName && data.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long')
  }

  if (data.lastName && data.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long')
  }

  // Role-specific validation
  if (role === UserRole.INSTRUCTOR) {
    if (data.coreTeachingSkills && data.coreTeachingSkills.length === 0) {
      errors.push('At least one core teaching skill is required for instructors')
    }
  }

  if (role === UserRole.STUDENT) {
    if (data.mainSubjects && data.mainSubjects.length === 0) {
      errors.push('At least one main subject is required for students')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Format skills/subjects from comma-separated string to array
 */
export function formatSkillsFromString(skillsString: string): string[] {
  return skillsString
    .split(',')
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0)
}

/**
 * Format skills/subjects from array to comma-separated string
 */
export function formatSkillsToString(skills: string[]): string {
  return skills.join(', ')
}

/**
 * Get user initials for avatar display
 */
export function getUserInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Get role badge styling
 */
export function getRoleBadgeClass(role: UserRole): string {
  switch (role) {
    case UserRole.SUPERADMIN:
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case UserRole.INSTRUCTOR:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case UserRole.STUDENT:
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Format role name for display
 */
export function formatRoleName(role: UserRole): string {
  switch (role) {
    case UserRole.SUPERADMIN:
      return 'Super Admin'
    case UserRole.INSTRUCTOR:
      return 'Instructor'
    case UserRole.STUDENT:
      return 'Student'
    default:
      return 'Unknown'
  }
}
