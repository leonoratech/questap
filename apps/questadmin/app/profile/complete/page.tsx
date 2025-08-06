'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
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
    formatSkillsFromString,
    getAvailableDepartments,
    updateUserProfile as updateProfile,
    validateProfileData
} from '@/data/services/user-profile-service'
import { GraduationCap, Save, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function ProfileCompletePage() {
  const { user, userProfile, refreshProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    departmentId: '',
    departmentName: '',
    phone: '',
    districtName: '',
    description: '',
    // Instructor fields
    coreTeachingSkills: '',
    additionalTeachingSkills: '',
    // Student fields
    mainSubjects: '',
    class: ''
  })

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

  // Redirect if profile is already completed or if user has essential profile data
  useEffect(() => {
    if (userProfile) {
      // If explicitly marked as completed, redirect
      if (userProfile.profileCompleted === true) {
        router.push('/my-courses')
        return
      }
      
      // For existing users who might not have the profileCompleted field (undefined),
      // check if they have essential profile information that suggests completion
      // Only redirect if profileCompleted is undefined AND they have essential info
      if (userProfile.profileCompleted === undefined) {
        const hasEssentialInfo = userProfile.firstName && 
                                userProfile.lastName && 
                                userProfile.role
        
        if (hasEssentialInfo) {
          // This is likely an existing user, redirect them to courses
          router.push('/my-courses')
          return
        }
      }
      
      // If profileCompleted is explicitly false, stay on this page to complete profile
      // This handles new users who need to complete their profile
    }
  }, [userProfile, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userProfile) return

    setLoading(true)

    try {
      // Find selected department
      const selectedDepartment = departments.find(dept => dept.id === formData.departmentId)

      const updates = {
        departmentId: formData.departmentId || undefined,
        departmentName: selectedDepartment?.name || formData.departmentName || undefined,
        phone: formData.phone.trim() || undefined,
        districtName: formData.districtName.trim() || undefined,
        description: formData.description.trim(),
        profileCompleted: true
      } as any

      // Add role-specific fields
      if (userProfile.role === UserRole.INSTRUCTOR) {
        updates.coreTeachingSkills = formatSkillsFromString(formData.coreTeachingSkills)
        updates.additionalTeachingSkills = formatSkillsFromString(formData.additionalTeachingSkills)
      } else if (userProfile.role === UserRole.STUDENT) {
        updates.mainSubjects = formatSkillsFromString(formData.mainSubjects)
        updates.class = formData.class.trim()
      }

      // Validate data
      const validation = validateProfileData(updates, userProfile.role)
      if (!validation.isValid) {
        toast.error('Please fix the validation errors: ' + validation.errors.join(', '))
        return
      }

      const updatedProfile = await updateProfile(updates)
      
      toast.success('Profile completed successfully!')
      await refreshProfile()
      router.push('/my-courses')
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
  }

  if (!userProfile && !authLoading) {
    // If we have no user profile and we're not loading, something went wrong
    // Redirect back to login
    router.push('/login')
    return null
  }

  if (!userProfile) {
    return (
      <AuthGuard>
        <AdminLayout title="Complete Profile">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title="Complete Your Profile">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {userProfile.role === UserRole.INSTRUCTOR ? (
                <User className="h-8 w-8 text-primary" />
              ) : (
                <GraduationCap className="h-8 w-8 text-primary" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
              Help us personalize your experience by completing your profile information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {userProfile.role === UserRole.INSTRUCTOR ? (
                  <>
                    <User className="h-5 w-5" />
                    Instructor Information
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-5 w-5" />
                    Student Information
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {userProfile.role === UserRole.INSTRUCTOR
                  ? "Tell us about your teaching background and expertise"
                  : "Tell us about your academic background and interests"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Department Selection */}
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
                        <SelectValue placeholder="Select your department" />
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

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                    <p className="text-sm text-muted-foreground">
                      Optional: Your contact number
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="districtName">District</Label>
                    <Input
                      id="districtName"
                      value={formData.districtName}
                      onChange={(e) => handleInputChange('districtName', e.target.value)}
                      placeholder="Enter your district"
                    />
                    <p className="text-sm text-muted-foreground">
                      Optional: Your district or region
                    </p>
                  </div>
                </div>

                {/* Role-specific Fields */}
                {userProfile.role === UserRole.INSTRUCTOR && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="coreTeachingSkills">Core Teaching Skills</Label>
                      <Input
                        id="coreTeachingSkills"
                        value={formData.coreTeachingSkills}
                        onChange={(e) => handleInputChange('coreTeachingSkills', e.target.value)}
                        placeholder="e.g., Mathematics, Physics, Chemistry (comma separated)"
                        required
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
                  </>
                )}

                {userProfile.role === UserRole.STUDENT && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="mainSubjects">Main Subjects</Label>
                      <Input
                        id="mainSubjects"
                        value={formData.mainSubjects}
                        onChange={(e) => handleInputChange('mainSubjects', e.target.value)}
                        placeholder="e.g., Computer Science, Engineering, Mathematics (comma separated)"
                        required
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
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Your current class, year, or academic level
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {userProfile.role === UserRole.INSTRUCTOR 
                      ? "Brief Description About Yourself" 
                      : "Brief Description About Yourself"
                    }
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={
                      userProfile.role === UserRole.INSTRUCTOR
                        ? "Tell students about your teaching philosophy, experience, and what makes your courses special..."
                        : "Tell us about your academic interests, goals, and what you hope to learn..."
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Completing Profile...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Complete Profile
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.push('/my-courses')}
                    disabled={loading}
                  >
                    Skip for Now
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
