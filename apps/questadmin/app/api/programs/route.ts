/**
 * Programs Management API
 * For superadmin to manage all programs across all colleges
 */

import { UserRole } from '@/data/models/user-model'
import { ProgramRepository } from '@/data/repository/program-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/programs
 * Get all programs across all colleges (superadmin only)
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

  // Only superadmin can access programs management
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can access programs management.' },
      { status: 403 }
    )
  }

  try {
    // Get all subjects with their college and program information
    const programRepository = new ProgramRepository()
    const programs = await programRepository.getAll()

    // Sort by college, then program, then subject name
    programs.sort((a, b) => {
      return (a as any).name.localeCompare((b as any).name)
    })

    return NextResponse.json({
      success: true,
      programs
    })

  } catch (error: any) {
    console.error('Error fetching global programs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/programs
 * Create a new program (superadmin only)
 * Note: This is for creating global programs, not tied to specific colleges
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
    const { name, description, isActive = true  } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const programData = {
      name,
      description: description || '',
      isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid
    }

    const programRepository = new ProgramRepository()
    const docRef = await programRepository.create(programData)

    return NextResponse.json({
      success: true,
      programId: docRef.id,
      message: 'Program created successfully'
    })

  } catch (error: any) {
    console.error('Error creating subject:', error)
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    )
  }
}
