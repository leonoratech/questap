import { BaseEntity } from "./basemodel"

// Subject data model interface for program subjects
export interface Subject extends BaseEntity{
  id?: string
  name: string    
  description?: string  
}

export interface CreateSubjectRequest {
  name: string
  description?: string  
}

export interface UpdateSubjectRequest extends Partial<CreateSubjectRequest> {
  id: string
}