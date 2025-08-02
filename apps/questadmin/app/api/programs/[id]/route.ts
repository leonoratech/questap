/**
 * Individual Program Management API
 * For superadmin to manage specific programs
 */

import { UserRole } from '@/data/models/user-model'
import { DepartmentRepository } from '@/data/repository/department-service'
import { ProgramRepository } from '@/data/repository/program-service'
import { SubjectRepository } from '@/data/repository/subject-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
/**
 * GET /api/programs/[id]
 * Get a specific program by ID (superadmin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: programId } = await params
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  // Only superadmin can access global programs
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can access programs.' },
      { status: 403 }
    )
  }

  try {
    const programRepository = new ProgramRepository()
    const departmentRepository = new DepartmentRepository()
    const subjectRepository = new SubjectRepository()
    
    const program: any = await programRepository.getById(programId)

    // Enrich program with department and subjects data
    let department = null
    let subjects: any[] = []

    // Get department data if departmentId exists
    if (program.departmentId) {
      try {
        department = await departmentRepository.getById(program.departmentId)
      } catch (error) {
        console.error(`Error fetching department ${program.departmentId}:`, error)
      }
    }

    // Get subjects data if subjectIds exist
    if (program.subjectIds && Array.isArray(program.subjectIds)) {
      subjects = await Promise.all(
        program.subjectIds.map(async (subjectId: string) => {
          try {
            return await subjectRepository.getById(subjectId)
          } catch (error) {
            console.error(`Error fetching subject ${subjectId}:`, error)
            return null
          }
        })
      )
      // Filter out null subjects
      subjects = subjects.filter(subject => subject !== null)
    }

    const enrichedProgram = {
      ...program,
      department,
      subjects
    }

    return NextResponse.json({
      success: true,
      program: enrichedProgram
    })

  } catch (error: any) {
    console.error('Error fetching program:', error)
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/programs/[id]
 * Update a specific program (superadmin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: programId } = await params
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  // Only superadmin can update programs
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can update programs.' },
      { status: 403 }
    )
  }

  try {
    const programRepository = new ProgramRepository()
    const departmentRepository = new DepartmentRepository()
    const subjectRepository = new SubjectRepository()
    
    const programDoc = await programRepository.getById(programId)
    
    const body = await request.json()
    const { 
      name, 
      description, 
      departmentId,
      subjectIds,
      yearsOrSemesters,
      semesterType,
      language,
      programCode,
      isActive 
    } = body

    // Validate required fields if provided
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: 'Program name cannot be empty' },
        { status: 400 }
      )
    }

    // Validate department if provided
    if (departmentId !== undefined) {
      try {
        await departmentRepository.getById(departmentId)
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid department ID' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: user.uid
    }

    // Only update fields that are provided
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description
    if (departmentId !== undefined) {
      const department = await departmentRepository.getById(departmentId)
      updateData.department = department
      updateData.departmentId = departmentId
    }
    if (subjectIds !== undefined) {
      // Get subject objects
      const subjects = await Promise.all(
        subjectIds.map(async (subjectId: string) => {
          try {
            return await subjectRepository.getById(subjectId)
          } catch (error) {
            console.error(`Error fetching subject ${subjectId}:`, error)
            return null
          }
        })
      )
      updateData.subjects = subjects.filter(subject => subject !== null)
      updateData.subjectIds = subjectIds
    }
    if (yearsOrSemesters !== undefined) updateData.yearsOrSemesters = yearsOrSemesters
    if (semesterType !== undefined) updateData.semesterType = semesterType
    if (language !== undefined) updateData.language = language
    if (programCode !== undefined) updateData.programCode = programCode
    if (isActive !== undefined) updateData.isActive = isActive

    await programRepository.update(programId, updateData)

    return NextResponse.json({
      success: true,
      message: 'Program updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating program:', error)
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/programs/[id]
 * Delete a specific program (superadmin only)
 * This performs a soft delete by setting isActive to false
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: programId } = await params
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  // Only superadmin can delete programs
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can delete programs.' },
      { status: 403 }
    )
  }

  try {
    const programRepository = new ProgramRepository()
    const programDoc = await programRepository.getById(programId)
    
    // Perform soft delete
    const updateData = {
      isActive: false,
      updatedAt: new Date(),
      updatedBy: user.uid
    }

    await programRepository.update(programId, updateData)

    return NextResponse.json({
      success: true,
      message: 'Program deactivated successfully'
    })

  } catch (error: any) {
    console.error('Error deleting program:', error)
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    )
  }
}
