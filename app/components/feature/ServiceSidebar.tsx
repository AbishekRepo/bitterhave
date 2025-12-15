"use client";

import React from "react";
// import Link from "next/link";
import {
    LayoutGrid,
    BarChart2,
    CreditCard,
    LogOut,
    ChevronLeft
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface SidebarContentProps {
    className?: string;
    isSheet?: boolean;
    currentView: string;
    setCurrentView: (view: string) => void;
}

export const SidebarContent = ({ className, isSheet = false, currentView, setCurrentView }: SidebarContentProps) => {
    const { profile, logout, checkAuth, user } = useAuthStore();

    React.useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const menuItems = [
        { id: "services", label: "Services", icon: LayoutGrid },
        { id: "usage", label: "Usage", icon: BarChart2 },
        { id: "billing", label: "Billing", icon: CreditCard },
    ];

    return (
        <div className={cn("flex h-full flex-col text-sidebar-foreground", className)}>
            {/* Site Name / Header */}
            <div className="flex h-16 items-center px-6">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <LayoutGrid className="h-5 w-5" />
                    </div>
                    <span>bitterhave</span>
                </div>
                {isSheet && (
                    <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </SheetClose>
                )}
            </div>

            <div className="flex-1 overflow-auto py-4">
                {/* User Profile */}
                <div className="px-4 mb-8">
                    <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-3 hover:bg-sidebar-accent/80 transition-colors cursor-pointer group">
                        <Avatar className="h-10 w-10 border border-sidebar-border">
                            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.fullName || "User"} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {profile?.fullName?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-semibold">
                                {profile?.fullName || "User Name"}
                            </span>
                            <span className="truncate text-xs text-muted-foreground group-hover:text-sidebar-foreground/80">
                                {profile?.email || user?.email || "user@example.com"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1 px-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setCurrentView(item.id);
                            }}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:translate-x-1",
                                currentView === item.id
                                    ? "bg-white text-black shadow-sm font-semibold"
                                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", currentView === item.id ? "text-black" : "text-muted-foreground group-hover:text-foreground")} />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Footer / Logout */}
            <div className="p-4 mt-auto">
                <Separator className="mb-4 bg-sidebar-border" />
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 hover:bg-red-500/10 hover:text-red-500"
                    onClick={() => logout()}
                >
                    <LogOut className="h-5 w-5" />
                    Log Out
                </Button>
            </div>
        </div>
    );
};
