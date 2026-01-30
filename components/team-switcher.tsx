"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useBranch, RoleType } from "@/contexts/branch-context";

interface Team {
  id: string;
  name: string;
  logo: React.ElementType;
  plan: string;
}

export function TeamSwitcher({
  teams,
  currentTeamId,
  onTeamChange,
}: {
  teams: Team[];
  currentTeamId: string;
  onTeamChange: (teamId: string) => void;
}) {
  const { isMobile } = useSidebar();
  const { userRole, setUserRole } = useBranch();
  const activeTeam = teams.find((t) => t.id === currentTeamId) || teams[0];

  const roles: { id: RoleType; label: string }[] = [
    { id: "super_admin", label: "Super Admin" },
    { id: "branch_admin", label: "Admin Cabang" },
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Pilih Cabang
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => onTeamChange(team.id)}
                className={`gap-2 p-2 ${
                  team.id === currentTeamId ? "bg-accent" : ""
                }`}
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <team.logo className="size-4 shrink-0" />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Simulasi Role (Dev Only)
            </DropdownMenuLabel>
            {roles.map((role) => (
              <DropdownMenuItem
                key={role.id}
                onClick={() => setUserRole(role.id)}
                className={`gap-2 p-2 ${
                  userRole === role.id ? "bg-accent" : ""
                }`}
              >
                {role.label}
                {userRole === role.id && (
                  <span className="ml-auto text-xs">Aktif</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
