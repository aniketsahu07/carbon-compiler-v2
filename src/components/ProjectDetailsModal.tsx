
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { CarbonCredit } from '@/lib/types';
import { Badge } from './ui/badge';
import { Globe, Award, ShieldCheck, Calendar, Tag, Info } from 'lucide-react';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectDetailsModalProps {
  project: CarbonCredit;
  isOpen: boolean;
  onClose: () => void;
}

const QualityMetricItem = ({ label, score, weight }: { label: string; score: number; weight: number }) => (
    <div className="flex items-center justify-between">
        <div>
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-muted-foreground">Weight: {weight}%</p>
        </div>
        <div className="flex items-center gap-2">
            <Progress value={score} className="w-24 h-2" />
            <span className="font-semibold text-sm w-8 text-right">{score}</span>
        </div>
    </div>
);


export function ProjectDetailsModal({ project, isOpen, onClose }: ProjectDetailsModalProps) {
  const metrics = project.qualityMetrics;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.name}</DialogTitle>
          <DialogDescription>
            Detailed information for Project ID: {project.id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-8 py-4">
            {/* Left Column */}
            <div className="space-y-6">
                <p className="text-muted-foreground">{project.fullDescription}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <strong>Location:</strong>
                        <span>{project.origin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <strong>Authority:</strong>
                        <Badge variant="outline">{project.authority}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <strong>Status:</strong>
                        <Badge variant={project.verificationStatus === 'Verified' ? 'default' : 'secondary'}>
                            {project.verificationStatus}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <strong>Vintage:</strong>
                        <span>{project.vintageYear}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <strong>Price:</strong>
                        <span>${project.price.toFixed(2)} / ton</span>
                    </div>
                </div>
            </div>

            {/* Right Column - Quality Score */}
            <div className="space-y-4 rounded-lg border bg-secondary/50 p-6">
                <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <DialogTitle className="text-xl">Quality & Integrity Score</DialogTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs" side="top">
                                    <div className="space-y-2 p-2">
                                        <h4 className="font-bold">How is this calculated?</h4>
                                        <p className="text-xs text-muted-foreground">The score is a weighted average of key quality metrics to assess the project's overall integrity.</p>
                                        <ul className="space-y-1 text-xs list-disc pl-4">
                                           <li><strong>Additionality:</strong> The project reduces emissions more than would have happened otherwise.</li>
                                           <li><strong>Permanence:</strong> The risk of the stored carbon being released back into the atmosphere.</li>
                                           <li><strong>MRV Strength:</strong> Strength of Monitoring, Reporting, and Verification processes.</li>
                                           <li><strong>Leakage Risk:</strong> Risk that the project causes an increase in emissions elsewhere.</li>
                                           <li><strong>Registry Compliance:</strong> Adherence to the standards of the carbon registry.</li>
                                           <li><strong>Corresponding Adj.:</strong> Authorization status for international trading under Article 6.</li>
                                        </ul>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <h3 className="text-5xl font-bold text-primary">{metrics.integrityScore}</h3>
                        <span className="text-lg text-muted-foreground">/ 100</span>
                    </div>
                </div>
                <Separator />
                <div className="space-y-4">
                    <QualityMetricItem label="Additionality" score={metrics.additionality} weight={25} />
                    <QualityMetricItem label="Permanence" score={metrics.permanence} weight={20} />
                    <QualityMetricItem label="MRV Strength" score={metrics.mrv} weight={20} />
                    <QualityMetricItem label="Leakage Risk" score={metrics.leakage} weight={15} />
                    <QualityMetricItem label="Registry Compliance" score={metrics.registryCompliance} weight={10} />
                    <QualityMetricItem label="Corresponding Adj." score={metrics.caStatus} weight={10} />
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
