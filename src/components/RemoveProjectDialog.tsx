'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { CarbonCredit } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';

interface RemoveProjectDialogProps {
  project: CarbonCredit;
  isOpen: boolean;
  onClose: () => void;
}

export function RemoveProjectDialog({ project, isOpen, onClose }: RemoveProjectDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleRemoveProject = async () => {
    if (!reason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason Required',
        description: 'Please provide a reason for removing the project.',
      });
      return;
    }
    
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Database Error',
            description: 'Could not connect to the database.',
        });
        return;
    }

    setIsSubmitting(true);

    try {
      const batch = writeBatch(firestore);

      const carbonCreditRef = doc(firestore, 'carbonCredits', project.id);
      // Use set with merge to perform an "upsert". This updates the doc if it exists,
      // or creates it if it doesn't, preventing the "No document to update" error.
      batch.set(carbonCreditRef, { verificationStatus: 'Rejected' }, { merge: true });

      const projectRef = doc(firestore, 'projects', project.id);
      // Also use set with merge for the projects collection.
       batch.set(projectRef, { status: 'Rejected' }, { merge: true });

      await batch.commit();

      toast({
        title: 'Project Removed',
        description: `${project.name} has been removed from the marketplace.`,
      });
      onClose();
      setReason('');
    } catch (error) {
      console.error("Error removing project:", error);
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: 'Could not remove the project. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Project from Marketplace</DialogTitle>
          <DialogDescription>
            You are about to remove <span className="font-semibold text-foreground">{project.name}</span>. This will change its status to 'Rejected' and hide it from public view.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Removal</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Project failed annual audit, compliance issues..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemoveProject}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? 'Removing...' : 'Confirm Removal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
