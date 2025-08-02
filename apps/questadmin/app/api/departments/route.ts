/**
 * Global Subjects Management API
 * For superadmin to manage all subjects across all colleges and programs
 */

import { UserRole } from '@/data/models/user-model'
import { adminDb } from '@/data/repository/firebase-admin'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/departments
 * Get all departments (superadmin only)
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

  // Only superadmin can access global departments
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can access departments management.' },
      { status: 403 }
    )
  }

  try {
    // Get all departments with their college and program information
    const departmentsSnapshot = await adminDb.collection('departments').get()

    const departments = await Promise.all(
      departmentsSnapshot.docs.map(async (doc) => {
        const departmentData = doc.data()

        // Fetch related college and program information
        return {
          id: doc.id,
          ...departmentData,
          createdAt: departmentData.createdAt?.toDate?.() || departmentData.createdAt,
          updatedAt: departmentData.updatedAt?.toDate?.() || departmentData.updatedAt,
        }
      })
    )

    // Sort by college, then program, then department name
    departments.sort((a, b) => {
      return (a as any).name.localeCompare((b as any).name)
    })

    return NextResponse.json({
      success: true,
      departments
    })

  } catch (error: any) {
    console.error('Error fetching global departments:', error)
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

    const docRef = await adminDb.collection('departments').add(departmentData)

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
