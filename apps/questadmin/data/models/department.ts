import { BaseEntity } from "./basemodel"

// Subject data model interface for program subjects
export interface Department extends BaseEntity{
  id?: string
  name: string    
  description?: string  
}

export interface CreateDepartmentRequest {
  name: string
  description?: string
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  id: string
}