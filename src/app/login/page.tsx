'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import Image from 'next/image';
import { Mail, Lock } from 'lucide-react';

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
import { useAuth, initiateEmailSignIn } from '@/firebase';
import { useUser } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole } from '@/lib/types';
import { BrandLogo } from '@/components/icons';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
  role: z.enum(['ADMIN', 'DEVELOPER', 'BUYER'], {
    required_error: 'You need to select a role.',
  }),
});

const roleRedirectMap: Record<UserRole, string> = {
  ADMIN: '/admin/dashboard',
  DEVELOPER: '/developer/dashboard',
  BUYER: '/buyer/dashboard',
};

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = sessionStorage.getItem('userRole') as UserRole;
      if (storedRole) {
        setRole(storedRole);
      }
    }
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignIn = async (values: z.infer<typeof formSchema>) => {
    const selectedRole = form.getValues('role');
    if (!selectedRole) {
      toast({
        variant: 'destructive',
        title: 'Role not selected',
        description: 'Please select your role before signing in.',
      });
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userRole', selectedRole);
    }
    setRole(selectedRole as UserRole);

    try {
        await initiateEmailSignIn(auth, values.email, values.password);
    } catch (error) {
       if (error instanceof FirebaseError && (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found')) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'The email or password you entered is incorrect.',
        });
      } else if (error instanceof FirebaseError && error.code !== 'auth/popup-closed-by-user') {
        console.error('Login error:', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your login request.',
        });
      }
    }
  }

  useEffect(() => {
    if (!isUserLoading && user && role) {
      const redirectPath = roleRedirectMap[role] || '/';
      router.push(redirectPath);
    }
  }, [user, isUserLoading, role, router]);

  if (isUserLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }
  
  if (user && role) {
    return <div className="flex h-screen w-screen items-center justify-center">Redirecting...</div>; 
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
         <div className="absolute inset-0 bg-zinc-900" />
         <Image 
            src="https://images.unsplash.com/photo-1625301840055-7c1b7198cfc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxzb2xhciUyMHBhbmVsc3xlbnwwfHx8fDE3NjY1NzkxMDN8MA&ixlib=rb-4.1.0&q=80&w=1080" 
            alt="A large-scale solar farm"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-20"
            priority
            data-ai-hint="solar panels"
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <BrandLogo className="h-6 w-6 mr-2" />
          Bharat Carbon Exchange (BCX)
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">&ldquo;The most transparent and efficient platform for carbon credit trading in the region. Our compliance has never been easier.&rdquo;</p>
            <footer className="text-sm">An early BCX Adopter</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex min-h-screen items-center justify-center p-6 lg:p-8 bg-background">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 shadow-lg backdrop-blur-sm">
            <div className="space-y-2 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Welcome Back</h1>
                <p className="text-muted-foreground">Please select your role and enter your credentials to access your dashboard.</p>
            </div>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-6 mt-8">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Your Role</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="shadow-subtle focus:border-primary">
                            <SelectValue placeholder="Select your role" />
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
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} className="pl-10 shadow-subtle border-border/80 focus:border-primary" />
                      </FormControl>
                    </div>
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
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10 shadow-subtle border-border/80 focus:border-primary" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full rounded-lg bg-gradient-to-r from-primary to-emerald-600 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:brightness-110"
              >
                Login
              </Button>
            </form>
          </Form>

           <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
