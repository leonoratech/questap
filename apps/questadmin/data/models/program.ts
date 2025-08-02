import { BaseEntity } from './basemodel'
import { Department } from './department'
import { Subject } from './subject'

// Program data model interface
export interface Program extends BaseEntity {
  id?: string
  name: string
  yearsOrSemesters: number
  semesterType: 'years' | 'semesters'
  description: string
  department: Department
  subjects?: Subject[] // List of subject IDs associated with the program
  language?: string // Primary language of instruction
  programCode?: string // Program code/identifier
}

export interface CreateProgramRequest {
  name: string
  yearsOrSemesters: number
  semesterType: 'years' | 'semesters'
  description: string  
  department?: Department
  subjects?: Subject[] // List of subject IDs to associate with the program
  language?: string
  programCode?: string  
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  id: string
  isActive?: boolean
}

export interface ProgramStats {
  totalPrograms: number
  activePrograms: number
  inactivePrograms: number  
}
