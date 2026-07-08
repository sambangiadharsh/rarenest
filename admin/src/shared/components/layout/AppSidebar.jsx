import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import logo from '@/assets/Logo.png'
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
import { mainNavItems, builderNavGroup, propertyNavGroup, contentNavGroup } from '@/shared/config/nav'

function isPathActive(pathname, href) {
  if (href === '/') return pathname === '/'
  // Use exact match to avoid parent and child both appearing active
  return pathname === href
}

function isBuilderGroupActive(pathname) {
  return builderNavGroup.items.some((item) => isPathActive(pathname, item.href))
}

function isPropertyGroupActive(pathname) {
  return propertyNavGroup.items.some((item) => isPathActive(pathname, item.href))
}

function isContentGroupActive(pathname) {
  return contentNavGroup.items.some((item) => isPathActive(pathname, item.href))
}

export default function AppSidebar() {
  const { pathname } = useLocation()
  const builderOpen = isBuilderGroupActive(pathname)
  const propertyOpen = isPropertyGroupActive(pathname)
  const contentOpen = isContentGroupActive(pathname)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-white/10 bg-[#492615] p-0">
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className="h-24 p-0 hover:bg-transparent active:bg-transparent"
      >
        <Link
          to="/"
          className="flex items-center justify-start w-full pl-4"
        >
          <img
            src={logo}
            alt="RareNest"
            className="block h-25 w-auto object-contain"
          />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarHeader>

      <SidebarContent className="bg-[#492615] py-2">
        <SidebarGroup className="first:border-t-0 first:pt-0 border-t border-white/5 pt-2">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
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
                      className={
                        active
                          ? 'relative bg-brand-sage/20 text-white font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-full before:bg-brand-sage'
                          : 'text-white/70 hover:bg-white/5 hover:text-white transition-colors duration-150'
                      }
                    >
                      <Link to={item.href}>
                        <span
                          className={
                            active
                              ? 'flex size-6 items-center justify-center rounded-md bg-brand-sage/25 text-brand-sage'
                              : 'flex size-6 items-center justify-center rounded-md'
                          }
                        >
                          <Icon className="size-4" />
                        </span>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border-t border-white/5 pt-2">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Builders
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={builderOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={builderNavGroup.title}
                      isActive={builderOpen}
                      className={
                        builderOpen
                          ? 'bg-brand-sage/10 text-white font-medium hover:bg-brand-sage/15'
                          : 'text-white/70 hover:bg-white/5 hover:text-white transition-colors duration-150'
                      }
                    >
                      <span className="flex size-6 items-center justify-center rounded-md">
                        <builderNavGroup.icon className="size-4" />
                      </span>
                      <span>{builderNavGroup.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {builderNavGroup.items.map((item) => {
                        const Icon = item.icon
                        const active = isPathActive(pathname, item.href)
                        return (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={active}
                              className={
                                active
                                  ? 'bg-brand-sage/20 text-white font-medium'
                                  : 'text-white/60 hover:translate-x-0.5 hover:bg-white/5 hover:text-white transition-all duration-150'
                              }
                            >
                              <Link to={item.href}>
                                <Icon className="size-4" />
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

        <SidebarGroup className="border-t border-white/5 pt-2">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
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
                      className={
                        propertyOpen
                          ? 'bg-brand-sage/10 text-white font-medium hover:bg-brand-sage/15'
                          : 'text-white/70 hover:bg-white/5 hover:text-white transition-colors duration-150'
                      }
                    >
                      <span className="flex size-6 items-center justify-center rounded-md">
                        <propertyNavGroup.icon className="size-4" />
                      </span>
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
                              className={
                                active
                                  ? 'bg-brand-sage/20 text-white font-medium'
                                  : 'text-white/60 hover:translate-x-0.5 hover:bg-white/5 hover:text-white transition-all duration-150'
                              }
                            >
                              <Link to={item.href}>
                                <Icon className="size-4" />
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

        <SidebarGroup className="border-t border-white/5 pt-2">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
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
                      className={
                        contentOpen
                          ? 'bg-brand-sage/10 text-white font-medium hover:bg-brand-sage/15'
                          : 'text-white/70 hover:bg-white/5 hover:text-white transition-colors duration-150'
                      }
                    >
                      <span className="flex size-6 items-center justify-center rounded-md">
                        <contentNavGroup.icon className="size-4" />
                      </span>
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
                              className={
                                active
                                  ? 'bg-brand-sage/20 text-white font-medium'
                                  : 'text-white/60 hover:translate-x-0.5 hover:bg-white/5 hover:text-white transition-all duration-150'
                              }
                            >
                              <Link to={item.href}>
                                <Icon className="size-4" />
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

      <SidebarFooter className="border-t border-white/10 bg-[#492615] pt-2">
        <p className="px-2 py-1 text-[10px] text-white/40 group-data-[collapsible=icon]:hidden">
          v1.0 · RareNest Admin
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}