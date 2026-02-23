'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Project } from '@/lib/types';

const sdgGoals = [
  { id: 'sdg1', label: 'No Poverty' },
  { id: 'sdg7', label: 'Affordable and Clean Energy' },
  { id: 'sdg8', label: 'Decent Work and Economic Growth' },
  { id: 'sdg11', label: 'Sustainable Cities and Communities' },
  { id: 'sdg13', label: 'Climate Action' },
  { id: 'sdg15', label: 'Life on Land' },
];

const projectSchema = z.object({
  name: z.string().min(5, 'Project name must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  country: z.string().min(2, 'Country is required.'),
  projectType: z.enum(['Reforestation', 'Renewable Energy', 'Methane Capture', 'Direct Air Capture', 'Geothermal', 'Hydroelectric']),
  methodology: z.string().min(3, 'Please specify the project methodology.'),
  projectWebsite: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  vintageYear: z.coerce.number().int().min(2020, 'Vintage year must be 2020 or later.'),
  availableTons: z.coerce.number().int().positive('Please enter a valid number of tons.'),
  sdgImpacts: z.array(z.string()).optional(),
});

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      country: '',
      projectType: 'Renewable Energy',
      methodology: '',
      projectWebsite: '',
      vintageYear: new Date().getFullYear(),
      availableTons: 10000,
      sdgImpacts: [],
    },
  });

  useEffect(() => {
    if (isUserLoading || !user || !firestore || !projectId) return;

    const fetchProject = async () => {
      setIsFetching(true);
      try {
        const projectRef = doc(firestore, 'projects', projectId);
        const snap = await getDoc(projectRef);

        if (!snap.exists()) {
          setFetchError('Project not found.');
          return;
        }

        const data = snap.data() as Project;

        if (data.developerId !== user.uid) {
          setFetchError('You do not have permission to edit this project.');
          return;
        }

        if (data.status !== 'Under Validation') {
          setFetchError(`This project cannot be edited because its status is "${data.status}". Only projects "Under Validation" can be edited.`);
          return;
        }

        setProject(data);
        form.reset({
          name: data.name || '',
          description: data.description || '',
          country: data.country || '',
          projectType: data.projectType as any || 'Renewable Energy',
          methodology: data.methodology || '',
          projectWebsite: data.projectWebsite || '',
          vintageYear: data.vintageYear || new Date().getFullYear(),
          availableTons: data.availableTons || 10000,
          sdgImpacts: data.sdgImpacts || [],
        });
      } catch (error) {
        setFetchError('Failed to load project data. Please try again.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProject();
  }, [user, isUserLoading, firestore, projectId, form]);

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    if (!user || !firestore) return;

    setIsSubmitting(true);
    try {
      const projectRef = doc(firestore, 'projects', projectId);
      await updateDoc(projectRef, {
        ...values,
        status: 'Under Validation', // status wahi rehti hai
        lastEditedAt: new Date().toISOString(),
      });

      toast({
        title: 'Project Updated Successfully',
        description: 'Your changes have been saved. The project is still under validation.',
      });

      router.push('/developer/projects');
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error saving your changes. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLoading = isFetching || isSubmitting || isUserLoading;

  if (isFetching) {
    return (
      <div className="container mx-auto">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto max-w-3xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cannot Edit Project</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/developer/projects')}>
          Back to My Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Project</CardTitle>
          <CardDescription>
            Update your project details below. The project will remain "Under Validation" after editing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Gujarat Wind Power Project" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the project's goals, impact, and methodology." {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., India" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a project type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Renewable Energy">Renewable Energy</SelectItem>
                          <SelectItem value="Reforestation">Reforestation</SelectItem>
                          <SelectItem value="Methane Capture">Methane Capture</SelectItem>
                          <SelectItem value="Direct Air Capture">Direct Air Capture</SelectItem>
                          <SelectItem value="Geothermal">Geothermal</SelectItem>
                          <SelectItem value="Hydroelectric">Hydroelectric</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="methodology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Methodology</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Verra VM0007, Gold Standard" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Specify the carbon accounting methodology used.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-project-website.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="vintageYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vintage Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2024" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availableTons"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Credits to Issue (tCO₂e)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 50000" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sdgImpacts"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">UN Sustainable Development Goal (SDG) Impacts</FormLabel>
                      <FormDescription>Select the SDGs that your project contributes to.</FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {sdgGoals.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="sdgImpacts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(field.value?.filter((v) => v !== item.id));
                                  }}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" disabled={isLoading} onClick={() => router.push('/developer/projects')}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
