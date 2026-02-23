'use client';

import { useMemo } from 'react';
import { Wallet, Leaf, CheckCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { PortfolioItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function BuyerDashboardPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const { creditBalance, portfolio, claimFromPortfolio, isPortfolioLoading, totalOffset, isClaimHistoryLoading } = useCart();

    const handleClaim = async (itemToClaim: PortfolioItem) => {
        if (!itemToClaim.id || !user) return;
        
        try {
            await claimFromPortfolio(itemToClaim.id, {
                creditId: itemToClaim.creditId,
                projectName: itemToClaim.name,
                tons: itemToClaim.tons,
                claimDate: new Date().toISOString(),
                certificateId: `cert-${user.uid.slice(0,4)}-${itemToClaim.id.slice(0,4)}`
            });

            toast({
                title: "Credits Claimed!",
                description: `You have successfully claimed ${itemToClaim.tons.toLocaleString()} tCO₂e from ${itemToClaim.name}.`,
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Claim Failed",
                description: `Could not claim credits. Please try again.`,
            });
            console.error("Failed to claim credits:", error);
        }
    };

    // Portfolio analytics: group by project name
    const portfolioChartData = useMemo(() => {
        const grouped = portfolio.reduce((acc, item) => {
            const key = item.name || 'Unknown';
            const existing = acc.find(d => d.name === key);
            if (existing) {
                existing.value += item.tons;
            } else {
                acc.push({ name: key, value: item.tons });
            }
            return acc;
        }, [] as { name: string; value: number }[]);
        return grouped.sort((a, b) => b.value - a.value).slice(0, 7);
    }, [portfolio]);

    const isLoading = isPortfolioLoading || isClaimHistoryLoading;

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1 animate-slide-up">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Wallet className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">My Dashboard</h1>
                </div>
                <p className="text-sm text-muted-foreground ml-10">Manage and claim your carbon credit portfolio.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-5 shadow-card card-hover animate-slide-up delay-75">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Credit Balance</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    {isLoading ? <Skeleton className="h-8 w-32 mb-1" /> : <div className="text-2xl font-bold tabular-nums">{creditBalance.toLocaleString()}</div>}
                    <p className="text-xs text-muted-foreground mt-1">tCO₂e available to claim</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card card-hover animate-slide-up delay-150">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total CO₂ Offset</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Leaf className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    {isLoading ? <Skeleton className="h-8 w-32 mb-1" /> : <div className="text-2xl font-bold tabular-nums">{totalOffset.toLocaleString()}</div>}
                    <p className="text-xs text-muted-foreground mt-1">tCO₂e claimed historically</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card card-hover animate-slide-up delay-225">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Portfolio Projects</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <BarChart3 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                    </div>
                    {isLoading ? <Skeleton className="h-8 w-32 mb-1" /> : <div className="text-2xl font-bold tabular-nums">{portfolio.length}</div>}
                    <p className="text-xs text-muted-foreground mt-1">active credit holdings</p>
                </div>
            </div>

            {/* Portfolio Analytics */}
            {!isLoading && portfolioChartData.length > 0 && (
                <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden animate-slide-up delay-225">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div>
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                Portfolio Analytics
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Visual breakdown of your carbon credit holdings by project.</p>
                        </div>
                    </div>
                    <div className="p-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={portfolioChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                                    {portfolioChartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} tCO₂e`, 'Credits']} />
                                <Legend formatter={(value) => value.length > 25 ? value.slice(0, 25) + '…' : value} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden animate-slide-up delay-300">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                        <h2 className="text-sm font-semibold">My Purchased Credits</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Claim credits to permanently offset your emissions.</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-5 space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : portfolio.length > 0 ? (
                        <table className="w-full text-sm data-table">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 text-left">Project</th>
                                    <th className="px-5 py-3 text-left">Vintage</th>
                                    <th className="px-5 py-3 text-right">Amount (tCO₂e)</th>
                                    <th className="px-5 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio.filter(item => item.name).map(item => (
                                    <tr key={item.id}>
                                        <td className="px-5 py-3 font-medium">{item.name}</td>
                                        <td className="px-5 py-3 text-muted-foreground">{item.vintageYear}</td>
                                        <td className="px-5 py-3 text-right font-semibold tabular-nums">{item.tons.toLocaleString()}</td>
                                        <td className="px-5 py-3 text-center">
                                            <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => handleClaim(item)} disabled={!item.id}>
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Claim Credits
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                            <Leaf className="h-8 w-8 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No credits purchased yet.</p>
                            <p className="text-xs text-muted-foreground">Visit the marketplace to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
