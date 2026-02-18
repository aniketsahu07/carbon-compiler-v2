// src/components/developer/project-detail-modal.tsx

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Globe, Tag, ShieldCheck, Calendar, Award, Leaf } from 'lucide-react';

// Modal Component for Project Details
export function ProjectDetailModal({ project, isOpen, onClose }: { project: Project | null, isOpen: boolean, onClose: () => void }) {
    if (!project) return null;

    const badgeStyles: { [key: string]: string } = {
        'Under Validation': 'bg-amber-100 text-amber-800 border-amber-200',
        'Verified': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Rejected': 'bg-red-100 text-red-800 border-red-200',
    };
    
    const sectorBadgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';

    const statusStyle = badgeStyles[project.status as keyof typeof badgeStyles] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl bg-white rounded-2xl shadow-2xl border border-emerald-100 p-0">
                 <DialogHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3">
                         <Leaf className="h-7 w-7 text-emerald-800" />
                        <DialogTitle className="text-2xl font-extrabold text-emerald-800">
                            {project.name}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="px-8 pb-8">
                    <p className="text-slate-500 pt-2">{project.description}</p>
                    <Separator className="my-4 bg-slate-200" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4">
                        <div>
                            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-600" />Location</p>
                            <p className="text-lg font-bold text-slate-800 mt-1">{project.country}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-2"><Tag className="h-4 w-4 text-emerald-600" />Project Sector</p>
                             <div className="mt-1"><Badge className={sectorBadgeStyle}>{project.projectType}</Badge></div>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" />Status</p>
                            <div className="mt-1"><Badge className={statusStyle}>{project.status}</Badge></div>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald-600" />Vintage</p>
                            <p className="text-lg font-bold text-slate-800 mt-1">{project.vintageYear}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-2"><Award className="h-4 w-4 text-emerald-600" />Registered Credits</p>
                            <p className="text-lg font-bold text-slate-800 mt-1">{project.availableTons.toLocaleString()} tCO₂e</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
