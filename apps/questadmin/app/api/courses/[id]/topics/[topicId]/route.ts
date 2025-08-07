import { adminDb, timestamp } from '@/data/repository/firebase-admin';
import { UpdateTopicSchema, validateRequestBody } from '@/data/validation/validation-schemas';
import { requireCourseAccess } from '@/lib/server-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  try {
    const { id: courseId, topicId } = await params
    
    // Require course access for updating topics
    const authResult = await requireCourseAccess(courseId)(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    // Validate request body
    const requestBody = await request.json()
    const validation = validateRequestBody(UpdateTopicSchema, requestBody)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const updateData = validation.data
    
    // Validate that the topic exists and belongs to the course
    const topicRef = adminDb.collection('courseTopics').doc(topicId)
    const topicDoc = await topicRef.get()
    
    if (!topicDoc.exists) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }
    
    const topicData = topicDoc.data()
    if (!topicData || topicData.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Topic does not belong to this course' },
        { status: 403 }
      )
    }
    
    const updatedTopic = {
      ...updateData,
      updatedAt: timestamp()
    }
    
    await topicRef.update(updatedTopic)
    
    return NextResponse.json({
      success: true,
      topic: {
        id: topicId,
        ...topicData,
        ...updatedTopic
      },
      message: 'Topic updated successfully'
    })
    
  } catch (error: any) {
    console.error('Update topic error:', error)
    
    // Provide more detailed error information
    if (error?.code === 'permission-denied') {
      console.error('Permission denied error details:', {
        errorCode: error.code,
        errorMessage: error.message,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasCredentials: !!process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY
      })
      return NextResponse.json(
        { error: 'Permission denied. Please check Firebase configuration and credentials.' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred updating the topic' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  try {
    const { id: courseId, topicId } = await params
    
    // Require course access for deleting topics
    const authResult = await requireCourseAccess(courseId)(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }
    
    // Validate that the topic exists and belongs to the course
    const topicRef = adminDb.collection('courseTopics').doc(topicId)
    const topicDoc = await topicRef.get()
    
    if (!topicDoc.exists) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }
    
    const topicData = topicDoc.data()
    if (!topicData || topicData.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Topic does not belong to this course' },
        { status: 403 }
      )
    }
    
    await topicRef.delete()
    
    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully'
    })
    
  } catch (error: any) {
    console.error('Delete topic error:', error)
    
    // Provide more detailed error information
    if (error?.code === 'permission-denied') {
      console.error('Permission denied error details:', {
        errorCode: error.code,
        errorMessage: error.message,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasCredentials: !!process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY
      })
      return NextResponse.json(
        { error: 'Permission denied. Please check Firebase configuration and credentials.' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred deleting the topic' },
      { status: 500 }
    )
  }
}
