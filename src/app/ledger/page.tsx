'use client';

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/lib/types";

type LedgerEntry = Transaction & { id: string };

const actionVariantMapping: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    ISSUED: "default",
    SOLD: "secondary",
    LISTED: "outline",
    RETIRED: "destructive",
};

export default function LedgerPage() {
    const [transactions, setTransactions] = useState<LedgerEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLedger = useCallback(async () => {
        try {
            const res = await fetch('/api/ledger');
            if (res.ok) {
                const data: LedgerEntry[] = await res.json();
                setTransactions(data);
            }
        } catch (err) {
            console.error('Failed to fetch ledger:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    // Auto-refresh every 10 seconds for near-real-time updates
    useEffect(() => {
        const interval = setInterval(fetchLedger, 10_000);
        return () => clearInterval(interval);
    }, [fetchLedger]);

    return (
        <div className="container mx-auto">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Public Audit Ledger</CardTitle>
                        <CardDescription>
                            A transparent, real-time log of all carbon credit transactions on the platform.
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchLedger}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[160px]">Tx Hash</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Credit ID</TableHead>
                                <TableHead>Amount (tCO₂e)</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead className="text-right">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-36 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-mono text-xs truncate max-w-[160px]" title={tx.txHash}>
                                            {tx.txHash}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={actionVariantMapping[tx.action] ?? 'default'}>
                                                {tx.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{tx.creditId}</TableCell>
                                        <TableCell>{tx.amountTons?.toLocaleString() ?? 'N/A'}</TableCell>
                                        <TableCell className="max-w-[140px] truncate" title={tx.from}>{tx.from}</TableCell>
                                        <TableCell className="max-w-[140px] truncate" title={tx.to}>{tx.to}</TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {new Date(tx.timestamp).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                                        No transactions recorded yet. Transactions will appear here after purchases and credit retirements.
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
