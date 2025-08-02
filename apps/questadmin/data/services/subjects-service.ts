/**
 * Global Subjects Service
 * Client-side service for superadmin subjects management
 */

import { getAuthHeaders } from '../config/firebase-auth'

export interface Subject {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
}

export interface CreateSubjectRequest {
  name: string
  description?: string
  isActive?: boolean
}

export interface UpdateSubjectRequest {
  name?: string
  description?: string
  isActive?: boolean
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  subjects?: Subject[]
  subject?: Subject
  subjectId?: string
  error?: string
  message?: string
}

/**
 * Get all subjects across all colleges and programs (superadmin only)
 */
export async function getAllSubjects(): Promise<Subject[]> {
  try {
    const response = await fetch('/api/subjects', {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch subjects')
    }

    const data: ApiResponse = await response.json()
    return data.subjects || []
  } catch (error) {
    console.error('Error fetching global subjects:', error)
    throw new Error('Failed to fetch subjects')
  }
}

/**
 * Get a specific subject by ID (superadmin only)
 */
export async function getSubjectById(subjectId: string): Promise<Subject | null> {
  try {
    const response = await fetch(`/api/subjects/${subjectId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch subject')
    }

    const data: ApiResponse = await response.json()
    return data.subject || null
  } catch (error) {
    console.error('Error fetching global subject:', error)
    throw new Error('Failed to fetch subject')
  }
}

/**
 * Create a new subject (superadmin only)
 */
export async function createSubject(
  subjectData: CreateSubjectRequest
): Promise<string> {
  try {
    const response = await fetch('/api/subjects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(subjectData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create subject')
    }

    const data: ApiResponse = await response.json()
    return data.subjectId || ''
  } catch (error) {
    console.error('Error creating global subject:', error)
    throw new Error('Failed to create subject')
  }
}

/**
 * Update an existing subject (superadmin only)
 */
export async function updateSubject(
  subjectId: string,
  updates: UpdateSubjectRequest
): Promise<void> {
  try {
    const response = await fetch(`/api/subjects/${subjectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update subject')
    }
  } catch (error) {
    console.error('Error updating global subject:', error)
    throw new Error('Failed to update subject')
  }
}

/**
 * Delete (deactivate) a subject (superadmin only)
 */
export async function deleteSubject(subjectId: string): Promise<void> {
  try {
    const response = await fetch(`/api/subjects/${subjectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete subject')
    }
  } catch (error) {
    console.error('Error deleting global subject:', error)
    throw new Error('Failed to delete subject')
  }
}

/**
 * Reactivate a deactivated subject (superadmin only)
 */
export async function reactivateSubject(subjectId: string): Promise<void> {
  try {
    const response = await fetch(`/api/subjects/${subjectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ isActive: true })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to reactivate subject')
    }
  } catch (error) {
    console.error('Error reactivating global subject:', error)
    throw new Error('Failed to reactivate subject')
  }
}
