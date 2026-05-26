"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function PreferencesPage() {
    const [defaultHorizon, setDefaultHorizon] = useState("7d");
    const [riskTolerance, setRiskTolerance] = useState("Moderate");
    const [favoriteSector, setFavoriteSector] = useState("Tech");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function fetchPrefs() {
            try {
                const res = await fetch("/api/user/preferences");
                if (res.ok) {
                    const data = await res.json();
                    if (data.defaultHorizon) setDefaultHorizon(data.defaultHorizon);
                    if (data.riskTolerance) setRiskTolerance(data.riskTolerance);
                    if (data.favoriteSector) setFavoriteSector(data.favoriteSector);
                }
            } catch (e) {
                console.error("Failed to load preferences");
            } finally {
                setFetching(false);
            }
        }
        fetchPrefs();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ defaultHorizon, riskTolerance, favoriteSector }),
            });
            if (res.ok) {
                setMessage("AI Preferences updated successfully.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium">AI Preferences</h2>
                <p className="text-sm text-muted-foreground">Tailor the AI predictions and market summaries to your trading style.</p>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6 max-w-md">
                <div className="space-y-3">
                    <Label>Default Prediction Horizon</Label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={defaultHorizon}
                        onChange={(e) => setDefaultHorizon(e.target.value)}
                    >
                        <option value="1d">1 Day (Day Trading)</option>
                        <option value="7d">7 Days (Swing Trading)</option>
                        <option value="30d">30 Days (Short-term Investing)</option>
                    </select>
                </div>
                
                <div className="space-y-3">
                    <Label>Risk Tolerance</Label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={riskTolerance}
                        onChange={(e) => setRiskTolerance(e.target.value)}
                    >
                        <option value="Conservative">Conservative (Lower risk, steady growth)</option>
                        <option value="Moderate">Moderate (Balanced risk/reward)</option>
                        <option value="Aggressive">Aggressive (High risk, high reward)</option>
                    </select>
                </div>

                <div className="space-y-3">
                    <Label>Favorite Market Sector</Label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={favoriteSector}
                        onChange={(e) => setFavoriteSector(e.target.value)}
                    >
                        <option value="Tech">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Energy">Energy</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="General">General Market</option>
                    </select>
                </div>

                {message && <p className="text-sm text-green-500">{message}</p>}

                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save AI Preferences
                </Button>
            </form>
        </div>
    );
}
