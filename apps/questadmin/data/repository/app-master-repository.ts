import { AppMaster } from '@/data/models/app-master';
import { adminDb } from '@/data/repository/firebase-admin';

/**
 * Repository for managing AppMaster data
 * Contains application-level configuration including college information
 */
export class AppMasterRepository {
  private static readonly COLLECTION_NAME = 'appMaster';
  private static readonly COLLEGE_DOC_ID = 'college';

  /**
   * Get the college information from appMaster collection
   */
  static async getCollege(): Promise<AppMaster['college'] | null> {
    try {
      const docRef = adminDb.collection(this.COLLECTION_NAME).doc(this.COLLEGE_DOC_ID);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        console.warn('AppMaster college document not found');
        return null;
      }
      
      const data = doc.data() as { college: AppMaster['college'] };
      return data.college || null;
    } catch (error) {
      console.error('Error fetching college from appMaster:', error);
      throw error;
    }
  }

  /**
   * Get the full appMaster document
   */
  static async getAppMaster(): Promise<AppMaster | null> {
    try {
      const docRef = adminDb.collection(this.COLLECTION_NAME).doc(this.COLLEGE_DOC_ID);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        console.warn('AppMaster document not found');
        return null;
      }
      
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: data?.updatedAt?.toDate() || new Date(),
      } as AppMaster;
    } catch (error) {
      console.error('Error fetching appMaster:', error);
      throw error;
    }
  }

  /**
   * Update college information in appMaster
   */
  static async updateCollege(collegeData: Partial<AppMaster['college']>): Promise<void> {
    try {
      const docRef = adminDb.collection(this.COLLECTION_NAME).doc(this.COLLEGE_DOC_ID);
      
      await docRef.update({
        college: collegeData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating college in appMaster:', error);
      throw error;
    }
  }
}
