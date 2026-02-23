
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

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
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

const sdgGoals = [
    { id: 'sdg1', label: 'No Poverty' },
    { id: 'sdg7', label: 'Affordable and Clean Energy' },
    { id: 'sdg8', label: 'Decent Work and Economic Growth' },
    { id: 'sdg11', label: 'Sustainable Cities and Communities' },
    { id: 'sdg13', label: 'Climate Action' },
    { id: 'sdg15', label: 'Life on Land' },
]

// Schema now only includes text-based fields managed by react-hook-form
const projectSchema = z.object({
  name: z.string().min(5, 'Project name must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  country: z.string().min(2, 'Country is required.'),
  projectType: z.enum(['Reforestation', 'Renewable Energy', 'Methane Capture', 'Direct Air Capture', 'Geothermal', 'Hydroelectric']),
  methodology: z.string().min(3, "Please specify the project methodology (e.g., Verra, Gold Standard)."),
  projectWebsite: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  vintageYear: z.coerce.number().int().min(2020, 'Vintage year must be 2020 or later.'),
  availableTons: z.coerce.number().int().positive('Please enter a valid number of tons.'),
  pricePerTon: z.coerce.number().positive('Price must be a positive number.').min(1, 'Minimum price is ₹1 per ton.'),
  sdgImpacts: z.array(z.string()).optional(),
});

export default function RegisterProjectPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for manual file handling
  const [projectPhoto, setProjectPhoto] = useState<File | null>(null);
  const [documents, setDocuments] = useState<FileList | null>(null);

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
      pricePerTon: 500,
      sdgImpacts: [],
    },
  });

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to register a project.',
        });
        return;
    }
    
    setIsSubmitting(true);

    try {
        const storage = getStorage(getApp());
        const projectsColRef = collection(firestore, 'projects');
        const projectData: any = {
            ...values,
            developerId: user.uid,
            status: 'Under Validation',
        };
        
        // Upload documents to Firebase Storage
        if (documents && documents.length > 0) {
            const uploadedDocs = await Promise.all(
                Array.from(documents).map(async (file) => {
                    const fileRef = storageRef(storage, `projects/${user.uid}/${Date.now()}_${file.name}`);
                    await uploadBytes(fileRef, file);
                    const url = await getDownloadURL(fileRef);
                    return { name: file.name, url };
                })
            );
            projectData.auditDocuments = uploadedDocs;
        } else {
            projectData.auditDocuments = [];
        }

        // Upload project photo to Firebase Storage
        if (projectPhoto) {
            const photoRef = storageRef(storage, `projects/${user.uid}/photo_${Date.now()}_${projectPhoto.name}`);
            await uploadBytes(photoRef, projectPhoto);
            projectData.photoUrl = await getDownloadURL(photoRef);
        }


        await addDocumentNonBlocking(projectsColRef, projectData);
        
        toast({
            title: 'Project Registration Submitted',
            description: 'Your project is now pending approval from the registry.',
        });

        router.push('/developer/dashboard');

    } catch (error) {
        console.error('Error registering project:', error);
        toast({
            variant: 'destructive',
            title: 'Registration Failed',
            description: 'There was an error submitting your project. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const isLoading = isUserLoading || isSubmitting;

  return (
    <div className="container mx-auto">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Register a New Carbon Offset Project</CardTitle>
          <CardDescription>Fill out the details below to submit your project for validation and listing on the exchange.</CardDescription>
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
                      <Input placeholder="e.g., Gujarat Wind Power Project" {...field} value={field.value || ""} disabled={isLoading} />
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
                      <Textarea placeholder="Describe the project's goals, impact, and methodology." {...field} value={field.value || ""} disabled={isLoading} />
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
                        <Input placeholder="e.g., India" {...field} value={field.value || ""} disabled={isLoading} />
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
                         <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
                        <Input placeholder="e.g., Verra VM0007, Gold Standard" {...field} value={field.value || ""} disabled={isLoading} />
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
                        <Input placeholder="https://your-project-website.com" {...field} value={field.value || ""} disabled={isLoading} />
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
                        <Input type="number" placeholder="e.g., 2024" {...field} value={field.value || ""} disabled={isLoading} />
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
                        <Input type="number" placeholder="e.g., 50000" {...field} value={field.value || ""} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

              <FormField
                control={form.control}
                name="pricePerTon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Ton (₹ / tCO₂e)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} value={field.value || ""} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      Set your desired listing price per tonne of CO₂ equivalent. This will be used as the marketplace price upon approval.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                                render={({ field }) => {
                                return (
                                    <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...(field.value || []), item.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                        (value) => value !== item.id
                                                    )
                                                    )
                                            }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">{item.label}</FormLabel>
                                    </FormItem>
                                )
                                }}
                            />
                            ))}
                         </div>
                         <FormMessage />
                    </FormItem>
                )}
                />

              <Separator />

              {/* Manual File Input for Project Photo */}
              <FormItem>
                <FormLabel>Main Project Photo</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*"
                    disabled={isLoading}
                    onChange={(e) => setProjectPhoto(e.target.files ? e.target.files[0] : null)}
                  />
                </FormControl>
                <FormDescription>
                  A high-quality photo for the marketplace. Will be uploaded to secure storage.
                </FormDescription>
              </FormItem>
              
              {/* Manual File Input for Documents */}
              <FormItem>
                <FormLabel>Supporting Documents</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    multiple 
                    disabled={isLoading}
                    onChange={(e) => setDocuments(e.target.files)}
                  />
                </FormControl>
                <FormDescription>
                  Upload PDFs, validation reports, etc. Files will be securely stored and shown to the admin for review.
                </FormDescription>
              </FormItem>

              <Button type="submit" disabled={isLoading}>
                {isSubmitting ? 'Submitting...' : 'Submit for Validation'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    