import { AppSidebar } from "@/src/shared/components/sidebar/app-sidebar"
import { DashboardBreadcrumbs } from "@/src/shared/components/ux/breadcrumbs"
import { SidebarProvider, SidebarTrigger } from "@/src/shared/shadcn/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <SidebarProvider>
    <div className="flex h-dvh w-full">
      <AppSidebar />

      <div className="p-4 w-full h-full flex flex-col gap-2">
        <header className="flex items-center">
          <SidebarTrigger className="cursor-pointer" />
          <DashboardBreadcrumbs />
        </header>

        <main className="w-full h-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
}