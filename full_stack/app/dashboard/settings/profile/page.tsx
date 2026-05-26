"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ProfileSettingsPage() {
    const { data: session, update } = useSession();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setEmail(session.user.email || "");
        }
    }, [session]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage(data.message);
            // Optionally force next-auth to update its local session:
            await update({ name: data.user.name, email: data.user.email });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium">Profile Details</h2>
                <p className="text-sm text-muted-foreground">Update your personal information.</p>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
                <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                {message && <p className="text-sm text-green-500">{message}</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </div>
    );
}
