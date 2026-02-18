// src/components/developer/project-action-modal.tsx

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { FileClock, CheckCircle, Hourglass, ThumbsUp, ThumbsDown } from "lucide-react";

// Mock data for initial activities, as creation timestamp isn't stored yet
const initialActivity = [
    { text: "Project registration submitted to BCX", timestamp: "3 days ago", icon: <CheckCircle className="h-4 w-4 text-primary" /> },
    { text: "Project status updated to 'Under Validation'", timestamp: "2 days ago", icon: <Hourglass className="h-4 w-4 text-amber-500" /> },
];

export function ProjectActionModal({ project, isOpen, onClose }: { project: Project | null, isOpen: boolean, onClose: () => void }) {
    if (!project) return null;

    const getApprovalStatusNode = () => {
        switch (project.status) {
            case 'Verified':
                return {
                    text: 'Project Approved by Admin',
                    icon: <ThumbsUp className="h-4 w-4 text-emerald-500" />,
                    timestamp: "1 day ago" // Placeholder
                };
            case 'Rejected':
                return {
                    text: 'Project Rejected by Admin',
                    icon: <ThumbsDown className="h-4 w-4 text-red-500" />,
                    timestamp: "1 day ago" // Placeholder
                };
            default:
                return {
                    text: 'Awaiting Admin Approval',
                    icon: <div className="h-4 w-4 bg-slate-300 rounded-full" />,
                    timestamp: ""
                };
        }
    };
    
    const finalStatusNode = getApprovalStatusNode();
    const allActivities = [...initialActivity, finalStatusNode];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-white rounded-2xl shadow-2xl border border-emerald-100 p-0">
                 <DialogHeader className="p-8 pb-6">
                    <DialogTitle className="text-2xl font-extrabold text-emerald-800">
                        {project.name}
                    </DialogTitle>
                     <div className="flex items-center gap-6 text-sm pt-2">
                        <Badge variant="outline">{project.projectType}</Badge>
                        <p className="text-muted-foreground">Vintage: <span className="font-semibold text-foreground">{project.vintageYear}</span></p>
                        <p className="text-muted-foreground">Credits: <span className="font-semibold text-foreground">{project.availableTons.toLocaleString()} tCO₂e</span></p>
                    </div>
                </DialogHeader>
                <div className="px-8 pb-8">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><FileClock className="h-5 w-5 text-primary" />Action History & Timeline</h3>
                    <div className="relative pl-6">
                        {/* Vertical line */}
                        <div className="absolute left-[34px] top-2 bottom-2 w-0.5 bg-slate-200" />

                        <div className="space-y-6">
                            {allActivities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4 relative">
                                    <div className="absolute left-[-10px] top-[1px] h-5 w-5 bg-white rounded-full flex items-center justify-center ring-4 ring-white">
                                        {activity.icon}
                                    </div>
                                    <div className="ml-8">
                                        <p className={`font-medium ${project.status !== 'Under Validation' && index === allActivities.length-1 ? 'text-slate-800' : 'text-slate-500'}`}>{activity.text}</p>
                                        {activity.timestamp && <p className="text-xs text-slate-500">{activity.timestamp}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
