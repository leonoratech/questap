/**
 * Server-side Subject Repository
 * Handles all Firebase operations for subjects on the server
 */

import { Subject } from '@/data/models/subject';
import { BaseRepository } from './base-service';

const SUBJECT_COLLECTION = 'subjects';

export class SubjectRepository extends BaseRepository<Subject> {
    constructor() {
        super(SUBJECT_COLLECTION);
    }
        
    async deactivateSubject(subjectId: string): Promise<Subject> {
        try {
            return await this.update(subjectId, { isActive: false });
        } catch (error) {
            console.error('Error deactivating subject:', error);
            throw new Error('Failed to deactivate subject');
        }
    }

    async activateSubject(subjectId: string): Promise<Subject> {
        try {
            return await this.update(subjectId, { isActive: true });
        } catch (error) {
            console.error('Error activating subject:', error);
            throw new Error('Failed to activate subject');
        }
    }
}
