import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/shared/components/ui/sidebar'
import { mainNavItems, propertyNavGroup, contentNavGroup } from '@/shared/config/nav'

function isPathActive(pathname, href) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function isPropertyGroupActive(pathname) {
  return propertyNavGroup.items.some((item) => isPathActive(pathname, item.href))
}

function isContentGroupActive(pathname) {
  return contentNavGroup.items.some((item) => isPathActive(pathname, item.href))
}

export default function AppSidebar() {
  const { pathname } = useLocation()
  const propertyOpen = isPropertyGroupActive(pathname)
  const contentOpen = isContentGroupActive(pathname)

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-forest shadow-sm">
                  <span className="font-heading text-sm font-bold text-white">R</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold font-heading text-brand-forest">
                    RareNest
                  </span>
                  <span className="truncate text-[10px] font-medium uppercase tracking-wider text-brand-terracotta">
                    Admin Console
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const active = isPathActive(pathname, item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={active ? 'bg-brand-forest text-white hover:bg-brand-forest-mid hover:text-white font-medium' : ''}
                    >
                      <Link to={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Property
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={propertyOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={propertyNavGroup.title}
                      isActive={propertyOpen}
                      className={propertyOpen ? 'text-brand-forest font-medium' : ''}
                    >
                      <propertyNavGroup.icon />
                      <span>{propertyNavGroup.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {propertyNavGroup.items.map((item) => {
                        const Icon = item.icon
                        const active = isPathActive(pathname, item.href)
                        return (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={active}
                              className={active ? 'text-brand-forest font-medium' : ''}
                            >
                              <Link to={item.href}>
                                <Icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Content
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={contentOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={contentNavGroup.title}
                      isActive={contentOpen}
                      className={contentOpen ? 'text-brand-forest font-medium' : ''}
                    >
                      <contentNavGroup.icon />
                      <span>{contentNavGroup.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {contentNavGroup.items.map((item) => {
                        const Icon = item.icon
                        const active = isPathActive(pathname, item.href)
                        return (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={active}
                              className={active ? 'text-brand-forest font-medium' : ''}
                            >
                              <Link to={item.href}>
                                <Icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border pt-2">
        <p className="px-2 py-1 text-[10px] text-muted-foreground/50 group-data-[collapsible=icon]:hidden">
          v1.0 · RareNest Admin
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
