"use client";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@shadcn/components/ui/sidebar";
import { ScrollArea } from "@shadcn/components/ui/scroll-area";
import { NavItem, NavMain } from "@components/nav-main";
import { Home, Video,  } from "lucide-react";
import Link from "next/link";

export const navData: NavItem[] = [
  { title: "Inicio", icon: Home, href: "/d/" },
  {
    title: "Video",
    icon: Video,
    children: [
      { title: "Convertidor de video", href: "/d/converter" },
    ],
  },

];

export function AppSidebar() {
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
      </div>
    </Sidebar>
  );
}
