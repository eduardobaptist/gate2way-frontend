import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* UX Gate2Way: permite rolagem dentro da tabela sem alargar a página. */}
      <main className="w-full min-w-0 flex-1">
        <Outlet />
      </main>
    </SidebarProvider>
  );
};
