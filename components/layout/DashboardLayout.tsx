import { Sidebar, MobileNav } from "@/components/layout/Sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "vendor" | "creator"
  userName?: string
  userEmail?: string
}

export function DashboardLayout({ children, role, userName, userEmail }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <Sidebar role={role} userName={userName} userEmail={userEmail} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile nav */}
        <MobileNav role={role} userName={userName} />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
