'use client'

import { AdminDashboard } from '@/components/AdminDashboard'
import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'

import { SuperAdminDashboard } from '@/components/SuperAdminDashboard'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/data/config/firebase-auth'

export default function Home() {
  const { userProfile } = useAuth()

  return (
    <AuthGuard>
      <AdminLayout title="Dashboard">
        {userProfile?.role === UserRole.STUDENT ? (
          <div className="text-center text-2xl font-bold">
            You do not have access to the admin dashboard. TODO
          </div>
        ) : userProfile?.role === UserRole.SUPERADMIN ? (
          <SuperAdminDashboard />
        ) : (
          <AdminDashboard />
        )}
      </AdminLayout>
    </AuthGuard>
  )
}
