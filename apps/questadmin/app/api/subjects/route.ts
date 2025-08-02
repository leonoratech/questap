/**
 * Global Subjects Management API
 * For superadmin to manage all subjects across all colleges and programs
 */

import { UserRole } from '@/data/models/user-model'
import { adminDb } from '@/data/repository/firebase-admin'
import { requireAuth } from '@/lib/server-auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/subjects
 * Get all subjects across all colleges and programs (superadmin only)
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

  // Only superadmin can access global subjects
  if (user.role !== UserRole.SUPERADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized. Only superadmins can access global subjects management.' },
      { status: 403 }
    )
  }

  try {
    // Get all subjects with their college and program information
    const subjectsSnapshot = await adminDb.collection('subjects').get()
    
    const subjects = await Promise.all(
      subjectsSnapshot.docs.map(async (doc) => {
        const subjectData = doc.data()
        
        // Fetch related college and program information        
        return {
          id: doc.id,
          ...subjectData,        
          createdAt: subjectData.createdAt?.toDate?.() || subjectData.createdAt,
          updatedAt: subjectData.updatedAt?.toDate?.() || subjectData.updatedAt,
        }
      })
    )

    // Sort by college, then program, then subject name
    subjects.sort((a, b) => {
      return (a as any).name.localeCompare((b as any).name)
    })

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

    const docRef = await adminDb.collection('subjects').add(subjectData)

    return NextResponse.json({
      success: true,
      subjectId: docRef.id,
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
