
'use client';

import { useParams, useRouter, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, setDoc, collection, getDoc, addDoc } from 'firebase/firestore';
import { useUser } from '@/firebase';
import type { Project, CarbonCredit } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ThumbsUp, ThumbsDown, User, Hash, Calendar, Globe, Award, FileText, ShieldCheck, ScanSearch, Link as LinkIcon, Star, Download } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { calculateProjectMetrics } from '@/lib/carbon-matrix';

/** Generate a random hex transaction hash. */
function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 16; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
}

export default function ReviewProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.projectId as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId || !firestore) return;

    const fetchProject = async () => {
        setIsLoading(true);
        const projectRef = doc(firestore, 'projects', projectId);
        const docSnap = await getDoc(projectRef);
        
        if (docSnap.exists()) {
            setProjectData({ id: docSnap.id, ...docSnap.data() } as Project);
        } else {
            setProjectData(null);
            notFound();
        }
        setIsLoading(false);
    };

    fetchProject();
  }, [projectId, firestore]);

  const projectTypeImages: Record<string, { url: string; hint: string }> = {
    'Reforestation': {
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
      hint: 'forest canopy green reforestation',
    },
    'Renewable Energy': {
      url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
      hint: 'solar panels aerial renewable energy',
    },
    'Methane Capture': {
      url: 'https://images.unsplash.com/photo-1497435334941-8c899a9bd771?w=800&q=80',
      hint: 'industrial gas plant methane capture',
    },
    'Direct Air Capture': {
      url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
      hint: 'industrial carbon capture plant',
    },
    'Geothermal': {
      url: 'https://images.unsplash.com/photo-1661755877249-b0fe30accbb1?w=800&q=80',
      hint: 'geothermal steam power plant',
    },
    'Hydroelectric': {
      url: 'https://images.unsplash.com/photo-1505036952194-547a06413a96?w=800&q=80',
      hint: 'hydroelectric dam water power',
    },
  };

  const getImage = (projectType: string) => {
    return projectTypeImages[projectType] ?? {
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
      hint: 'carbon offset project',
    };
  };

  const handleDecision = async (status: 'Verified' | 'Rejected') => {
    if (!projectId || !projectData || !firestore) return;
    setIsSubmitting(true);
    
    const projectRef = doc(firestore, 'projects', projectId);

    try {
        // Step 1: Update project status — this is the critical step
        await updateDoc(projectRef, { status });

        // Step 2: If approved, create carbonCredits entry (best-effort — won't block approval)
        if (status === 'Verified') {
            try {
                const carbonCreditsColRef = collection(firestore, 'carbonCredits');
                const newCreditRef = doc(carbonCreditsColRef, projectId); 
                const image = getImage(projectData.projectType);
                
                const { finalIntegrityScore, dynamicPrice } = calculateProjectMetrics(projectData);
                const finalPrice = projectData.pricePerTon && projectData.pricePerTon > 0
                  ? projectData.pricePerTon
                  : dynamicPrice;
                
                const creditData: Omit<CarbonCredit, 'id'> = {
                    name: projectData.name,
                    description: projectData.description.substring(0, 100) + '...',
                    fullDescription: projectData.description,
                    origin: projectData.country,
                    projectType: projectData.projectType as any,
                    availableTons: 0,
                    price: finalPrice,
                    vintageYear: projectData.vintageYear,
                    verificationStatus: 'Verified',
                    authority: 'BEE India',
                    imageUrl: image.url,
                    imageHint: image.hint,
                    qualityMetrics: {
                        integrityScore: finalIntegrityScore,
                        additionality: Math.floor(Math.random() * 21) + 75,
                        permanence: Math.floor(Math.random() * 21) + 80,
                        leakage: Math.floor(Math.random() * 31) + 65,
                        mrv: Math.floor(Math.random() * 21) + 78,
                        registryCompliance: 95,
                        caStatus: Math.random() > 0.4 ? 100 : 0,
                    }
                };
                await setDoc(newCreditRef, creditData);
            } catch (creditErr) {
                // Credit creation failed (likely Firestore rules) — project is still approved
                // Admin can manually issue credits from the "Issue Credits" page
                console.error('Carbon credit creation failed (non-critical):', creditErr);
            }

            // Write ISSUED ledger entry via internal API (no Firestore security rules)
            try {
                await fetch('/api/ledger', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        txHash: generateTxHash(),
                        action: 'ISSUED',
                        creditId: projectId,
                        from: 'BCX Registry',
                        to: projectData.name,
                        timestamp: new Date().toISOString(),
                        amountTons: projectData.availableTons,
                    }),
                });
            } catch (ledgerErr) {
                console.error('Ledger write failed (non-critical):', ledgerErr);
            }
        }

        toast({
            title: `Project ${status}`,
            description: `${projectData?.name} has been successfully ${status.toLowerCase()}.`,
            variant: status === 'Rejected' ? 'destructive' : 'default',
        });

        // Notify the developer
        try {
          await addDoc(collection(firestore, `users/${projectData.developerId}/notifications`), {
            title: status === 'Verified' ? '✅ Project Approved!' : '❌ Project Rejected',
            message:
              status === 'Verified'
                ? `Your project "${projectData.name}" has been approved and is now listed on the marketplace.`
                : `Your project "${projectData.name}" was rejected. Please review and re-submit if needed.`,
            read: false,
            createdAt: new Date().toISOString(),
            link: '/developer/projects',
          });
        } catch (notifErr) {
          console.error('Notification write failed (non-critical):', notifErr);
        }

        router.push('/admin/dashboard');

    } catch (error) {
        console.error("Decision failed:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: projectRef.path,
            operation: 'update',
            requestResourceData: { status }
        }));
        toast({
            variant: "destructive",
            title: "Operation Failed",
            description: "Could not update the project. Please check permissions."
        })
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <div className="container mx-auto space-y-4">
             <Skeleton className="h-10 w-32" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Skeleton className="h-24 w-full" />
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
  }
  
  if (!projectData) return null; // notFound() is called in useEffect

  return (
    <div className="container mx-auto space-y-4">
       <Button variant="outline" onClick={() => router.push('/admin/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
       </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Project Details */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            Review Project: {projectData.name}
                        </CardTitle>
                        <CardDescription>Review the details and approve or reject this project submission.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg">Project Description</h3>
                            <p className="text-muted-foreground mt-1">{projectData.description}</p>
                        </div>
                        <Separator />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="flex items-start gap-3">
                                <Hash className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">Project Type</p>
                                    <p className="text-muted-foreground">{projectData.projectType}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">Vintage Year</p>
                                    <p className="text-muted-foreground">{projectData.vintageYear}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Globe className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">Country</p>
                                    <p className="text-muted-foreground">{projectData.country}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Award className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">Credits to Issue</p>
                                    <p className="text-muted-foreground">{projectData.availableTons.toLocaleString()} tCO₂e</p>
                                 </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Star className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">Developer's Requested Price</p>
                                    <p className="text-muted-foreground">
                                      {projectData.pricePerTon
                                        ? `₹${projectData.pricePerTon.toLocaleString()} / tCO₂e`
                                        : 'Not set — dynamic pricing will apply'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">Current Status</p>
                                    <Badge variant={projectData.status === 'Rejected' ? 'destructive' : projectData.status === 'Verified' ? 'default' : 'secondary'}>{projectData.status}</Badge>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">Methodology</p>
                                    <p className="text-muted-foreground">{projectData.methodology}</p>
                                 </div>
                            </div>
                            {projectData.projectWebsite && (
                                <div className="flex items-start gap-3">
                                    <LinkIcon className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Project Website</p>
                                        <a href={projectData.projectWebsite} target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-primary hover:underline truncate">{projectData.projectWebsite}</a>
                                    </div>
                                </div>
                            )}
                             <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">Developer ID</p>
                                    <p className="text-muted-foreground font-mono text-xs">{projectData.developerId}</p>
                                </div>
                            </div>
                         </div>
                         
                         {projectData.sdgImpacts && projectData.sdgImpacts.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Star className="h-4 w-4" /> SDG Impacts</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {projectData.sdgImpacts.map(sdg => <Badge key={sdg} variant="secondary">{sdg.replace('sdg', 'SDG ')}</Badge>)}
                                    </div>
                                </div>
                            </>
                         )}

                         <Separator />
                         <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2"><FileText className="h-4 w-4" /> Audit Documents</h3>
                            {projectData.auditDocuments && projectData.auditDocuments.length > 0 ? (
                                <ul className="mt-2 space-y-2">
                                    {projectData.auditDocuments.map((doc, index) => (
                                        <li key={index} className="flex items-center justify-between rounded-md border p-3">
                                            <span className="text-sm font-medium text-muted-foreground">{doc.name}</span>
                                            <Button asChild variant="outline" size="sm">
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </a>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8 mt-2">
                                    <p>No audit documents were uploaded for this project.</p>
                                </div>
                            )}
                         </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Right Column - Actions */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Button size="lg" type="button" onClick={() => handleDecision('Verified')} disabled={isSubmitting || projectData.status !== 'Under Validation'}>
                            <ThumbsUp className="mr-2 h-4 w-4" /> 
                            {projectData.status === 'Verified' ? 'Already Approved' : isSubmitting ? 'Approving...' : 'Approve Project'}
                        </Button>
                        <Button size="lg" type="button" variant="destructive" onClick={() => handleDecision('Rejected')} disabled={isSubmitting || projectData.status !== 'Under Validation'}>
                            <ThumbsDown className="mr-2 h-4 w-4" /> 
                             {projectData.status === 'Rejected' ? 'Already Rejected' : isSubmitting ? 'Rejecting...' : 'Reject Project'}
                        </Button>
                         {projectData.status !== 'Under Validation' && (
                            <p className="text-xs text-center text-muted-foreground pt-2">This project has already been reviewed.</p>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>AI Analysis Tools</CardTitle>
                        <CardDescription>Use AI to assist in the validation process.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" asChild variant="outline">
                            <Link href="/satellite-imagery">
                                <ScanSearch className="mr-2 h-4 w-4" />
                                Analyze Satellite Imagery
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

    