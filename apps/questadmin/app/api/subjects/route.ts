/**
 * Global Subjects Management API
 * For superadmin to manage all subjects across all colleges and programs
 */

import { UserRole } from '@/data/models/user-model'
import { SubjectRepository } from '@/data/repository/subject-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/subjects
 * Get all subjects across all colleges and programs (superadmin and instructor)
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAuth()(request)
    
    if ('error' in authResult) {
        return NextResponse.json(
            { error: authResult.error },
            { status: authResult.status }
        )
    }

    const { user } = authResult

    // Allow superadmin and instructor to read subjects (instructors need them for course creation)
    if (user.role !== UserRole.SUPERADMIN && user.role !== UserRole.INSTRUCTOR) {
        return NextResponse.json(
            { error: 'Unauthorized. Only superadmins and instructors can access subjects.' },
            { status: 403 }
        )
    }

    try {
        // Use SubjectRepository to get all subjects
        const subjectRepository = new SubjectRepository()
        const subjects = await subjectRepository.getAll()

        // Sort by name
        subjects.sort((a, b) => a.name.localeCompare(b.name))

        return NextResponse.json({
            success: true,
            subjects
        })

    } catch (error: any) {
        console.error('Error fetching global subjects:', error)
        return NextResponse.json(
            { error: 'Failed to fetch subjects' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/subjects
 * Create a new subject (superadmin only)
 * Note: This is for creating global subjects, not tied to specific programs
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAuth()(request)
    
    if ('error' in authResult) {
        return NextResponse.json(
            { error: authResult.error },
            { status: authResult.status }
        )
    }

    const { user } = authResult

    // Only superadmin can create global subjects
    if (user.role !== UserRole.SUPERADMIN) {
        return NextResponse.json(
            { error: 'Unauthorized. Only superadmins can create subjects.' },
            { status: 403 }
        )
    }

    try {
        const body = await request.json()
        const { name, description, isActive = true } = body

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        const subjectData = {
            name,
            description: description || '',
            isActive,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: user.uid
        }

        // Use SubjectRepository to create subject
        const subjectRepository = new SubjectRepository()
        const subjectId = await subjectRepository.create(subjectData)

        return NextResponse.json({
            success: true,
            subjectId,
            message: 'Subject created successfully'
        })

    } catch (error: any) {
        console.error('Error creating subject:', error)
        return NextResponse.json(
            { error: 'Failed to create subject' },
            { status: 500 }
        )
    }
}
