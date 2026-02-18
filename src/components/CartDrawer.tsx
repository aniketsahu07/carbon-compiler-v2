'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, totalCost } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {cart.length > 0
              ? 'Review the items in your cart before checkout.'
              : 'Your cart is currently empty.'}
          </SheetDescription>
        </SheetHeader>
        
        {cart.length > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 p-6 pt-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} ton(s) @ ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="p-6 sm:flex-col sm:items-stretch sm:gap-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Cost:</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
              <SheetClose asChild>
                <Button size="lg" asChild>
                    <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="text-muted-foreground">Add items from the marketplace to get started.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
