
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Project } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

export default function AdminProjectsPage() {
    const firestore = useFirestore();
    
    const approvedProjectsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'projects'), where('status', '==', 'Verified'));
    }, [firestore]);

    const pendingProjectsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'projects'), where('status', '==', 'Under Validation'));
    }, [firestore]);

    const { data: approvedProjects, isLoading: isApprovedLoading } = useCollection<Project>(approvedProjectsQuery);
    const { data: pendingProjects, isLoading: isPendingLoading } = useCollection<Project>(pendingProjectsQuery);

    return (
        <div className="container mx-auto">
            <Tabs defaultValue="pending">
                <CardHeader className="px-0">
                    <CardTitle>Manage Projects</CardTitle>
                    <CardDescription>Review pending projects and view all approved projects on the exchange.</CardDescription>
                    <TabsList className="grid w-full grid-cols-2 mt-4 max-w-md">
                        <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                        <TabsTrigger value="approved">Approved Projects</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <TabsContent value="pending">
                    <Card>
                        <CardHeader>
                            <CardTitle>Projects Pending Review</CardTitle>
                            <CardDescription>These projects have been submitted by developers and require validation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead>Developer ID</TableHead>
                                        <TableHead>Vintage</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isPendingLoading ? (
                                        Array.from({ length: 2 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : pendingProjects && pendingProjects.length > 0 ? (
                                        pendingProjects.map((project) => (
                                             <TableRow key={project.id}>
                                                <TableCell className="font-medium">{project.name}</TableCell>
                                                <TableCell className="font-mono text-xs">{project.developerId.slice(0,12)}...</TableCell>
                                                <TableCell>{project.vintageYear}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/admin/review/${project.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Review
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                                                There are no projects pending approval.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="approved">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approved Projects</CardTitle>
                            <CardDescription>A list of all projects that have been successfully verified and approved.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead>Developer ID</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>Vintage</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isApprovedLoading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : approvedProjects && approvedProjects.length > 0 ? (
                                        approvedProjects.map((project) => (
                                             <TableRow key={project.id}>
                                                <TableCell className="font-medium">{project.name}</TableCell>
                                                <TableCell className="font-mono text-xs">{project.developerId.slice(0,12)}...</TableCell>
                                                <TableCell>{project.country}</TableCell>
                                                <TableCell>{project.vintageYear}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="default">{project.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                                                No projects have been approved yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
