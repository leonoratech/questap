import { getAuthHeaders } from '@/data/config/firebase-auth';
import { AppMaster } from '@/data/models/app-master';

/**
 * Service for managing AppMaster data
 * Handles client-side API calls for application-level configuration
 */
export class AppMasterService {
  private static readonly API_BASE = '/api/app-master';

  /**
   * Get the full appMaster configuration
   */
  static async getAppMaster(): Promise<AppMaster> {
    const response = await fetch(this.API_BASE, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch appMaster configuration');
    }

    return response.json();
  }

  /**
   * Get just the college information
   */
  static async getCollege(): Promise<AppMaster['college']> {
    const appMaster = await this.getAppMaster();
    return appMaster.college;
  }

  /**
   * Update college information (superadmin only)
   */
  static async updateCollege(collegeData: Partial<AppMaster['college']>): Promise<AppMaster> {
    const response = await fetch(this.API_BASE, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ college: collegeData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update college information');
    }

    return response.json();
  }
}
