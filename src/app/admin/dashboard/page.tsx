
'use client';

import { Badge } from '@/components/ui/badge';
import { Landmark, ShieldCheck, TrendingUp, CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

export default function AdminDashboardPage() {
    
    const firestore = useFirestore();

    const pendingProjectsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'projects'), where('status', '==', 'Under Validation'));
    }, [firestore]);
    
    const verifiedProjectsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'projects'), where('status', '==', 'Verified'));
    }, [firestore]);

    const { data: projectsUnderValidation, isLoading: isPendingLoading } = useCollection<Project>(pendingProjectsQuery);
    const { data: verifiedProjects, isLoading: isVerifiedLoading } = useCollection<Project>(verifiedProjectsQuery);

    const totalCreditsIssued = useMemo(() => {
        if (!verifiedProjects) return 0;
        return verifiedProjects.reduce((acc, project) => acc + project.availableTons, 0);
    }, [verifiedProjects]);
    
    const isLoading = isPendingLoading || isVerifiedLoading;

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1 animate-slide-up">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Landmark className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Registry Dashboard</h1>
                </div>
                <p className="text-sm text-muted-foreground ml-10">Overview of all carbon credit issuances, trades, and validations.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-card card-hover animate-slide-up delay-75">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Credits Issued</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <Landmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    {isVerifiedLoading ? <Skeleton className="h-8 w-32 mb-1" /> : <div className="text-2xl font-bold tabular-nums">{totalCreditsIssued.toLocaleString()}</div>}
                    <p className="text-xs text-muted-foreground mt-1">from all verified projects</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card card-hover animate-slide-up delay-150">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Traded (24h)</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold tabular-nums">+12,350</div>
                    <p className="text-xs text-muted-foreground mt-1">tCO₂e (indicative)</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card card-hover animate-slide-up delay-225">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Credits Retired</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold tabular-nums">450,120</div>
                    <p className="text-xs text-muted-foreground mt-1">tCO₂e (indicative)</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-card card-hover animate-slide-up delay-300">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pending Approval</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                            <ShieldCheck className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    {isPendingLoading ? <Skeleton className="h-8 w-12 mb-1" /> : <div className="text-2xl font-bold tabular-nums">{projectsUnderValidation?.length ?? 0}</div>}
                    <p className="text-xs text-muted-foreground mt-1">require review</p>
                </div>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden animate-slide-up delay-150">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                        <h2 className="text-sm font-semibold">Compliance Alerts</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Projects requiring administrative review and validation.</p>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                </div>
                <div className="p-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    ) : projectsUnderValidation && projectsUnderValidation.length > 0 ? (
                        <ul className="space-y-2">
                            {projectsUnderValidation.map((project) => (
                                <li key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 shrink-0">
                                            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{project.name}</p>
                                            <p className="text-xs text-muted-foreground">Developer: {project.developerId.slice(0, 8)}…</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant="secondary" className="text-[10px]">{project.status}</Badge>
                                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                                            <Link href={`/admin/review/${project.id}`}>
                                                <Eye className="h-3 w-3" />
                                                Review
                                            </Link>
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                            <CheckCircle className="h-8 w-8 text-emerald-500/40" />
                            <p className="text-sm text-muted-foreground">No compliance alerts. All clear!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

    