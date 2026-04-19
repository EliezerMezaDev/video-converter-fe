"use client"

import * as React from "react"
import {
  Video, Music2, ImageIcon
} from "lucide-react"

import Link from "next/link"
import Image from "next/image"

import { NavMain } from "@components/sidebar/nav-main"
import { NavUser } from "@components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@shadcn/components/ui/sidebar"
import { cn } from "../../shadcn/lib/utils"

// This is sample data.
const data = {
  user: {
    name: "Verona Ruiz",
    email: "ministro@gmail.com",
    avatar: "https://images.unsplash.com/photo-1611915387288-fd8d2f5f928b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdhdG98ZW58MHwyfDB8fHww",
  },
  navMain: [
    {
      title: "Video",
      icon: Video,
      items: [
        {
          title: "Convertidor de video",
          url: "/d/converter",
        },

      ],
    },
    {
      title: "Audio",
      icon: Music2,
      items: [
        {
          title: "Búsqueda de música",
          url: "/d/music",
        },

      ],
    },
    {
      title: "Media",
      icon: ImageIcon,
      items: [
        {
          title: "Búsqueda de media",
          url: "/d/media",
        },
      ],
    },

  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, state } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/" title="WEB Tools" className={cn("inline-flex items-center justify-center gap-2", state !== 'collapsed' ? "p-2 pb-0" : "p-0 mt-2")}>
          <Image src="/images/brand/isotipo.png" alt="WEB Tools Logo" title="WEB Tools Logo" width={24} height={24} />
          {state !== 'collapsed' && <span className="w-full font-bold whitespace-nowrap">WEB Tools</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
