"use client";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarFooter } from "@shadcn/components/ui/sidebar";
import { ScrollArea } from "@shadcn/components/ui/scroll-area";
import { NavItem, NavMain } from "@components/nav-main";
import { Home, Video, HelpCircle, Music2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@shadcn/components/ui/button";

export const navData: NavItem[] = [
  { title: "Inicio", icon: Home, href: "/d/" },
  {
    title: "Video",
    icon: Video,
    children: [
      { title: "Convertidor de video", href: "/d/converter" },
    ],
  },
  {
    title: "Música",
    icon: Music2,
    children: [
      { title: "Búsqueda de música", href: "/d/music" },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const handleTour = () => {
    let steps: any[] = [];
    if (pathname.includes("/d/converter")) {
      steps = [
        { element: '#converter-module-header', popover: { title: 'Módulo Convertidor', description: 'Aquí puedes convertir tus videos de formato MOV a un formato optimizado.', side: "bottom", align: 'start' } },
        { element: '#converter-dropzone-card', popover: { title: 'Área de Subida', description: 'Arrastra y suelta tus archivos aquí, o haz clic para seleccionarlos.', side: "top", align: 'center' } }
      ];
    } else if (pathname.includes("/d/music")) {
      steps = [
        { element: '#music-page-header', popover: { title: 'Búsqueda de Música', description: 'Encuentra música libre de derechos de autor desde Pixabay.', side: "bottom", align: 'start' } },
        { element: '#music-search-input', popover: { title: 'Barra de búsqueda', description: 'Escribe un término o usa los filtros y pulsa Buscar.', side: "bottom", align: 'center' } },
      ];
    } else {
      steps = [
        {
          popover: {
            title: 'Bienvenido',
            description: 'Selecciona una herramienta del menú lateral para comenzar.',
          }
        }
      ];
    }

    const driverObj = driver({
      showProgress: true,
      steps: steps,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      popoverClass: 'driverjs-theme',
    });

    driverObj.drive();
  };

  return (
    <Sidebar className="px-0 h-full **:data-[slot=sidebar-inner]:h-full">
      <div className="flex flex-col gap-2">
        {/* ---------------- Header ---------------- */}
        <SidebarHeader className="px-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/" className="w-full h-full">
                WEB-UTILS
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ---------------- Content ---------------- */}
        <SidebarContent className="overflow-hidden">
          <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="px-4">
              <NavMain items={navData} />
            </div>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <Button variant="outline" className="w-full flex gap-2 justify-start" onClick={handleTour}>
            <HelpCircle className="size-4" />
            <span>Tutorial de la página</span>
          </Button>
        </SidebarFooter>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .driverjs-theme .driver-popover-title { color: hsl(var(--primary)); }
        .driverjs-theme .driver-popover-next-btn { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); text-shadow: none; border-color: hsl(var(--primary)); }
        .driverjs-theme .driver-popover-next-btn:hover { background-color: hsl(var(--primary)/.9); }
        .driverjs-theme .driver-popover-prev-btn, .driverjs-theme .driver-popover-close-btn { color: hsl(var(--foreground)); }
      `}} />
    </Sidebar>
  );
}
