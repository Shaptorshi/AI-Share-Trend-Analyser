"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Sliders, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const links = [
        { name: "Profile", href: "/dashboard/settings/profile", icon: User },
        { name: "AI Preferences", href: "/dashboard/settings/preferences", icon: Sliders },
        { name: "Account", href: "/dashboard/settings/account", icon: ShieldAlert },
    ];

    return (
        <div className="p-6 m-5 border rounded-2xl bg-background/50 backdrop-blur-xl shadow-sm h-screen overflow-y-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-sm">Manage your profile, account, and AI preferences.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <nav className="flex flex-col space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 max-w-4xl">
                    <Card className="p-6 border-muted/60 bg-card/60 backdrop-blur-sm">
                        {children}
                    </Card>
                </div>
            </div>
        </div>
    );
}
