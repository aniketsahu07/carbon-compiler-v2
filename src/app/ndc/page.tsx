
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BarChart, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { CarbonCredit } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { NdcDetailsModal } from '@/components/ndc-details-modal';

export default function NdcTrackingPage() {
    const firestore = useFirestore();
    const [selectedProject, setSelectedProject] = useState<CarbonCredit | null>(null);

    const creditsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'carbonCredits'),
            where('verificationStatus', '==', 'Verified')
        );
    }, [firestore]);

    const { data: carbonCredits, isLoading } = useCollection<CarbonCredit>(creditsQuery);

    return (
        <div className="container mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale />
                        NDC & Project Tracking Dashboard
                    </CardTitle>
                    <CardDescription>
                        Monitor the status and Nationally Determined Contribution (NDC) alignment for all projects on the exchange.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Name</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-center">Total Issued (tCO₂e)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-40 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : carbonCredits && carbonCredits.length > 0 ? (
                                carbonCredits.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-medium">{project.name}</TableCell>
                                        <TableCell>{project.origin}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{project.projectType}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{project.availableTons.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline" onClick={() => setSelectedProject(project)}>
                                                <BarChart className="mr-2 h-4 w-4"/>
                                                View NDC Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                                        No projects found in the marketplace.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {selectedProject && (
                <NdcDetailsModal 
                    project={selectedProject}
                    isOpen={!!selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </div>
    );
}
