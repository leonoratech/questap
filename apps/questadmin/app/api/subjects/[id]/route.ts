/**
 * Individual Subject Management API
 * For superadmin to manage specific subjects
 */

import { UserRole } from '@/data/models/user-model'
import { adminDb } from '@/data/repository/firebase-admin'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/subjects/[id]
 * Get a specific subject by ID (superadmin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: subjectId } = await params
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  // Only superadmin can access global subjects
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can access subjects.' },
      { status: 403 }
    )
  }

  try {
    const subjectDoc = await adminDb.collection('subjects').doc(subjectId).get()
    
    if (!subjectDoc.exists) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }

    const subjectData = subjectDoc.data()
    
    return NextResponse.json({
      success: true,
      subject: {
        id: subjectDoc.id,
        ...subjectData,
        createdAt: subjectData?.createdAt?.toDate?.() || subjectData?.createdAt,
        updatedAt: subjectData?.updatedAt?.toDate?.() || subjectData?.updatedAt,
      }
    })

  } catch (error: any) {
    console.error('Error fetching subject:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subject' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/subjects/[id]
 * Update a specific subject (superadmin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: subjectId } = await params
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
      { error: 'Unauthorized. Only superadmins can update subjects.' },
      { status: 403 }
    )
  }

  try {
    const subjectDoc = await adminDb.collection('subjects').doc(subjectId).get()
    
    if (!subjectDoc.exists) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, isActive } = body

    // Validate required fields if provided
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: 'Subject name cannot be empty' },
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

    await adminDb.collection('subjects').doc(subjectId).update(updateData)

    return NextResponse.json({
      success: true,
      message: 'Subject updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating subject:', error)
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/subjects/[id]
 * Delete a specific subject (superadmin only)
 * This performs a soft delete by setting isActive to false
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: subjectId } = await params
  const authResult = await requireAuth()(request)
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const { user } = authResult

  // Only superadmin can delete subjects
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can delete subjects.' },
      { status: 403 }
    )
  }

  try {
    const subjectDoc = await adminDb.collection('subjects').doc(subjectId).get()
    
    if (!subjectDoc.exists) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }

    // Perform soft delete
    await adminDb.collection('subjects').doc(subjectId).update({
      isActive: false,
      updatedAt: new Date(),
      updatedBy: user.uid,
      deletedAt: new Date(),
      deletedBy: user.uid
    })

    return NextResponse.json({
      success: true,
      message: 'Subject deactivated successfully'
    })

  } catch (error: any) {
    console.error('Error deleting subject:', error)
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    )
  }
}
