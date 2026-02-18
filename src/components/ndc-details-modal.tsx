
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CarbonCredit } from '@/lib/types';
import { Badge } from './ui/badge';
import { Globe, AlertTriangle, CheckCircle, Landmark, BookCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface NdcDetailsModalProps {
  project: CarbonCredit;
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

export function NdcDetailsModal({ project, isOpen, onClose }: NdcDetailsModalProps) {
  const hasCA = project.qualityMetrics.caStatus > 50;
  const itmoCredits = hasCA ? Math.round(project.availableTons * 0.7) : 0;
  const ndcCredits = project.availableTons - itmoCredits;

  const chartData = [
    { name: 'NDC Fulfillment', value: ndcCredits },
    { name: 'ITMOs', value: itmoCredits },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.name}</DialogTitle>
          <DialogDescription>
            NDC alignment and credit allocation details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Left Column: Details */}
            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Credits Issued</CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{project.availableTons.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">tCO₂e from vintage {project.vintageYear}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Corresponding Adjustment</CardTitle>
                        {hasCA ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${hasCA ? 'text-green-600' : 'text-amber-600'}`}>
                            {hasCA ? "Authorized" : "Not Authorized"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {hasCA ? "Eligible for international transfer" : "For domestic use only"}
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Registry & Standard</CardTitle>
                        <BookCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{project.authority}</div>
                        <p className="text-xs text-muted-foreground">
                            Ensures project quality and integrity
                        </p>
                    </CardContent>
                </Card>
            </div>
            {/* Right Column: Chart */}
            <div className="space-y-4">
                <Card>
                     <CardHeader>
                        <CardTitle>Credit Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-[250px]">
                            <ResponsiveContainer>
                                <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${Number(value).toLocaleString()} tCO₂e`, name]}/>
                                <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
