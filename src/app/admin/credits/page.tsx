
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Landmark, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc, increment, addDoc } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminCreditsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query 'projects' collection for verified projects
  const approvedProjectsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'projects'), where('status', '==', 'Verified'));
  }, [firestore]);

  const { data: approvedProjects, isLoading: areProjectsLoading } = useCollection<Project>(approvedProjectsQuery);

  const handleIssue = async () => {
    if (!selectedProject || !quantity || Number(quantity) <= 0 || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please select a project and enter a valid quantity.',
      });
      return;
    }

    setIsSubmitting(true);
    
    const project = approvedProjects?.find((p) => p.id === selectedProject);
    if (!project) {
        toast({ variant: 'destructive', title: 'Project not found' });
        setIsSubmitting(false);
        return;
    };

    // The document to update is in the 'carbonCredits' collection
    const creditRef = doc(firestore, 'carbonCredits', project.id);

    try {
        // Use updateDoc with increment. This assumes the document was created during project approval.
        await updateDoc(creditRef, {
            availableTons: increment(Number(quantity))
        });

        toast({
            title: 'Credits Issued Successfully',
            description: `${Number(quantity).toLocaleString()} credits have been issued to ${project.name}.`,
        });

        // Notify the developer
        try {
          if (project.developerId) {
            await addDoc(collection(firestore, `users/${project.developerId}/notifications`), {
              title: '💰 Credits Issued to Your Project',
              message: `${Number(quantity).toLocaleString()} tCO₂e have been officially issued to "${project.name}" and are now available on the marketplace.`,
              read: false,
              createdAt: new Date().toISOString(),
              link: '/developer/projects',
            });
          }
        } catch (notifErr) {
          console.error('Notification write failed (non-critical):', notifErr);
        }

        // Reset form
        setSelectedProject(undefined);
        setQuantity('');
    } catch(e) {
        console.error("Failed to issue credits:", e);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: creditRef.path,
            operation: 'update',
            requestResourceData: { availableTons: `increment(${Number(quantity)})` }
        }));
        toast({
            variant: "destructive",
            title: "Operation Failed",
            description: "Could not issue credits. The credit document may not exist or you lack permissions. Approve the project first."
        })
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const isLoading = areProjectsLoading || isSubmitting;

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Issue Carbon Credits</CardTitle>
          <CardDescription>
            Issue new carbon credits to approved and verified projects. This action will be recorded on the public ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project-select">Select an Approved Project</Label>
            <Select 
                value={selectedProject} 
                onValueChange={setSelectedProject}
                disabled={isLoading}
            >
              <SelectTrigger id="project-select">
                <SelectValue placeholder={areProjectsLoading ? "Loading projects..." : "Choose a project..."} />
              </SelectTrigger>
              <SelectContent>
                {approvedProjects && approvedProjects.length > 0 ? (
                  approvedProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    {areProjectsLoading ? "Loading..." : "No approved projects available"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Issue (tCO₂e)</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="e.g., 10000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              disabled={isLoading}
            />
             <p className="text-xs text-muted-foreground">This amount will be added to the project's available tons.</p>
          </div>

          <div>
            <Button onClick={handleIssue} disabled={isLoading || !selectedProject || !quantity}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 animate-spin" />
                        Issuing...
                    </>
                ) : (
                    <>
                        <Landmark className="mr-2" />
                        Issue Credits
                    </>
                )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    