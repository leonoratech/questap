'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Department } from '@/data/models/department'
import { Program } from '@/data/models/program'
import { Subject } from '@/data/models/subject'
import { getAllDepartments } from '@/data/services/departments-service'
import {
  createProgram,
  deleteProgram,
  getAllPrograms,
  reactivateProgram,
  updateProgram
} from '@/data/services/programs-service'
import { getAllSubjects } from '@/data/services/subjects-service'
import {
  BookOpen,
  Building2,
  Clock,
  Edit,
  Eye,
  EyeOff,
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ProgramManagerProps {
  // No props needed as this is for superadmin  management
}

interface ProgramFormData {
  name: string
  description: string
  departmentId: string
  subjectIds: string[]
  yearsOrSemesters: number
  semesterType: 'years' | 'semesters'
  language: string
  programCode: string
}

const initialFormData: ProgramFormData = {
  name: '',
  description: '',
  departmentId: '',
  subjectIds: [],
  yearsOrSemesters: 4,
  semesterType: 'years',
  language: 'English',
  programCode: ''
}

export function ProgramManager({ }: ProgramManagerProps) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [formData, setFormData] = useState<ProgramFormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    loadPrograms()
    loadDepartments()
    loadSubjects()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [programs, searchTerm, departmentFilter, statusFilter, showInactive])

  const loadPrograms = async () => {
    try {
      setLoading(true)
      const data = await getAllPrograms()
      setPrograms(data)
    } catch (error) {
      console.error('Error loading programs:', error)
      toast.error('Failed to load programs')
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const data = await getAllDepartments()
      setDepartments(data)
    } catch (error) {
      console.error('Error loading departments:', error)
      toast.error('Failed to load departments')
    }
  }

  const loadSubjects = async () => {
    try {
      const data = await getAllSubjects()
      setSubjects(data)
    } catch (error) {
      console.error('Error loading subjects:', error)
      toast.error('Failed to load subjects')
    }
  }

  const applyFilters = () => {
    let filtered = programs

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.department?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.programCode?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(program => program.department?.id === departmentFilter)
    }

    // Apply status filter
    if (!showInactive) {
      filtered = filtered.filter(program => program.isActive)
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(program => program.isActive)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(program => !program.isActive)
    }

    setFilteredPrograms(filtered)
  }

  const handleAddNew = () => {
    setEditingProgram(null)
    setFormData(initialFormData)
    setDialogOpen(true)
  }

  const handleEdit = (program: Program) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      description: program.description || '',
      departmentId: program.department?.id || '',
      subjectIds: program.subjects?.map(s => s.id!).filter(Boolean) || [],
      yearsOrSemesters: program.yearsOrSemesters || 2,
      semesterType: program.semesterType || 'years',
      language: program.language || 'English',
      programCode: program.programCode || ''
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.departmentId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      
      if (editingProgram) {
        // Update existing program
        await updateProgram(editingProgram.id!, {
          ...formData,
          id: String(editingProgram.id)
        })
        toast.success('Program updated successfully')
      } else {
        // Create new program
        await createProgram({
          ...formData
        })
        toast.success('Program created successfully')
      }
      
      setDialogOpen(false)
      await loadPrograms()
    } catch (error) {
      console.error('Error saving program:', error)
      toast.error('Failed to save program')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (program: Program) => {
    if (!confirm(`Are you sure you want to deactivate "${program.name}"?`)) {
      return
    }

    try {
      await deleteProgram(program.id!)
      toast.success('Program deactivated successfully')
      await loadPrograms()
    } catch (error) {
      console.error('Error deleting program:', error)
      toast.error('Failed to deactivate program')
    }
  }

  const handleReactivate = async (program: Program) => {
    if (!confirm(`Are you sure you want to reactivate "${program.name}"?`)) {
      return
    }

    try {
      await reactivateProgram(program.id!)
      toast.success('Program reactivated successfully')
      await loadPrograms()
    } catch (error) {
      console.error('Error reactivating program:', error)
      toast.error('Failed to reactivate program')
    }
  }

  const formatDuration = (yearsOrSemesters: number, type: 'years' | 'semesters') => {
    const unit = type === 'years' ? 'Year' : 'Semester'
    return `${yearsOrSemesters} ${unit}${yearsOrSemesters !== 1 ? 's' : ''}`
  }

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || 'Unknown'
  }

  const getSubjectNames = (subjectIds: string[]) => {
    return subjects.filter(s => subjectIds.includes(s.id!)).map(s => s.name)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          {/* <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Programs Management
              </CardTitle>
              <CardDescription>
                Manage all programs across the platform. Programs can be associated with departments and subjects.
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </div> */}
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search programs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id!}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowInactive(!showInactive)}
                className="flex items-center gap-2"
              >
                {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showInactive ? 'Hide Inactive' : 'Show Inactive'}
              </Button>

              <Button
                variant="outline"
                onClick={loadPrograms}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Program
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredPrograms.length} of {programs.length} programs
              {searchTerm && ` for "${searchTerm}"`}
              {departmentFilter !== 'all' && ` in ${getDepartmentName(departmentFilter)}`}
            </div>
          </div>

          {/* Programs List */}
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {programs.length === 0 
                  ? 'No programs available yet. Add the first program to get started.' 
                  : 'No programs match your current filters.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className={`border-l-4 ${program.isActive ? 'border-l-primary' : 'border-l-muted'}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{program.name}</CardTitle>
                          {program.programCode && (
                            <Badge variant="outline" className="text-xs">
                              {program.programCode}
                            </Badge>
                          )}
                          <Badge variant={program.isActive ? "default" : "secondary"}>
                            {program.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {program.yearsOrSemesters && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(program.yearsOrSemesters, program.semesterType || 'years')}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2 ml-8">
                          {program.description}
                        </CardDescription>
                        
                        {/* Program Details */}
                        <div className="ml-8 mt-3 space-y-2">
                          {program.department && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              <span>Department: {program.department.name}</span>
                            </div>
                          )}
                          
                          {program.subjects && program.subjects.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>Subjects: {program.subjects.map(s => s.name).join(', ')}</span>
                            </div>
                          )}
                          
                          {program.language && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Language: {program.language}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(program)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {program.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(program)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReactivate(program)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Program Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? 'Edit Program' : 'Add New Program'}
            </DialogTitle>
            <DialogDescription>
              {editingProgram 
                ? 'Update the program information and associations'
                : 'Create a new academic program with department and subject associations'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Bachelor of Computer Applications"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="programCode">Program Code</Label>
                <Input
                  id="programCode"
                  placeholder="e.g., BCA"
                  value={formData.programCode}
                  onChange={(e) => setFormData({ ...formData, programCode: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the program, its objectives, and what students will learn..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id!}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  placeholder="e.g., English"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="4"
                  value={formData.yearsOrSemesters}
                  onChange={(e) => setFormData({ ...formData, yearsOrSemesters: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semesterType">Duration Type</Label>
                <Select
                  value={formData.semesterType}
                  onValueChange={(value: 'years' | 'semesters') => setFormData({ ...formData, semesterType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="years">Years</SelectItem>
                    <SelectItem value="semesters">Semesters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Associated Subjects (Optional)</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {subjects.map((subject) => (
                  <label key={subject.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.subjectIds.includes(subject.id!)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            subjectIds: [...formData.subjectIds, subject.id!]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            subjectIds: formData.subjectIds.filter(id => id !== subject.id!)
                          })
                        }
                      }}
                      className="rounded"
                    />
                    <span>{subject.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select subjects that are part of this program curriculum
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : (editingProgram ? 'Update Program' : 'Create Program')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
