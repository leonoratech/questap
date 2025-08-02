/**
 * Server-side Subject Repository
 * Handles all Firebase operations for subjects on the server
 */

import { Department } from '@/data/models/department';
import { BaseRepository } from './base-service';

const DEPARTMENT_COLLECTION = 'departments';

export class DepartmentRepository extends BaseRepository<Department> {
    constructor() {
        super(DEPARTMENT_COLLECTION);
    }

    async deactivateDepartment(departmentId: string): Promise<Department> {
        try {
            return await this.update(departmentId, { isActive: false });
        } catch (error) {
            console.error('Error deactivating department:', error);
            throw new Error('Failed to deactivate department');
        }
    }

    async activateDepartment(departmentId: string): Promise<Department> {
        try {
            return await this.update(departmentId, { isActive: true });
        } catch (error) {
            console.error('Error activating department:', error);
            throw new Error('Failed to activate department');
        }
    }
}
