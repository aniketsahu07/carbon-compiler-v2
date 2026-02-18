'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { CreditCard } from 'lucide-react';
import { GooglePayIcon } from '@/components/icons/google-pay';

const formSchema = z.object({
  fullName: z.string().min(3, {
    message: 'Full name must be at least 3 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

export default function CheckoutPage() {
  const { cart, totalCost, isCartLoading, purchaseCartItems, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading: isUserAuthLoading } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
    },
  });
  
  useEffect(() => {
    if (!isUserAuthLoading && !user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Required',
            description: 'You need to be logged in to proceed to checkout.',
        });
        router.push('/login');
    }
  },[user, isUserAuthLoading, router, toast])

  useEffect(() => {
      if(user) {
          form.setValue('fullName', user.displayName || '');
          form.setValue('email', user.email || '');
      }
  }, [user, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        // This function will now move items from cart to portfolio in Firestore
        await purchaseCartItems();

        toast({
            title: 'Payment Successful!',
            description: 'Your carbon credits have been added to your portfolio.',
        });

        router.push('/buyer/dashboard');

    } catch (error) {
        console.error('Purchase Error:', error);
        toast({
            variant: 'destructive',
            title: 'Purchase Error',
            description: 'Could not complete the purchase. Please try again.',
        });
    } finally {
        setIsProcessing(false);
    }
  }

  const isLoading = isUserAuthLoading || isCartLoading || isProcessing;

  if (isLoading && cart.length === 0) {
      return (
          <div className="container mx-auto flex h-full items-center justify-center">
              <p>Loading...</p>
          </div>
      )
  }

  if (!isCartLoading && cart.length === 0) {
      return (
          <div className="container mx-auto flex h-full items-center justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Checkout</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center py-16">Your cart is empty. Add items from the marketplace to proceed.</p>
                    </CardContent>
                </Card>
          </div>
      )
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review the items in your cart.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.quantity} x ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>${totalCost.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KYC & Payment */}
        <div className="md:col-span-1">
           <Card>
             <CardHeader>
              <CardTitle>Billing & Payment</CardTitle>
              <CardDescription>Enter your details to complete the purchase.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 space-y-3">
                     <Button type="submit" className="w-full" size="lg" disabled={isLoading || cart.length === 0}>
                      {isProcessing ? (
                        'Processing...'
                      ) : (
                        <>
                         <CreditCard className="mr-2" />
                         Pay with Card (Simulated)
                        </>
                      )}
                    </Button>
                     <Button type="button" className="w-full bg-black hover:bg-black/80 text-white" size="lg" disabled={isLoading || cart.length === 0} onClick={() => onSubmit(form.getValues())}>
                      <GooglePayIcon className="mr-2" />
                       (Simulated)
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
