'use client'

import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { ProgramManager } from '@/components/ProgramManager'
import { UserRole } from '@/data/models/user-model'
import { GraduationCap } from 'lucide-react'

export default function GlobalProgramsPage() {
  return (
    <AuthGuard requiredRoles={[UserRole.SUPERADMIN]}>
      <AdminLayout  title="Group Management">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              {/* <div className="flex items-center gap-2 mb-2">
                <Link href="/" passHref>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div> */}
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Groups Management
              </h1>
              <p className="text-muted-foreground">
                Manage all academic groups across the platform. Create, edit, and organize groups with their associated departments and subjects.
              </p>
            </div>
          </div>

          {/* Program Manager Component */}
          <ProgramManager />
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
