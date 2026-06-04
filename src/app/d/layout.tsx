import { AppSidebar } from "@/src/shared/components/sidebar/app-sidebar";
import { DashboardBreadcrumbs } from "@/src/shared/components/ux/breadcrumbs";
import { ThemeToggle } from "@/src/shared/components/sidebar/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/src/shared/shadcn/components/ui/sidebar";
import { JsonLd, constructJsonLd } from "@/src/shared/lib/seo/json-ld";
import { Separator } from "@/src/shared/shadcn/components/ui/separator";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full">
        <AppSidebar />

        <div className="w-full h-full flex flex-col overflow-hidden">
          <header className="flex items-center gap-2 px-4 h-12 border-b border-border shrink-0">
            <SidebarTrigger className="cursor-pointer text-muted-foreground hover:text-foreground -ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <DashboardBreadcrumbs />
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>

          <main className="w-full h-full overflow-auto">
            <JsonLd schemas={constructJsonLd("dashboard")} />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}