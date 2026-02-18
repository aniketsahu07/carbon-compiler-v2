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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CarbonCredit, CartItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

interface AddToCartDialogProps {
  project: CarbonCredit;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToCartDialog({ project, isOpen, onClose }: AddToCartDialogProps) {
  const [quantity, setQuantity] = useState(100);
  const { addToCart } = useCart();
  const { user } = useUser();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!user) {
        router.push('/login');
        return;
    }

    if (quantity <= 0) {
      return;
    }
    
    if (quantity > project.availableTons) {
        return;
    }

    const itemToAdd: Omit<CartItem, 'id'> = {
      creditId: project.id,
      name: project.name,
      price: project.price,
      quantity: quantity,
      vintageYear: project.vintageYear,
    }

    addToCart(itemToAdd);
    
    onClose();
    setQuantity(100);
  };

  const totalCost = (quantity * project.price).toFixed(2);

  const handleQuantityChange = (amount: number) => {
      setQuantity(prev => {
          const newQuantity = prev + amount;
          if (newQuantity < 100) return 100;
          if (newQuantity > project.availableTons) return project.availableTons;
          return newQuantity;
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Cart</DialogTitle>
          <DialogDescription>
            Specify how many tons of carbon credits you would like to purchase from the{' '}
            <span className="font-semibold text-foreground">{project.name}</span> project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (in tons)</Label>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-100)} disabled={quantity <= 100}>
                    <Minus className="h-4 w-4" />
                </Button>
                <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="100"
                    step="100"
                    max={project.availableTons}
                    className="text-lg text-center"
                />
                 <Button variant="outline" size="icon" onClick={() => handleQuantityChange(100)} disabled={quantity >= project.availableTons}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
             <p className="text-sm text-muted-foreground">
                Available: {project.availableTons.toLocaleString()} tons
            </p>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Cost:</span>
              <span>${totalCost}</span>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
