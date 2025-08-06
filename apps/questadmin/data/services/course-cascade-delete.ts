import { adminDb } from '../repository/firebase-admin'

/**
 * Comprehensive course deletion service that removes all related data
 */
export async function deleteCourseWithCascade(courseId: string): Promise<{
  success: boolean
  error?: string
  deletedItems?: {
    course: boolean
    topics: number
    questions: number    
  }
}> {
  try {
    const deletedItems = {
      course: false,
      topics: 0,
      questions: 0
    }

    // Use batched writes for consistency
    const batch = adminDb.batch()

    // 1. Check if course exists
    const courseRef = adminDb.collection('courses').doc(courseId)
    const courseSnap = await courseRef.get()
    
    if (!courseSnap.exists) {
      return {
        success: false,
        error: 'Course not found'
      }
    }

    // 2. Delete all course topics
    try {
      const topicsQuery = adminDb.collection('courseTopics').where('courseId', '==', courseId)
      const topicsSnapshot = await topicsQuery.get()
      
      topicsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
        deletedItems.topics++
      })
    } catch (error) {
      console.error('Error deleting course topics:', error)
    }

    // 3. Delete all course questions and their answers
    try {
      const questionsQuery = adminDb.collection('courseQuestions').where('courseId', '==', courseId)
      const questionsSnapshot = await questionsQuery.get()
      
      questionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
        deletedItems.questions++
      })

      // Delete question answers if they exist in a separate collection
      const answersQuery = adminDb.collection('question_answers').where('courseId', '==', courseId)
      const answersSnapshot = await answersQuery.get()
      
      answersSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
    } catch (error) {
      console.error('Error deleting course questions:', error)
    }

    
    // 6. Delete any course materials
    try {
      const materialsQuery = adminDb.collection('course_materials').where('courseId', '==', courseId)
      const materialsSnapshot = await materialsQuery.get()
      
      materialsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
    } catch (error) {
      console.error('Error deleting course materials:', error)
    }

    // 7. Delete any course progress records
    try {
      const progressQuery = adminDb.collection('student_progress').where('courseId', '==', courseId)
      const progressSnapshot = await progressQuery.get()
      
      progressSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
    } catch (error) {
      console.error('Error deleting course progress:', error)
    }

    // 8. Finally, delete the course itself
    batch.delete(courseRef)
    deletedItems.course = true

    // Commit all deletions
    await batch.commit()

    return {
      success: true,
      deletedItems
    }

  } catch (error) {
    console.error('Error in cascading course deletion:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get a count of all related items that would be deleted
 */
export async function getCourseRelatedItemsCounts(courseId: string): Promise<{
  topics: number
  questions: number
  materials: number
  progressRecords: number
}> {
  const counts = {
    topics: 0,
    questions: 0,
    materials: 0,
    progressRecords: 0
  }

  try {
    // Count topics
    const topicsQuery = adminDb.collection('courseTopics').where('courseId', '==', courseId)
    const topicsSnapshot = await topicsQuery.get()
    counts.topics = topicsSnapshot.size

    // Count questions
    const questionsQuery = adminDb.collection('courseQuestions').where('courseId', '==', courseId)
    const questionsSnapshot = await questionsQuery.get()
    counts.questions = questionsSnapshot.size

    // Count materials
    const materialsQuery = adminDb.collection('course_materials').where('courseId', '==', courseId)
    const materialsSnapshot = await materialsQuery.get()
    counts.materials = materialsSnapshot.size

    // Count progress records
    const progressQuery = adminDb.collection('student_progress').where('courseId', '==', courseId)
    const progressSnapshot = await progressQuery.get()
    counts.progressRecords = progressSnapshot.size

  } catch (error) {
    console.error('Error counting related items:', error)
  }

  return counts
}
