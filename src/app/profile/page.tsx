'use client';

import { useFirebase, useAuth } from '@/firebase';
import { initiateSignOut } from '@/firebase/non-blocking-login';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SignOutButton } from '@/components/auth/sign-out-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
    const { user, isUserLoading } = useFirebase();
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleSignOut = () => {
        initiateSignOut(auth);
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('userRole');
        }
        router.push('/login');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "UID Copied",
            description: "Your Firebase User ID has been copied to the clipboard.",
        });
    }

    if (isUserLoading || !user) {
        return (
            <div className="container mx-auto flex h-full items-center justify-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Manage your user profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto flex h-full items-center justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your user profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <div className="flex items-center space-x-4">
                            <Avatar>
                                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                                <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.displayName || user.email}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <Separator className="my-6" />

                        <div className="space-y-2">
                            <h4 className="font-medium">Your Firebase UID</h4>
                            <div className="flex items-center justify-between rounded-md border bg-muted p-3">
                                <code className="text-sm text-muted-foreground truncate">{user.uid}</code>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(user.uid)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This is your unique user identifier. You will need this to configure Super Admin access.
                            </p>
                        </div>
                        
                         <Separator className="my-6" />
                        <SignOutButton onClick={handleSignOut} className="mt-6 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
