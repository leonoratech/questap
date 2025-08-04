'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { Department } from '@/data/models/department'
import { UserRole } from '@/data/models/user-model'
import {
  formatRoleName,
  formatSkillsFromString,
  formatSkillsToString,
  getAvailableDepartments,
  getRoleBadgeClass,
  getUserInitials,
  updateUserProfile as updateProfile,
  validateProfileData
} from '@/data/services/user-profile-service'
import { formatDate } from '@/lib/date-utils'
import { AlertCircle, Camera, GraduationCap, Save, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const { user, userProfile, hasRole, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.INSTRUCTOR,
    departmentId: '',
    departmentName: '',
    bio: '',
    description: '',
    // Instructor fields
    coreTeachingSkills: '',
    additionalTeachingSkills: '',
    // Student fields
    mainSubjects: '',
    class: ''
  })

  // Initialize form data when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        role: userProfile.role || UserRole.INSTRUCTOR,
        departmentId: userProfile.departmentId || '',
        departmentName: userProfile.departmentName || userProfile.department || '',
        bio: userProfile.bio || '',
        description: userProfile.description || '',
        coreTeachingSkills: formatSkillsToString(userProfile.coreTeachingSkills || []),
        additionalTeachingSkills: formatSkillsToString(userProfile.additionalTeachingSkills || []),
        mainSubjects: formatSkillsToString(userProfile.mainSubjects || []),
        class: userProfile.class || ''
      })
    }
  }, [userProfile])

  // Load departments on component mount
  useEffect(() => {
    const loadDepartments = async () => {
      setLoadingDepartments(true)
      try {
        const availableDepartments = await getAvailableDepartments()
        setDepartments(availableDepartments)
      } catch (error) {
        console.error('Failed to load departments:', error)
        // Don't show error to user for departments, as it's not critical
      } finally {
        setLoadingDepartments(false)
      }
    }

    loadDepartments()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userProfile) return

    setLoading(true)
    setMessage(null)
    setValidationErrors([])

    try {
      // Find selected department
      const selectedDepartment = departments.find(dept => dept.id === formData.departmentId)

      const updates = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        departmentId: formData.departmentId || undefined,
        departmentName: selectedDepartment?.name || formData.departmentName || undefined,
        bio: formData.bio,
        description: formData.description,
        profileCompleted: true
      } as any

      // Add role-specific fields
      if (userProfile.role === UserRole.INSTRUCTOR) {
        updates.coreTeachingSkills = formatSkillsFromString(formData.coreTeachingSkills)
        updates.additionalTeachingSkills = formatSkillsFromString(formData.additionalTeachingSkills)
      }

      if (userProfile.role === UserRole.STUDENT) {
        updates.mainSubjects = formatSkillsFromString(formData.mainSubjects)
        updates.class = formData.class
      }

      // Validate data before submission
      const validation = validateProfileData(updates, userProfile.role)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        setMessage({ type: 'error', text: 'Please fix the validation errors below' })
        return
      }

      const updatedProfile = await updateProfile(updates)
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      await refreshProfile()
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const handleDepartmentChange = (departmentId: string) => {
    if (departmentId === "none") {
      setFormData(prev => ({ 
        ...prev, 
        departmentId: '',
        departmentName: ''
      }))
    } else {
      const selectedDepartment = departments.find(dept => dept.id === departmentId)
      setFormData(prev => ({ 
        ...prev, 
        departmentId,
        departmentName: selectedDepartment?.name || ''
      }))
    }
    // Clear validation errors when user makes selection
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return getUserInitials(firstName, lastName)
  }

  const getRoleBadgeColor = (role: UserRole) => {
    return getRoleBadgeClass(role)
  }

  if (!userProfile) {
    return (
      <AuthGuard>
        <AdminLayout title="Profile">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground ml-2">Loading profile...</p>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title="Profile">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Please fix the following errors:</span>
              </div>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Picture Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Update your profile photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userProfile.profilePicture} />
                      <AvatarFallback className="text-lg">
                        {getInitials(userProfile.firstName, userProfile.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                  <Badge className={getRoleBadgeColor(userProfile.role)}>
                    {formatRoleName(userProfile.role)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal and professional information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground">
                        Email cannot be changed directly. Contact support for assistance.
                      </p>
                    </div>

                    {/* Role Display (Read-only) */}
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(userProfile.role)}`}>
                        {formatRoleName(userProfile.role)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      {loadingDepartments ? (
                        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">Loading departments...</span>
                        </div>
                      ) : departments.length > 0 ? (
                        <Select value={formData.departmentId || "none"} onValueChange={handleDepartmentChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No department selected</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id || 'none'}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="department"
                          value={formData.departmentName}
                          onChange={(e) => handleInputChange('departmentName', e.target.value)}
                          placeholder="Enter your department (e.g., Computer Science, Mathematics)"
                        />
                      )}
                      <p className="text-sm text-muted-foreground">
                        {departments.length > 0 
                          ? "Select your department from the list" 
                          : "Enter your department name manually"
                        }
                      </p>
                    </div>

                    {/* Role-specific sections */}
                    {userProfile.role === UserRole.INSTRUCTOR && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Instructor Information</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="coreTeachingSkills">Core Teaching Skills</Label>
                          <Input
                            id="coreTeachingSkills"
                            value={formData.coreTeachingSkills}
                            onChange={(e) => handleInputChange('coreTeachingSkills', e.target.value)}
                            placeholder="e.g., Mathematics, Physics, Chemistry (comma separated)"
                          />
                          <p className="text-sm text-muted-foreground">
                            List your primary subjects or skills you teach (separate with commas)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="additionalTeachingSkills">Additional Teaching Skills</Label>
                          <Input
                            id="additionalTeachingSkills"
                            value={formData.additionalTeachingSkills}
                            onChange={(e) => handleInputChange('additionalTeachingSkills', e.target.value)}
                            placeholder="e.g., Research, Mentoring, Curriculum Development (comma separated)"
                          />
                          <p className="text-sm text-muted-foreground">
                            Additional skills or areas of expertise (separate with commas)
                          </p>
                        </div>
                      </div>
                    )}

                    {userProfile.role === UserRole.STUDENT && (
                      <div className="space-y-4 p-4 border rounded-lg bg-green-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold text-green-900">Student Information</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="mainSubjects">Main Subjects</Label>
                          <Input
                            id="mainSubjects"
                            value={formData.mainSubjects}
                            onChange={(e) => handleInputChange('mainSubjects', e.target.value)}
                            placeholder="e.g., Computer Science, Engineering, Mathematics (comma separated)"
                          />
                          <p className="text-sm text-muted-foreground">
                            List your main subjects of study (separate with commas)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="class">Class/Year</Label>
                          <Input
                            id="class"
                            value={formData.class}
                            onChange={(e) => handleInputChange('class', e.target.value)}
                            placeholder="e.g., Sophomore, Final Year, Class 12"
                          />
                          <p className="text-sm text-muted-foreground">
                            Your current class, year, or academic level
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Description and Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={
                          userProfile.role === UserRole.INSTRUCTOR
                            ? "Tell students about your teaching philosophy, experience, and what makes your courses special..."
                            : userProfile.role === UserRole.STUDENT
                            ? "Tell us about your academic interests, goals, and what you hope to learn..."
                            : "Tell us about yourself..."
                        }
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio (Legacy)</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Short bio or summary"
                        rows={2}
                      />
                      <p className="text-sm text-muted-foreground">
                        This field is kept for legacy purposes. Use Description field above instead.
                      </p>
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Account Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Current account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <Badge className={getRoleBadgeColor(userProfile.role)}>
                    {formatRoleName(userProfile.role)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium">{formatDate(userProfile.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Profile Status</p>
                  <Badge variant={userProfile.profileCompleted ? 'default' : 'secondary'}>
                    {userProfile.profileCompleted ? 'Completed' : 'Incomplete'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Account Status</p>
                  <Badge variant={userProfile.isActive ? 'default' : 'destructive'}>
                    {userProfile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}