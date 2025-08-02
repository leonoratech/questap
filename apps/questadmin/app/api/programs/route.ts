/**
 * Programs Management API
 * For superadmin to manage all programs across all colleges
 */

import { UserRole } from '@/data/models/user-model'
import { DepartmentRepository } from '@/data/repository/department-service'
import { ProgramRepository } from '@/data/repository/program-service'
import { SubjectRepository } from '@/data/repository/subject-service'
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

  // // Only superadmin can access programs management
  // if (user.role !== UserRole.SUPERADMIN) {
  //   return NextResponse.json(
  //     { error: 'Unauthorized. Only superadmins can access programs management.' },
  //     { status: 403 }
  //   )
  // }

  try {
    // Get all programs with their department and subjects information
    const programRepository = new ProgramRepository()
    const departmentRepository = new DepartmentRepository()
    const subjectRepository = new SubjectRepository()
    
    const programs = await programRepository.getAll()

    // Enrich programs with department and subjects data
    // const enrichedPrograms = await Promise.all(
    //   programs.map(async (program: any) => {
    //     let department = null
    //     let subjects: any[] = []

    //     // Get department data if departmentId exists
    //     if (program.departmentId) {
    //       try {
    //         department = await departmentRepository.getById(program.departmentId)
    //       } catch (error) {
    //         console.error(`Error fetching department ${program.departmentId}:`, error)
    //       }
    //     }

    //     // Get subjects data if subjectIds exist
    //     if (program.subjectIds && Array.isArray(program.subjectIds)) {
    //       subjects = await Promise.all(
    //         program.subjectIds.map(async (subjectId: string) => {
    //           try {
    //             return await subjectRepository.getById(subjectId)
    //           } catch (error) {
    //             console.error(`Error fetching subject ${subjectId}:`, error)
    //             return null
    //           }
    //         })
    //       )
    //       // Filter out null subjects
    //       subjects = subjects.filter(subject => subject !== null)
    //     }

    //     return {
    //       ...program,
    //       department,
    //       subjects
    //     }
    //   })
    // )

    // Sort by name
    programs.sort((a, b) => {
      return (a as any).name.localeCompare((b as any).name)
    })

    return NextResponse.json({
      success: true,
      programs: programs
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

  // Only superadmin can create global programs
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can create programs.' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      departmentId, 
      subjectIds = [], 
      yearsOrSemesters = 4, 
      semesterType = 'semesters',
      language,
      programCode,
      isActive = true 
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!departmentId) {
      return NextResponse.json(
        { error: 'Department is required' },
        { status: 400 }
      )
    }

    // Get department and subjects data
    const departmentRepository = new DepartmentRepository()
    const subjectRepository = new SubjectRepository()

    let department = null
    let subjects: any[] = []

    try {
      department = await departmentRepository.getById(departmentId)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      )
    }

    // Get subjects if provided
    if (subjectIds.length > 0) {
      subjects = await Promise.all(
        subjectIds.map(async (subjectId: string) => {
          try {
            return await subjectRepository.getById(subjectId)
          } catch (error) {
            console.error(`Error fetching subject ${subjectId}:`, error)
            return null
          }
        })
      )
      subjects = subjects.filter(subject => subject !== null)
    }

    const programData = {
      name,
      description: description || '',
      department,
      subjects,
      yearsOrSemesters,
      semesterType,
      language,
      programCode,
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
    console.error('Error creating program:', error)
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    )
  }
}
