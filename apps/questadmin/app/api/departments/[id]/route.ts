/**
 * Individual Department Management API
 * For superadmin to manage specific departments
 */

import { UserRole } from '@/data/models/user-model'
import { DepartmentRepository } from '@/data/repository/department-service'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'
/**
 * GET /api/departments/[id]
 * Get a specific department by ID (superadmin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: departmentId } = await params
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  // Only superadmin can access global departments
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can access departments.' },
      { status: 403 }
    )
  }

  try {
    const departmentRepository = new DepartmentRepository();
    const departmentDoc = await departmentRepository.getById(departmentId);

    return NextResponse.json({
      success: true,
      department: departmentDoc
    })

  } catch (error: any) {
    console.error('Error fetching department:', error)
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/departments/[id]
 * Update a specific department (superadmin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: departmentId } = await params
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  // Only superadmin can update subjects
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can update departments.' },
      { status: 403 }
    )
  }

  try {
    const departmentRepository = new DepartmentRepository();
    const departmentDoc = await departmentRepository.getById(departmentId);
    
    const body = await request.json()
    const { name, description, isActive } = body

    // Validate required fields if provided
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: 'Department name cannot be empty' },
        { status: 400 }
      )
    }

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: user.uid
    }

    // Only update fields that are provided
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive

    await departmentRepository.update(departmentId, updateData)

    return NextResponse.json({
      success: true,
      message: 'Department updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating department:', error)
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/departments/[id]
 * Delete a specific department (superadmin only)
 * This performs a soft delete by setting isActive to false
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: departmentId } = await params
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  // Only superadmin can delete departments
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can delete departments.' },
      { status: 403 }
    )
  }

  try {
    const departmentRepository = new DepartmentRepository();
    const departmentDoc = await departmentRepository.getById(departmentId);

    // Perform soft delete
    await departmentRepository.update(departmentId, {
      isActive: false,
      updatedAt: new Date(),
      updatedBy: user.uid
    })

    return NextResponse.json({
      success: true,
      message: 'Department deactivated successfully'
    })

  } catch (error: any) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
}
