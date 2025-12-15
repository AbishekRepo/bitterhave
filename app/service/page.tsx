"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarContent } from "../components/feature/ServiceSidebar";
import ServicesList from "../components/feature/ServicesList";

export default function ServicePage() {
  const [currentView, setCurrentView] = useState("services");

  const renderContent = () => {
    switch (currentView) {
      case "services":
        return <ServicesList />;
      case "usage":
        return (
          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Usage</h1>
            <p className="text-muted-foreground">
              Your usage statistics will appear here.
            </p>
          </div>
        );
      case "billing":
        return (
          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Billing</h1>
            <p className="text-muted-foreground">
              Manage your billing and payment methods here.
            </p>
          </div>
        );
      default:
        return <ServicesList />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r bg-sidebar border-sidebar-border shrink-0">
        <SidebarContent
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center border-b px-4 md:hidden bg-sidebar text-sidebar-foreground">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] p-0 bg-sidebar border-r-sidebar-border text-sidebar-foreground [&>button]:hidden"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SidebarContent
                isSheet
                currentView={currentView}
                setCurrentView={setCurrentView}
              />
            </SheetContent>
          </Sheet>
          <div className="ml-4 font-bold text-lg">bitterhave Service</div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
