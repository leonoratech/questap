/**
 * Global Subjects Management API
 * For superadmin to manage all subjects across all colleges and programs
 */

import { UserRole } from '@/data/models/user-model'
import { DepartmentRepository } from '@/data/repository/department-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
/**
 * GET /api/departments
 * Get all active departments
 * - Superadmins can see all departments
 * - Instructors and students can see active departments for profile selection
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

  try {
    const departmentRepository = new DepartmentRepository()
    let departments = await departmentRepository.getAll()

    // Non-superadmins can only see active departments
    if (user.role !== UserRole.SUPERADMIN) {
      departments = departments.filter(dept => dept.isActive)
    }

    // Sort by department name
    departments.sort((a, b) => {
      return (a as any).name.localeCompare((b as any).name)
    })

    return NextResponse.json({
      success: true,
      departments
    })

  } catch (error: any) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/departments
 * Create a new department (superadmin only)
 * Note: This is for creating global departments, not tied to specific programs
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
      { error: 'Unauthorized. Only superadmins can create departments.' },
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

    const departmentData = {
      name,
      description: description || '',
      isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid
    }

    const departmentRepository = new DepartmentRepository()
    const docRef = await departmentRepository.create(departmentData)

    return NextResponse.json({
      success: true,
      departmentId: docRef.id,
      message: 'Department created successfully'
    })

  } catch (error: any) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
}
