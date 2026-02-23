'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { CarbonCredit } from '@/lib/types';
import { MapPin, Recycle, Calendar, DollarSign, BarChart2, ShieldCheck, Droplets, Wind, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CompareCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  credits: CarbonCredit[];
}

const MetricRow = ({
  icon: Icon,
  label,
  values,
  isProgress = false,
  isBadge = false,
}: {
  icon: React.ElementType;
  label: string;
  values: (string | number)[];
  isProgress?: boolean;
  isBadge?: boolean;
}) => (
  <div className="grid gap-2" style={{ gridTemplateColumns: `180px repeat(${values.length}, 1fr)` }}>
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground py-3 border-b">
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </div>
    {values.map((val, i) => (
      <div key={i} className="py-3 border-b flex items-center justify-center">
        {isProgress ? (
          <div className="w-full px-2 space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span>{val}</span>
            </div>
            <Progress value={Number(val)} className="h-2" />
          </div>
        ) : isBadge ? (
          <Badge variant="outline">{val}</Badge>
        ) : (
          <span className="text-sm text-center">{val}</span>
        )}
      </div>
    ))}
  </div>
);

export function CompareCreditsDialog({ isOpen, onClose, credits }: CompareCreditsDialogProps) {
  if (credits.length < 2) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Compare Carbon Credits</DialogTitle>
          <DialogDescription>Side-by-side comparison of selected carbon credits.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh]">
          <div className="pr-4">
            {/* Header Row - Credit Names */}
            <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `180px repeat(${credits.length}, 1fr)` }}>
              <div />
              {credits.map((credit) => (
                <div key={credit.id} className="text-center font-semibold text-sm bg-muted rounded-md p-3">
                  {credit.name}
                </div>
              ))}
            </div>

            {/* Metrics */}
            <MetricRow
              icon={DollarSign}
              label="Price (per ton)"
              values={credits.map((c) => `$${c.price.toFixed(2)}`)}
            />
            <MetricRow
              icon={MapPin}
              label="Origin"
              values={credits.map((c) => c.origin)}
            />
            <MetricRow
              icon={Recycle}
              label="Project Type"
              values={credits.map((c) => c.projectType)}
              isBadge
            />
            <MetricRow
              icon={Calendar}
              label="Vintage Year"
              values={credits.map((c) => c.vintageYear)}
            />
            <MetricRow
              icon={Wind}
              label="Available (tCO₂e)"
              values={credits.map((c) => c.availableTons.toLocaleString())}
            />
            <MetricRow
              icon={ShieldCheck}
              label="Authority"
              values={credits.map((c) => c.authority || 'BEE India')}
            />

            {/* Quality Metrics */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-1">Quality Metrics</p>
            <MetricRow
              icon={BarChart2}
              label="Integrity Score"
              values={credits.map((c) => c.qualityMetrics.integrityScore)}
              isProgress
            />
            <MetricRow
              icon={Activity}
              label="Additionality"
              values={credits.map((c) => c.qualityMetrics.additionality)}
              isProgress
            />
            <MetricRow
              icon={Droplets}
              label="Permanence"
              values={credits.map((c) => c.qualityMetrics.permanence)}
              isProgress
            />
            <MetricRow
              icon={Wind}
              label="Leakage Control"
              values={credits.map((c) => c.qualityMetrics.leakage)}
              isProgress
            />
            <MetricRow
              icon={ShieldCheck}
              label="MRV Score"
              values={credits.map((c) => c.qualityMetrics.mrv)}
              isProgress
            />
            <MetricRow
              icon={ShieldCheck}
              label="Registry Compliance"
              values={credits.map((c) => c.qualityMetrics.registryCompliance)}
              isProgress
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
