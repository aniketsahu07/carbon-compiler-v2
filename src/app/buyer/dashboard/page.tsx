'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, Leaf, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { PortfolioItem } from "@/lib/types";
import { useCart } from '@/context/CartContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from "@/firebase";

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

    const isLoading = isPortfolioLoading || isClaimHistoryLoading;

    return (
        <div className="w-full space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            My Credit Balance
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <div className="text-2xl font-bold">{creditBalance.toLocaleString()}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            tCO₂e available to claim
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total CO₂ Offset
                        </CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {isLoading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <div className="text-2xl font-bold">{totalOffset.toLocaleString()}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            tCO₂e claimed historically
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>My Purchased Credits</CardTitle>
                    <CardDescription>These are the carbon credits you own. You can claim them to offset your emissions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </div>
                    ) : portfolio.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Vintage</TableHead>
                                    <TableHead className="text-right">Amount (tCO₂e)</TableHead>
                                    <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {portfolio.filter(item => item.name).map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.vintageYear}</TableCell>
                                        <TableCell className="text-right">{item.tons.toLocaleString()}</TableCell>
                                        <TableCell className="text-center">
                                            <Button size="sm" onClick={() => handleClaim(item)} disabled={!item.id}>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Claim Credits
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="text-center text-muted-foreground py-16">
                            <p>You have not purchased any credits yet. Visit the marketplace to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
