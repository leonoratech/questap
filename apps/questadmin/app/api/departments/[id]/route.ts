/**
 * Individual Department Management API
 * For superadmin to manage specific departments
 */

import { UserRole } from '@/data/models/user-model'
import { adminDb } from '@/data/repository/firebase-admin'
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
    const departmentDoc = await adminDb.collection('departments').doc(departmentId).get()

    if (!departmentDoc.exists) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    const departmentData = departmentDoc.data()
    
    return NextResponse.json({
      success: true,
      department: {
        id: departmentDoc.id,
        ...departmentData,
        createdAt: departmentData?.createdAt?.toDate?.() || departmentData?.createdAt,
        updatedAt: departmentData?.updatedAt?.toDate?.() || departmentData?.updatedAt,
      }
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
    const departmentDoc = await adminDb.collection('departments').doc(departmentId).get()

    if (!departmentDoc.exists) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

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

    await adminDb.collection('departments').doc(departmentId).update(updateData)

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
    const departmentDoc = await adminDb.collection('departments').doc(departmentId).get()

    if (!departmentDoc.exists) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // Perform soft delete
    await adminDb.collection('departments').doc(departmentId).update({
      isActive: false,
      updatedAt: new Date(),
      updatedBy: user.uid,
      deletedAt: new Date(),
      deletedBy: user.uid
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
