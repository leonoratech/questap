'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'
import { AppMaster } from '@/data/models/app-master'
import { AppMasterService } from '@/data/services/app-master-service'
import {
  Building,
  Edit,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CollegePage() {
  const { userProfile } = useAuth()
  const [college, setCollege] = useState<AppMaster['college'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedCollege, setEditedCollege] = useState<AppMaster['college'] | null>(null)
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = userProfile?.role === UserRole.SUPERADMIN

  useEffect(() => {
    const loadCollege = async () => {
      try {
        setError(null)
        const collegeData = await AppMasterService.getCollege()
        setCollege(collegeData)
        setEditedCollege(collegeData)
      } catch (error) {
        console.error('Error loading college:', error)
        setError('Failed to load college information')
      } finally {
        setLoading(false)
      }
    }

    loadCollege()
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
    setEditedCollege(college)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedCollege(college)
  }

  const handleSave = async () => {
    if (!editedCollege) return

    try {
      setSaving(true)
      await AppMasterService.updateCollege(editedCollege)
      setCollege(editedCollege)
      setIsEditing(false)
      toast.success('College information updated successfully')
    } catch (error) {
      console.error('Error saving college:', error)
      toast.error('Failed to update college information')
    } finally {
      setSaving(false)
    }
  }

  const updateEditedCollege = (field: string, value: string, nested?: string) => {
    if (!editedCollege) return

    setEditedCollege(prev => {
      if (!prev) return null
      
      if (nested) {
        const nestedField = prev[field as keyof AppMaster['college']]
        if (typeof nestedField === 'object' && nestedField !== null) {
          return {
            ...prev,
            [field]: {
              ...nestedField,
              [nested]: value
            }
          }
        }
      } else {
        return {
          ...prev,
          [field]: value
        }
      }
      return prev
    })
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="College Information">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading college information...</p>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <AdminLayout title="College Information">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <p>{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (!college) {
    return (
      <AuthGuard>
        <AdminLayout title="College Information">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No College Information Found</h3>
                <p className="text-muted-foreground">
                  College information has not been configured yet.
                </p>
              </div>
            </CardContent>
          </Card>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title="College Information">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">College Information</h1>
              <p className="text-muted-foreground">View and manage college details</p>
            </div>
            {isSuperAdmin && !isEditing && (
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          {/* College Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">College Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedCollege?.name || ''}
                      onChange={(e) => updateEditedCollege('name', e.target.value)}
                      placeholder="Enter college name"
                    />
                  ) : (
                    <p className="text-sm font-medium">{college.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="affiliation">Affiliation</Label>
                  {isEditing ? (
                    <Input
                      id="affiliation"
                      value={editedCollege?.affiliation || ''}
                      onChange={(e) => updateEditedCollege('affiliation', e.target.value)}
                      placeholder="Enter affiliation"
                    />
                  ) : (
                    <p className="text-sm">{college.affiliation}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accreditation">Accreditation</Label>
                  {isEditing ? (
                    <Input
                      id="accreditation"
                      value={editedCollege?.accreditation || ''}
                      onChange={(e) => updateEditedCollege('accreditation', e.target.value)}
                      placeholder="Enter accreditation"
                    />
                  ) : (
                    <p className="text-sm">{college.accreditation}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="principal">Principal Name</Label>
                  {isEditing ? (
                    <Input
                      id="principal"
                      value={editedCollege?.principalName || ''}
                      onChange={(e) => updateEditedCollege('principalName', e.target.value)}
                      placeholder="Enter principal name"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{college.principalName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={editedCollege?.description || ''}
                      onChange={(e) => updateEditedCollege('description', e.target.value)}
                      placeholder="Enter college description"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{college.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editedCollege?.contact.phone || ''}
                      onChange={(e) => updateEditedCollege('contact', e.target.value, 'phone')}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{college.contact.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedCollege?.contact.email || ''}
                      onChange={(e) => updateEditedCollege('contact', e.target.value, 'email')}
                      placeholder="Enter email address"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{college.contact.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      type="url"
                      value={editedCollege?.website || ''}
                      onChange={(e) => updateEditedCollege('website', e.target.value)}
                      placeholder="Enter website URL"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={college.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {college.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    {isEditing ? (
                      <Input
                        id="street"
                        value={editedCollege?.address.street || ''}
                        onChange={(e) => updateEditedCollege('address', e.target.value, 'street')}
                        placeholder="Enter street address"
                      />
                    ) : (
                      <p className="text-sm">{college.address.street}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        value={editedCollege?.address.city || ''}
                        onChange={(e) => updateEditedCollege('address', e.target.value, 'city')}
                        placeholder="Enter city"
                      />
                    ) : (
                      <p className="text-sm">{college.address.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    {isEditing ? (
                      <Input
                        id="state"
                        value={editedCollege?.address.state || ''}
                        onChange={(e) => updateEditedCollege('address', e.target.value, 'state')}
                        placeholder="Enter state"
                      />
                    ) : (
                      <p className="text-sm">{college.address.state}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    {isEditing ? (
                      <Input
                        id="country"
                        value={editedCollege?.address.country || ''}
                        onChange={(e) => updateEditedCollege('address', e.target.value, 'country')}
                        placeholder="Enter country"
                      />
                    ) : (
                      <p className="text-sm">{college.address.country}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    {isEditing ? (
                      <Input
                        id="postalCode"
                        value={editedCollege?.address.postalCode || ''}
                        onChange={(e) => updateEditedCollege('address', e.target.value, 'postalCode')}
                        placeholder="Enter postal code"
                      />
                    ) : (
                      <p className="text-sm">{college.address.postalCode}</p>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p>{college.address.street}</p>
                        <p>{college.address.city}, {college.address.state} {college.address.postalCode}</p>
                        <p>{college.address.country}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
