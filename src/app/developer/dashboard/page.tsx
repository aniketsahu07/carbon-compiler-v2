
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, CheckCircle, Landmark, Eye, Globe, Tag, ShieldCheck, Calendar, Award, Leaf } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Project } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from '@/components/ui/separator';
import { ProjectDetailModal } from '@/components/developer/project-detail-modal';


const statusVariantMapping: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    Verified: "default",
    'Under Validation': "secondary",
    Rejected: "destructive",
};

export default function DeveloperDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const projectsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'projects'), where('developerId', '==', user.uid));
    }, [user, firestore]);

    const { data: developerProjects, isLoading: isProjectsLoading } = useCollection<Project>(projectsQuery);
    
    const isLoading = isUserLoading || isProjectsLoading;

    const stats = useMemo(() => {
        if (!developerProjects) {
            return {
                totalProjects: 0,
                creditsIssued: 0,
                projectsApproved: 0,
            };
        }
        return {
            totalProjects: developerProjects.length,
            creditsIssued: developerProjects.reduce((acc, p) => acc + (p.status === 'Verified' ? p.availableTons : 0), 0),
            projectsApproved: developerProjects.filter(p => p.status === 'Verified').length,
        }
    }, [developerProjects]);

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Projects
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{stats.totalProjects}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Credits Issued
                        </CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{stats.creditsIssued.toLocaleString()}</div>}
                         <p className="text-xs text-muted-foreground">
                            tCO₂e
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Projects Approved
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{stats.projectsApproved}</div>}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>My Projects Overview</CardTitle>
                     <CardDescription>A summary of your registered carbon offset projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Name</TableHead>
                                <TableHead>Sector</TableHead>
                                <TableHead>Vintage</TableHead>
                                <TableHead className="text-right">Credits (tCO₂e)</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="h-6 w-28 mx-auto" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : developerProjects && developerProjects.length > 0 ? (
                                developerProjects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-medium">{project.name}</TableCell>
                                        <TableCell>
                                             <Badge variant="outline">{project.projectType}</Badge>
                                        </TableCell>
                                        <TableCell>{project.vintageYear}</TableCell>
                                        <TableCell className="text-right">{project.availableTons.toLocaleString()}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={statusVariantMapping[project.status] || 'outline'}>
                                                {project.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="outline" size="sm" onClick={() => setSelectedProject(project)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                                        You have not registered any projects yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <ProjectDetailModal 
                isOpen={!!selectedProject} 
                project={selectedProject} 
                onClose={() => setSelectedProject(null)} 
            />
        </div>
    );
}
