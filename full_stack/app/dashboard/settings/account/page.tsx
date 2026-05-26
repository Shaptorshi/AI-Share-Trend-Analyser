"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AccountPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-red-500">Danger Zone</h2>
                <p className="text-sm text-muted-foreground">Manage critical account actions.</p>
            </div>
            
            <div className="space-y-6 max-w-md border border-red-500/20 bg-red-500/5 p-4 rounded-lg">
                <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Sign Out</h3>
                    <p className="text-sm text-muted-foreground">Log out of your account on this device.</p>
                    <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })} className="mt-2">
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                </div>
                
                <div className="border-t border-red-500/10 pt-4 space-y-2">
                    <h3 className="font-semibold text-red-500">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">Permanently remove your account and all associated data. This action cannot be undone.</p>
                    <Button variant="destructive" onClick={() => alert("Account deletion not implemented yet.")} className="mt-2">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                    </Button>
                </div>
            </div>
        </div>
    );
}
