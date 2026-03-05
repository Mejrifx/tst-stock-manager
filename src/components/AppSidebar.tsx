import {
  LayoutDashboard,
  Package,
  Gauge,
  ShoppingCart,
  Activity,
  Settings,
  Box,
  LogOut,
  User as UserIcon,
  FileText,
  Zap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "eBay Listings", url: "/caps", icon: Gauge },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Activity", url: "/activity", icon: Activity },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Box className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && (
            <span className="font-semibold text-sidebar-accent-foreground tracking-tight">
              eBay Manager
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <div className="mb-2 px-2">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="h-4 w-4 text-sidebar-foreground/50 shrink-0" />
              <span className="text-xs text-sidebar-foreground/70 truncate">
                {user?.email}
              </span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
