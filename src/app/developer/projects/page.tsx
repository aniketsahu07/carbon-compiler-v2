
'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Info, PlusCircle, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Project } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectActionModal } from '@/components/developer/project-action-modal';

const statusVariantMapping: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    Verified: "default",
    'Under Validation': "secondary",
    Rejected: "destructive",
}

const statusDescriptions: { [key: string]: string } = {
    Verified: "This project has been successfully audited and approved by the registry.",
    'Under Validation': "Your project has been submitted and is currently being reviewed for quality, compliance, and impact. This involves AI-powered analysis and manual checks.",
    Rejected: "This project did not meet the verification requirements and has been rejected.",
}

export default function DeveloperProjectsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const projectsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'projects'), where('developerId', '==', user.uid));
    }, [user, firestore]);

    const { data: developerProjects, isLoading: isProjectsLoading } = useCollection<Project>(projectsQuery);

    const isLoading = isUserLoading || isProjectsLoading;
    
    return (
        <div className="container mx-auto">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>My Projects</CardTitle>
                        <CardDescription>Register and manage your carbon offset projects.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/developer/register-project">
                            <PlusCircle className="mr-2" />
                            Register New Project
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <TooltipProvider>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Vintage</TableHead>
                                    <TableHead className="text-center">Issued (tCO₂e)</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-28 mx-auto" /></TableCell>
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
                                            <TableCell className="text-center">{project.availableTons.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Badge variant={statusVariantMapping[project.status] || 'outline'}>
                                                        {project.status}
                                                    </Badge>
                                                     <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{statusDescriptions[project.status]}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {project.status === 'Under Validation' && (
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link href={`/developer/edit-project/${project.id}`}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="outline" onClick={() => setSelectedProject(project)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Button>
                                                </div>
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
                    </TooltipProvider>
                </CardContent>
            </Card>
            <ProjectActionModal 
                isOpen={!!selectedProject} 
                project={selectedProject} 
                onClose={() => setSelectedProject(null)} 
            />
        </div>
    );
}
