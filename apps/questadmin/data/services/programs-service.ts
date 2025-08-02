/**
 *  Programs Service
 * Client-side service for superadmin programs management
 */

import { getAuthHeaders } from '../config/firebase-auth'
import { CreateProgramRequest, Program, UpdateProgramRequest } from '../models/program'

interface ApiResponse<T = any> {
  success: boolean
  programs?: T[]
  program?: T
  programId?: string
  message?: string
  error?: string
}

/**
 * Get all programs across all colleges and programs (superadmin only)
 */
export async function getAllPrograms(): Promise<Program[]> {
  try {
    const response = await fetch('/api/programs', {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch programs')
    }

    const data: ApiResponse = await response.json()
    return data.programs || []
  } catch (error) {
    console.error('Error fetching  programs:', error)
    throw new Error('Failed to fetch programs')
  }
}

/**
 * Get a specific program by ID (superadmin only)
 */
export async function getProgramById(programId: string): Promise<Program | null> {
  try {
    const response = await fetch(`/api/programs/${programId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch program')
    }

    const data: ApiResponse = await response.json()
    return data.program || null
  } catch (error) {
    console.error('Error fetching  program:', error)
    throw new Error('Failed to fetch program')
  }
}

/**
 * Create a new program (superadmin only)
 */
export async function createProgram(
  programData: CreateProgramRequest
): Promise<string> {
  try {
    const response = await fetch('/api/programs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(programData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create program')
    }

    const data: ApiResponse = await response.json()
    return data.programId || ''
  } catch (error) {
    console.error('Error creating  program:', error)
    throw new Error('Failed to create program')
  }
}

/**
 * Update an existing program (superadmin only)
 */
export async function updateProgram(
  programId: string,
  updates: UpdateProgramRequest
): Promise<void> {
  try {
    const response = await fetch(`/api/programs/${programId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update program')
    }
  } catch (error) {
    console.error('Error updating  program:', error)
    throw new Error('Failed to update program')
  }
}

/**
 * Delete (deactivate) a program (superadmin only)
 */
export async function deleteProgram(programId: string): Promise<void> {
  try {
    const response = await fetch(`/api/programs/${programId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete program')
    }
  } catch (error) {
    console.error('Error deleting  program:', error)
    throw new Error('Failed to delete program')
  }
}

/**
 * Reactivate a deactivated program (superadmin only)
 */
export async function reactivateProgram(programId: string): Promise<void> {
  try {
    const response = await fetch(`/api/programs/${programId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ isActive: true })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to reactivate program')
    }
  } catch (error) {
    console.error('Error reactivating  program:', error)
    throw new Error('Failed to reactivate program')
  }
}
