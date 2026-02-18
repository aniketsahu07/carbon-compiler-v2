'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, useFirestore, initiateEmailSignUp, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useEffect } from 'react';
import { useUser } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { BrandLogo } from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole } from '@/lib/types';
import { SUPER_ADMIN_EMAIL } from '@/lib/config';


const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  organizationName: z.string().optional(),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
  role: z.enum(['BUYER', 'DEVELOPER', 'ADMIN'], {
    required_error: 'You need to select a role.',
  }),
});

const roleRedirectMap: Record<UserRole, string> = {
  ADMIN: '/admin/dashboard',
  DEVELOPER: '/developer/dashboard',
  BUYER: '/buyer/dashboard',
};

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      organizationName: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.role === 'ADMIN' && values.email !== SUPER_ADMIN_EMAIL) {
        toast({
            variant: 'destructive',
            title: 'Unauthorized Admin',
            description: 'You are not authorized to create an Admin account.',
        });
        return;
    }
    
    try {
      const userCredential = await initiateEmailSignUp(auth, values.email, values.password);
      if (userCredential && userCredential.user) {
        const userId = userCredential.user.uid;
        const userProfileRef = doc(firestore, 'users', userId);
        const userProfileData: any = {
          id: userId,
          firstName: values.firstName,
          lastName: values.lastName,
          userName: values.email.split('@')[0],
          email: values.email,
          role: values.role,
          registrationDate: serverTimestamp(),
        };

        if(values.organizationName) {
            userProfileData.organizationName = values.organizationName;
        }
        
        setDocumentNonBlocking(userProfileRef, userProfileData, { merge: true });
        
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('userRole', values.role);
        }

        const redirectPath = roleRedirectMap[values.role] || '/';
        router.push(redirectPath);
      }
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
        toast({
          variant: 'destructive',
          title: 'Sign-up failed',
          description: 'This email is already registered. Please log in instead.',
        });
      } else {
        console.error('Sign up error:', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.',
        });
      }
    }
  }

  useEffect(() => {
    if (!isUserLoading && user) {
        const role = sessionStorage.getItem('userRole') as UserRole;
        if(role) {
            const redirectPath = roleRedirectMap[role] || '/';
            router.push(redirectPath);
        } else {
            router.push('/buyer/dashboard'); // Default redirect
        }
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }
  
  if (user) {
    return <div className="flex h-screen w-screen items-center justify-center">Redirecting...</div>;
  }


  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="flex min-h-screen items-center justify-center p-6 lg:p-8 bg-background">
        <div className="mx-auto w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
                 <div className="flex justify-center items-center gap-2">
                    <BrandLogo className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Create an Account</h1>
                </div>
                <p className="text-muted-foreground">Join to start your climate action journey.</p>
            </div>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company, Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Your Role</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How will you use the platform?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BUYER">Public / Buyer</SelectItem>
                          <SelectItem value="DEVELOPER">Project Developer / Seller</SelectItem>
                          <SelectItem value="ADMIN">Admin / Registry</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </Form>

           <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="relative hidden h-full lg:block">
         <Image 
            src="https://images.unsplash.com/photo-1593431074633-21ef64707d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8Zm9yZXN0JTIwdHJlZXN8ZW58MHx8fHwxNzY2NTI0NDgxfDA&ixlib=rb-4.1.0&q=80&w=1080" 
            alt="A lush green forest"
            fill
            style={{ objectFit: 'cover' }}
            priority
            data-ai-hint="forest trees"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-8 left-8 text-white">
            <h2 className="text-3xl font-bold">Invest in Our Planet</h2>
            <p className="mt-2 max-w-md">Every credit purchased is a step towards a sustainable future.</p>
        </div>
      </div>
    </div>
  );
}
