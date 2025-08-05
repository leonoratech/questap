'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/models/user-model'
import {
  createDepartment,
  CreateDepartmentRequest,
  deleteDepartment,
  Department,
  getAllDepartments,
  reactivateDepartment,
  updateDepartment
} from '@/data/services/departments-service'
import {
  BookOpen,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SubjectsPage() {
  const { userProfile } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreateDepartmentRequest>({
    name: '',
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterDepartments()
  }, [departments, searchTerm, statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [departmentsData] = await Promise.all([
        getAllDepartments()
      ])

      setDepartments(departmentsData)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data. Please try again.')
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const filterDepartments = () => {
    let filtered = departments

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(department =>
        department.name.toLowerCase().includes(term) ||
        department.description?.toLowerCase().includes(term)
      )
    }
    // Filter by status
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter(subject => subject.isActive === isActive)
    }

    setFilteredDepartments(filtered)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    })    
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      await createDepartment(formData)
      toast.success('Department created successfully')
      setIsCreateModalOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Error creating department:', error)
      toast.error('Failed to create department')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDepartment || !formData.name.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      await updateDepartment(selectedDepartment.id, formData)
      toast.success('Department updated successfully')
      setIsEditModalOpen(false)
      setSelectedDepartment(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Error updating department:', error)
      toast.error('Failed to update department')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDepartment = async (department: Department) => {
    if (!confirm(`Are you sure you want to deactivate "${department.name}"?`)) {
      return
    }

    try {
      await deleteDepartment(department.id)
      toast.success('Department deactivated successfully')
      loadData()
    } catch (error) {
      console.error('Error deleting department:', error)
      toast.error('Failed to deactivate department')
    }
  }

  const handleReactivateDepartment = async (department: Department) => {
    try {
      await reactivateDepartment(department.id)
      toast.success('Department reactivated successfully')
      loadData()
    } catch (error) {
      console.error('Error reactivating department:', error)
      toast.error('Failed to reactivate department')
    }
  }

  const openEditModal = (department: Department) => {
    setSelectedDepartment(department)
    setFormData({
      name: department.name,
      description: department.description || '',
      isActive: department.isActive
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (department: Department) => {
    setSelectedDepartment(department)
    setIsViewModalOpen(true)
  }

  const openCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  // Loading state
  if (loading) {
    return (
      <AuthGuard requiredRoles={[UserRole.SUPERADMIN]}>
        <AdminLayout>
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-muted rounded animate-pulse" />
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRoles={[UserRole.SUPERADMIN]}>
      <AdminLayout  title="Departments Management">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Departments Management
              </h1>
              <p className="text-muted-foreground">
                Manage all departments across courses
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departments.length}</div>
                <p className="text-xs text-muted-foreground">
                  All Departments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {departments.filter(s => s.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Inactive Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {departments.filter(s => !s.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Deactivated
                </p>
              </CardContent>
            </Card>           
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search departments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Departments ({filteredDepartments.length})
              </CardTitle>
              <CardDescription>
                Manage departments across all colleges and programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDepartments.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No departments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search criteria'
                      : 'No departments have been created yet'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={openCreateModal}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Department
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDepartments.map(department => (
                    <Card key={department.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{department.name}</h4>
                              <Badge variant={department.isActive ? 'default' : 'secondary'}>
                                {department.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>

                            {department.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {department.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViewModal(department)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(department)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {department.isActive ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDepartment(department)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReactivateDepartment(department)}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Department Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Department</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="create-name">Department Name *</Label>
                    <Input
                      id="create-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Science"
                      required
                    />
                  </div>                  
                </div>

                <div>
                  <Label htmlFor="create-description">Description</Label>
                  <Textarea
                    id="create-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the department..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Department'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Subject Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Department</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateDepartment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Department Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Science"
                      required
                    />
                  </div>                  
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the department..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Subject'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* View Subject Modal */}
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Department Details</DialogTitle>
              </DialogHeader>
              {selectedDepartment && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Department Name</Label>
                      <p className="mt-1 text-sm">{selectedDepartment.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge variant={selectedDepartment.isActive ? 'default' : 'secondary'}>
                          {selectedDepartment.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedDepartment.description && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="mt-1 text-sm">{selectedDepartment.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                      <p className="mt-1 text-sm">
                        {selectedDepartment.createdAt ? new Date(selectedDepartment.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                      <p className="mt-1 text-sm">
                        {selectedDepartment.updatedAt ? new Date(selectedDepartment.updatedAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
