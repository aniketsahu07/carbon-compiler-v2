
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Landmark, ShieldCheck, TrendingUp, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Project } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

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
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Credits Issued
                        </CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isVerifiedLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{totalCreditsIssued.toLocaleString()}</div>}
                        <p className="text-xs text-muted-foreground">
                            from all verified projects
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Credits Traded (24h)
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12,350</div>
                        <p className="text-xs text-muted-foreground">
                            tCO₂e (Static)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Credits Retired
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">450,120</div>
                         <p className="text-xs text-muted-foreground">
                            tCO₂e (Static)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Projects Pending Approval
                        </CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isPendingLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{projectsUnderValidation?.length ?? 0}</div>}
                        <p className="text-xs text-muted-foreground">
                            Require review
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Compliance Alerts</CardTitle>
                    <CardDescription>Projects that require administrative review and validation.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : projectsUnderValidation && projectsUnderValidation.length > 0 ? (
                        <ul className="space-y-4">
                            {projectsUnderValidation.map((project) => (
                                <li key={project.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                        <div>
                                            <p className="font-semibold">{project.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Developer ID: {project.developerId.slice(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{project.status}</Badge>
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={`/admin/review/${project.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Review
                                            </Link>
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-muted-foreground py-16">
                            <p>There are no compliance alerts at this time.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    