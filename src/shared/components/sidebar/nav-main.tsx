"use client"

import * as React from "react"
import { Home, ChevronRight, type LucideIcon } from "lucide-react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from "@shadcn/lib/utils"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@shadcn/components/ui/sidebar"

type NavItem = { title: string; url: string }
type NavGroup = { title: string; icon?: LucideIcon; items: NavItem[] }

function NavGroupItem({ group }: { group: NavGroup }) {
  const pathname = usePathname()
  const isGroupActive = group.items.some(item => pathname.startsWith(item.url))
  const [open, setOpen] = React.useState(isGroupActive)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={group.title}
        onClick={() => setOpen(prev => !prev)}
        isActive={isGroupActive}
      >
        {group.icon && <group.icon />}
        <span>{group.title}</span>
        <ChevronRight
          className={cn(
            "ml-auto transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </SidebarMenuButton>
      {open && (
        <SidebarMenuSub>
          {group.items.map(item => (
            <SidebarMenuSubItem key={item.url}>
              <SidebarMenuSubButton
                isActive={pathname.startsWith(item.url)}
                render={<Link href={item.url} title={item.title} />}
              >
                <span>{item.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Inicio"
            isActive={pathname === '/d/' || pathname === '/d'}
            render={<Link href="/d/" title="Inicio" />}
          >
            <Home />
            <span>Inicio</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarGroupLabel className="mt-2">Herramientas</SidebarGroupLabel>

      <SidebarMenu>
        {groups.map(group => (
          <NavGroupItem key={group.title} group={group} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
