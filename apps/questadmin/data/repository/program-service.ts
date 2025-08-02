/**
 * Server-side Program Repository
 * Handles all Firebase operations for programs on the server
 */

import { Program } from '@/data/models/program';
import { BaseRepository } from './base-service';

const PROGRAM_COLLECTION = 'programs';

export class ProgramRepository extends BaseRepository<Program> {
    constructor() {
        super(PROGRAM_COLLECTION);
    }

    async deactivateProgram(programId: string): Promise<Program> {
        try {
            return await this.update(programId, { isActive: false });
        } catch (error) {
            console.error('Error deactivating program:', error);
            throw new Error('Failed to deactivate program');
        }
    }

    async activateProgram(programId: string): Promise<Program> {
        try {
            return await this.update(programId, { isActive: true });
        } catch (error) {
            console.error('Error activating program:', error);
            throw new Error('Failed to activate program');
        }
    }
}
