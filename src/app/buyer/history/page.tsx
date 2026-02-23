'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuyerHistoryPage() {
    const { toast } = useToast();
    const { claimHistory, isClaimHistoryLoading } = useCart();

    const handleDownload = (certificateId: string) => {
        console.log(`Simulating download for certificate: ${certificateId}`);
        toast({
            title: 'Certificate Download Simulated',
            description: `Your certificate with ID ${certificateId} would begin downloading.`,
        })
    }

    const exportCSV = () => {
        if (claimHistory.length === 0) {
            toast({ variant: 'destructive', title: 'No data', description: 'No claim history to export.' });
            return;
        }
        const headers = ['Project Name', 'Amount (tCO2e)', 'Claim Date', 'Certificate ID'];
        const rows = claimHistory.map(item => [
            `"${item.projectName}"`,
            item.tons,
            new Date(item.claimDate).toLocaleDateString(),
            item.certificateId,
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `claim-history-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: 'CSV Exported', description: 'Your claim history has been downloaded as CSV.' });
    };

    const exportPDF = () => {
        if (claimHistory.length === 0) {
            toast({ variant: 'destructive', title: 'No data', description: 'No claim history to export.' });
            return;
        }
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const rows = claimHistory.map(item => `
            <tr>
                <td style="padding:8px;border:1px solid #ddd;">${item.projectName}</td>
                <td style="padding:8px;border:1px solid #ddd;">${item.tons.toLocaleString()}</td>
                <td style="padding:8px;border:1px solid #ddd;">${new Date(item.claimDate).toLocaleDateString()}</td>
                <td style="padding:8px;border:1px solid #ddd;">${item.certificateId}</td>
            </tr>`).join('');
        printWindow.document.write(`
            <html><head><title>Claim History</title>
            <style>body{font-family:Arial,sans-serif;padding:24px;} table{width:100%;border-collapse:collapse;} th{background:#166534;color:white;padding:10px;text-align:left;border:1px solid #ddd;} h1{color:#166534;}</style>
            </head><body>
            <h1>Carbon Credit Claim History</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table><thead><tr>
                <th>Project Name</th><th>Amount (tCO₂e)</th><th>Claim Date</th><th>Certificate ID</th>
            </tr></thead><tbody>${rows}</tbody></table>
            </body></html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
        toast({ title: 'PDF Export', description: 'Print dialog opened to save as PDF.' });
    };

    return (
        <div className="container mx-auto">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Claim History</CardTitle>
                        <CardDescription>Your history of retired carbon credits and downloadable certificates.</CardDescription>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={exportCSV} disabled={isClaimHistoryLoading || claimHistory.length === 0}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportPDF} disabled={isClaimHistoryLoading || claimHistory.length === 0}>
                            <FileText className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>
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

    