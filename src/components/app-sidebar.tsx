import { LayoutGrid, Settings, Tv } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export type AppPage = "remote" | "apps" | "settings"

const NAV: { page: AppPage; title: string; icon: typeof Tv }[] = [
  { page: "remote", title: "Remote", icon: Tv },
  { page: "apps", title: "Apps", icon: LayoutGrid },
  { page: "settings", title: "Settings", icon: Settings },
]

export function AppSidebar({
  page,
  onNavigate,
}: {
  page: AppPage
  onNavigate: (page: AppPage) => void
}) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" isActive={false}>
              <Tv data-icon="inline-start" />
              <span className="font-semibold">Bravia Remote</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Control</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.filter((item) => item.page !== "settings").map((item) => (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton
                    isActive={page === item.page}
                    onClick={() => onNavigate(item.page)}
                  >
                    <item.icon data-icon="inline-start" />
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={page === "settings"}
                  onClick={() => onNavigate("settings")}
                >
                  <Settings data-icon="inline-start" />
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
