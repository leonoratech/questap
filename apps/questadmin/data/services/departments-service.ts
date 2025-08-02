/**
 * Global Subjects Service
 * Client-side service for superadmin subjects management
 */

import { getAuthHeaders } from '../config/firebase-auth'

export interface Department {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
}

export interface CreateDepartmentRequest {
  name: string
  description?: string
  isActive?: boolean
}

export interface UpdateDepartmentRequest {
  name?: string
  description?: string
  isActive?: boolean
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  departments?: Department[]
  department?: Department
  departmentId?: string
  error?: string
  message?: string
}

/**
 * Get all subjects across all colleges and programs (superadmin only)
 */
export async function getAllDepartments(): Promise<Department[]> {
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
    return data.departments || []
  } catch (error) {
    console.error('Error fetching global departments:', error)
    throw new Error('Failed to fetch departments')
  }
}

/**
 * Get a specific department by ID (superadmin only)
 */
export async function getDepartmentById(departmentId: string): Promise<Department | null> {
  try {
    const response = await fetch(`/api/departments/${departmentId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch department')
    }

    const data: ApiResponse = await response.json()
    return data.department || null
  } catch (error) {
    console.error('Error fetching global department:', error)
    throw new Error('Failed to fetch department')
  }
}

/**
 * Create a new department (superadmin only)
 */
export async function createDepartment(
  departmentData: CreateDepartmentRequest
): Promise<string> {
  try {
    const response = await fetch('/api/departments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(departmentData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create department')
    }

    const data: ApiResponse = await response.json()
    return data.departmentId || ''
  } catch (error) {
    console.error('Error creating global department:', error)
    throw new Error('Failed to create department')
  }
}

/**
 * Update an existing department (superadmin only)
 */
export async function updateDepartment(
  departmentId: string,
  updates: UpdateDepartmentRequest
): Promise<void> {
  try {
    const response = await fetch(`/api/departments/${departmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update department')
    }
  } catch (error) {
    console.error('Error updating global department:', error)
    throw new Error('Failed to update department')
  }
}

/**
 * Delete (deactivate) a department (superadmin only)
 */
export async function deleteDepartment(departmentId: string): Promise<void> {
  try {
    const response = await fetch(`/api/departments/${departmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete department')
    }
  } catch (error) {
    console.error('Error deleting global department:', error)
    throw new Error('Failed to delete department')
  }
}

/**
 * Reactivate a deactivated department (superadmin only)
 */
export async function reactivateDepartment(departmentId: string): Promise<void> {
  try {
    const response = await fetch(`/api/departments/${departmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ isActive: true })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to reactivate department')
    }
  } catch (error) {
    console.error('Error reactivating global department:', error)
    throw new Error('Failed to reactivate department')
  }
}
