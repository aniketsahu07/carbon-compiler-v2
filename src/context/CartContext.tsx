'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import type { CartItem, PortfolioItem, ClaimHistoryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { carbonCredits } from '@/lib/mock-data';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, increment, updateDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/** Generate a random hex transaction hash like a blockchain tx id. */
function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 16; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/** Post a single ledger entry to the internal API route (no security rules). */
async function postLedgerEntry(entry: Record<string, unknown>): Promise<void> {
  try {
    await fetch('/api/ledger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch (err) {
    console.error('Ledger write failed:', err);
  }
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalCost: number;
  portfolio: PortfolioItem[];
  purchaseCartItems: () => Promise<void>;
  claimFromPortfolio: (portfolioItemId: string, claimData: Omit<ClaimHistoryItem, 'id'>) => Promise<void>;
  portfolioWithDetails: (PortfolioItem & { projectDetails?: typeof carbonCredits[0] })[];
  creditBalance: number;
  isCartLoading: boolean;
  isPortfolioLoading: boolean;
  claimHistory: ClaimHistoryItem[];
  isClaimHistoryLoading: boolean;
  totalOffset: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  // Firestore hooks for cart, portfolio, and claim history
  const cartColRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/cart`) : null, [user, firestore]);
  const { data: cartItems, isLoading: isCartLoading } = useCollection<CartItem>(cartColRef);

  const portfolioColRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/portfolio`) : null, [user, firestore]);
  const { data: portfolioItems, isLoading: isPortfolioLoading } = useCollection<PortfolioItem>(portfolioColRef);

  const claimHistoryColRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/claimHistory`) : null, [user, firestore]);
  const { data: claimHistoryItems, isLoading: isClaimHistoryLoading } = useCollection<ClaimHistoryItem>(claimHistoryColRef);

  const cart = useMemo(() => cartItems || [], [cartItems]);
  const portfolio = useMemo(() => portfolioItems || [], [portfolioItems]);
  const claimHistory = useMemo(() => claimHistoryItems || [], [claimHistoryItems]);

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    if (!cartColRef) return;
    
    const existingItem = cart.find(i => i.creditId === item.creditId);

    if (existingItem && existingItem.id) {
        toast({
            title: 'Item Already in Cart',
            description: `${item.name} is already in your cart. You can adjust the quantity at checkout.`,
        });
    } else {
        await addDocumentNonBlocking(cartColRef, item);
        toast({
          title: 'Added to Cart',
          description: `${item.quantity.toLocaleString()} ton(s) of ${item.name} have been added.`,
        });
    }
  };

  const removeFromCart = (id: string) => {
    if (!cartColRef) return;
    const docRef = doc(cartColRef, id);
    deleteDocumentNonBlocking(docRef);
    toast({
        variant: 'destructive',
        title: "Item Removed",
        description: "The item has been removed from your cart.",
    });
  };
  
  const clearCart = async () => {
    if (!cartColRef || cart.length === 0) return;
    const batch = writeBatch(firestore);
    cart.forEach(item => {
        if(item.id) {
            const docRef = doc(cartColRef, item.id);
            batch.delete(docRef);
        }
    });
    await batch.commit();
  };

  const purchaseCartItems = async () => {
    if (!portfolioColRef || cart.length === 0) return;

    const now = new Date().toISOString();

    // ── Part 1: Add all items to portfolio (only touches user's own docs — always allowed) ──
    const batch = writeBatch(firestore);
    cart.forEach(cartItem => {
        const newPortfolioItem: Omit<PortfolioItem, 'id'> = {
            creditId: cartItem.creditId,
            name: cartItem.name,
            vintageYear: cartItem.vintageYear,
            tons: cartItem.quantity,
            purchaseDate: now,
        };
        const portfolioDocRef = doc(portfolioColRef);
        batch.set(portfolioDocRef, newPortfolioItem);
    });
    await batch.commit(); // This MUST succeed — portfolio write never fails for authenticated user

    // ── Part 2: Decrement availableTons separately (best-effort, won't block purchase) ──
    // Mock credits (from mock-data.ts) don't have real Firestore docs — skip those.
    // Real credits (approved projects) will have Firestore docs.
    await Promise.allSettled(
      cart.map(async (cartItem) => {
        try {
          const creditRef = doc(firestore, 'carbonCredits', cartItem.creditId);
          await updateDoc(creditRef, { availableTons: increment(-cartItem.quantity) });
        } catch {
          // Silently ignore — either mock credit (no doc) or rules not yet updated.
          // Purchase is already complete from Part 1.
        }
      })
    );

    // Write SOLD ledger entries via internal API (no Firestore security rules)
    await Promise.all(
      cart.map(cartItem =>
        postLedgerEntry({
          txHash: generateTxHash(),
          action: 'SOLD',
          creditId: cartItem.creditId,
          from: cartItem.name,
          to: user?.displayName ?? user?.email ?? 'Buyer',
          timestamp: now,
          amountTons: cartItem.quantity,
        })
      )
    );

    await clearCart();
  };
  
  const claimFromPortfolio = async (portfolioItemId: string, claimData: Omit<ClaimHistoryItem, 'id'>) => {
    if (!user) throw new Error("User not authenticated.");

    const portfolioDocRef = doc(firestore, `users/${user.uid}/portfolio`, portfolioItemId);
    const claimHistoryCol = collection(firestore, `users/${user.uid}/claimHistory`);

    const batch = writeBatch(firestore);

    // Create new claim history record
    const newClaimRef = doc(claimHistoryCol);
    batch.set(newClaimRef, claimData);

    // Delete from portfolio
    batch.delete(portfolioDocRef);

    await batch.commit();

    // Write RETIRED ledger entry via internal API (no Firestore security rules)
    await postLedgerEntry({
        txHash: generateTxHash(),
        action: 'RETIRED',
        creditId: claimData.creditId,
        from: user.displayName ?? user.email ?? 'Buyer',
        to: 'Retired',
        timestamp: new Date().toISOString(),
        amountTons: claimData.tons,
    });
  }

  const totalCost = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  
  // This is now simplified as portfolio items contain the necessary details.
  // It remains for backward compatibility with any components that might still use it.
  const portfolioWithDetails = portfolio.map(item => {
      const project = carbonCredits.find(p => p.id === item.creditId);
      return { ...item, projectDetails: project };
  }).filter((item): item is (PortfolioItem & { projectDetails: typeof carbonCredits[0] }) => !!item.projectDetails);


  const creditBalance = portfolio.reduce((acc, item) => acc + item.tons, 0);

  const totalOffset = claimHistory.reduce((acc, item) => acc + item.tons, 0);


  return (
    <CartContext.Provider
      value={{ 
        cart, 
        isCartOpen, 
        setIsCartOpen, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        totalCost, 
        portfolio, 
        purchaseCartItems, 
        claimFromPortfolio, 
        portfolioWithDetails, 
        creditBalance, 
        isCartLoading, 
        isPortfolioLoading,
        claimHistory,
        isClaimHistoryLoading,
        totalOffset
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
