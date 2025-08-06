// filepath: /home/solmon/github/questedu/lib/user-profile-service.ts
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase-config';

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  description?: string;
  
  // Contact Information
  phone?: string;
  districtName?: string;
  
  // Department Information
  departmentId?: string;
  departmentName?: string;
  
  // Student-specific fields
  programId?: string;
  mainSubjects?: string[];
  
  // Legacy fields for backward compatibility
  department?: string; // Deprecated: use departmentName
  collegeId?: string;
  college?: string; // For backward compatibility
  
  // Profile completion status
  profileCompleted?: boolean;
}

export class UserProfileService {
  private db = getFirestoreDb();

  /**
   * Update user profile in Firestore
   */
  async updateProfile(userId: string, updates: UpdateProfileData): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(this.db, 'users', userId);
      
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Update display name if firstName or lastName changed
      if (updates.firstName || updates.lastName) {
        // We'll need to get current data for this, but for now let's construct it
        const displayName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
        if (displayName) {
          updateData.displayName = displayName;
        }
      }

      await updateDoc(userRef, updateData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update profile' 
      };
    }
  }
}

export const userProfileService = new UserProfileService();
