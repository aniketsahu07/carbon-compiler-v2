'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuyerHistoryPage() {
    const { toast } = useToast();
    const { claimHistory, isClaimHistoryLoading } = useCart();

    const handleDownload = (certificateId: string) => {
        // In a real app, this would trigger a file download.
        // Here, we'll just simulate it with a toast and a log.
        console.log(`Simulating download for certificate: ${certificateId}`);
        toast({
            title: 'Certificate Download Simulated',
            description: `Your certificate with ID ${certificateId} would begin downloading.`,
        })
    }

    return (
        <div className="container mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Claim History</CardTitle>
                    <CardDescription>Your history of retired carbon credits and downloadable certificates.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project</TableHead>
                                <TableHead>Amount (tCO₂e)</TableHead>
                                <TableHead>Claim Date</TableHead>
                                <TableHead className="text-right">Certificate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isClaimHistoryLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : claimHistory.length > 0 ? (
                                claimHistory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.projectName}</TableCell>
                                        <TableCell>{item.tons.toLocaleString()}</TableCell>
                                        <TableCell>{new Date(item.claimDate).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline" onClick={() => handleDownload(item.certificateId)}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                                        You have not claimed any credits yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

    