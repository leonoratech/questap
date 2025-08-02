/**
 * Individual Subject Management API
 * For superadmin to manage specific subjects
 */

import { UserRole } from '@/data/models/user-model'
import { ProgramRepository } from '@/data/repository/program-service'
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

  // Only superadmin can access global subjects
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can access programs.' },
      { status: 403 }
    )
  }

  try {
    const programRepository = new ProgramRepository()
    const programDoc = await programRepository.getById(programId)

    return NextResponse.json({
      success: true,
      program: programDoc
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
 * Update a specific subject (superadmin only)
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

  // Only superadmin can update subjects
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can update programs.' },
      { status: 403 }
    )
  }

  try {
    const programRepository = new ProgramRepository()
    const programDoc = await programRepository.getById(programId)
    
    const body = await request.json()
    const { name, description, isActive } = body

    // Validate required fields if provided
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: 'Program name cannot be empty' },
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

    await programRepository.update(programId, updateData)

    return NextResponse.json({
      success: true,
      message: 'Program updated successfully'
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

  // Only superadmin can delete subjects
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
