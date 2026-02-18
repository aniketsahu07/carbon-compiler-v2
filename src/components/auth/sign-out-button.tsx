'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function SignOutButton(props: ButtonProps) {
    return (
        <Button variant="outline" {...props}>
            <LogOut className="mr-2" />
            Sign Out
        </Button>
    );
}
