import * as admin from 'firebase-admin';
import { BaseEntity } from './basemodel';

export interface CollegeAdministrator extends BaseEntity {
    assignedAt: admin.firestore.Timestamp | Date;
    assignedBy: string;
    collegeId: string;
    instructorEmail: string;
    instructorId: string;
    instructorName: string;
    isActive: boolean;
    role: string;   
}
