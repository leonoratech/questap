/**
 * Client-side Course Association Service
 * Handles API calls for course associations
 */

import { getAuthHeaders } from '@/data/config/firebase-auth'
import { CourseAssociation } from '@/data/models/course'

export interface AssociateCourseRequest {
  collegeId: string
  programId: string
  yearOrSemester: number
}

class CourseAssociationService {
  private async getHeaders(): Promise<HeadersInit> {
    const headers = await getAuthHeaders()
    return {
      'Content-Type': 'application/json',
      ...headers
    }
  }

  async associateCourse(courseId: string, associations: AssociateCourseRequest | AssociateCourseRequest[]): Promise<CourseAssociation[]> {
    // Always send an array, even if a single association is provided
    const associationsArray = Array.isArray(associations) ? associations : [associations];
    const response = await fetch(`/api/courses/${courseId}/association`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(associationsArray)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to associate course');
    }

    const data = await response.json();
    return data.associations;
  }

  async removeAssociation(courseId: string): Promise<void> {
    const response = await fetch(`/api/courses/${courseId}/association`, {
      method: 'DELETE',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to remove association')
    }
  }

  async getCoursesByProgram(programId: string, yearOrSemester?: number): Promise<any[]> {
    const params = new URLSearchParams({ programId })
    if (yearOrSemester) {
      params.append('yearOrSemester', yearOrSemester.toString())
    }

    const response = await fetch(`/api/courses/associations?${params}`, {
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch courses')
    }

    const data = await response.json()
    return data.courses
  }

  async getCoursesBySubject(subjectId: string): Promise<any[]> {
    const response = await fetch(`/api/courses/associations?subjectId=${subjectId}`, {
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch courses')
    }

    const data = await response.json()
    return data.courses
  }

  async getCoursesByLanguage(language: string): Promise<any[]> {
    const response = await fetch(`/api/courses/associations?language=${language}`, {
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch courses')
    }

    const data = await response.json()
    return data.courses
  }
}

export const courseAssociationService = new CourseAssociationService()
