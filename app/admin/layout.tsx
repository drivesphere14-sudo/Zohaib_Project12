import { requireAdmin } from "@/lib/auth/requireAdmin"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Separator } from "@/components/ui/separator"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAdmin()
  const profileLabel = profile?.full_name || profile?.id || "Admin"

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Admin:
            </span>

            <span className="text-sm font-semibold text-card-foreground">
              {profileLabel}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}