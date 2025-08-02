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
    createSubject,
    CreateSubjectRequest,
    deleteSubject,
    getAllSubjects,
    reactivateSubject,
    Subject,
    updateSubject
} from '@/data/services/subjects-service'
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
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreateSubjectRequest>({
    name: '',
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterSubjects()
  }, [subjects, searchTerm, statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [subjectsData] = await Promise.all([
        getAllSubjects()
      ])
      
      setSubjects(subjectsData)      
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data. Please try again.')
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const filterSubjects = () => {
    let filtered = subjects

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(subject =>
        subject.name.toLowerCase().includes(term) ||
        subject.description?.toLowerCase().includes(term)  
      )
    }
    // Filter by status
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter(subject => subject.isActive === isActive)
    }

    setFilteredSubjects(filtered)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    })    
  }

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      await createSubject(formData)
      toast.success('Subject created successfully')
      setIsCreateModalOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Error creating subject:', error)
      toast.error('Failed to create subject')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSubject || !formData.name.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      await updateSubject(selectedSubject.id, formData)
      toast.success('Subject updated successfully')
      setIsEditModalOpen(false)
      setSelectedSubject(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Error updating subject:', error)
      toast.error('Failed to update subject')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSubject = async (subject: Subject) => {
    if (!confirm(`Are you sure you want to deactivate "${subject.name}"?`)) {
      return
    }

    try {
      await deleteSubject(subject.id)
      toast.success('Subject deactivated successfully')
      loadData()
    } catch (error) {
      console.error('Error deleting subject:', error)
      toast.error('Failed to deactivate subject')
    }
  }

  const handleReactivateSubject = async (subject: Subject) => {
    try {
      await reactivateSubject(subject.id)
      toast.success('Subject reactivated successfully')
      loadData()
    } catch (error) {
      console.error('Error reactivating subject:', error)
      toast.error('Failed to reactivate subject')
    }
  }

  const openEditModal = (subject: Subject) => {
    setSelectedSubject(subject)
    setFormData({
      name: subject.name,
      description: subject.description || '',
      isActive: subject.isActive
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (subject: Subject) => {
    setSelectedSubject(subject)
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
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Subjects Management
              </h1>
              <p className="text-muted-foreground">
                Manage all subjects across courses
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
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
                <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subjects.length}</div>
                <p className="text-xs text-muted-foreground">
                  All subjects
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {subjects.filter(s => s.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Inactive Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {subjects.filter(s => !s.isActive).length}
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
                      placeholder="Search subjects..."
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
                Subjects ({filteredSubjects.length})
              </CardTitle>
              <CardDescription>
                Manage subjects across all colleges and programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSubjects.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No subjects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search criteria'
                      : 'No subjects have been created yet'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={openCreateModal}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Subject
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubjects.map(subject => (
                    <Card key={subject.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{subject.name}</h4>
                              <Badge variant={subject.isActive ? 'default' : 'secondary'}>
                                {subject.isActive ? 'Active' : 'Inactive'}
                              </Badge>                             
                            </div>
                            
                            {subject.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {subject.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViewModal(subject)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(subject)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {subject.isActive ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSubject(subject)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReactivateSubject(subject)}
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

          {/* Create Subject Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Subject</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="create-name">Subject Name *</Label>
                    <Input
                      id="create-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Advanced Mathematics"
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
                    placeholder="Brief description of the subject..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Subject'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Subject Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Subject</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateSubject} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Subject Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Advanced Mathematics"
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
                    placeholder="Brief description of the subject..."
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
                <DialogTitle>Subject Details</DialogTitle>
              </DialogHeader>
              {selectedSubject && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Subject Name</Label>
                      <p className="mt-1 text-sm">{selectedSubject.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge variant={selectedSubject.isActive ? 'default' : 'secondary'}>
                          {selectedSubject.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedSubject.description && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="mt-1 text-sm">{selectedSubject.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                      <p className="mt-1 text-sm">
                        {selectedSubject.createdAt ? new Date(selectedSubject.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                      <p className="mt-1 text-sm">
                        {selectedSubject.updatedAt ? new Date(selectedSubject.updatedAt).toLocaleDateString() : 'Unknown'}
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
