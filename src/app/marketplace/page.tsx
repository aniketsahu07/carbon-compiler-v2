
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Recycle, Calendar, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ProjectDetailsModal } from '@/components/ProjectDetailsModal';
import type { CarbonCredit, UserRole } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { AddToCartDialog } from '@/components/AddToCartDialog';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { carbonCredits as mockCarbonCredits } from '@/lib/mock-data';
import { RemoveProjectDialog } from '@/components/RemoveProjectDialog';

export default function MarketplacePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<CarbonCredit | null>(null);
    const [selectedProjectForPurchase, setSelectedProjectForPurchase] = useState<CarbonCredit | null>(null);
    const [selectedProjectForRemoval, setSelectedProjectForRemoval] = useState<CarbonCredit | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    
    const { user } = useUser();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedRole = sessionStorage.getItem('userRole') as UserRole;
            if (storedRole) {
                setUserRole(storedRole);
            }
        }
    }, [user]);

    const isAdmin = userRole === 'ADMIN';

    const firestore = useFirestore();
    const carbonCreditsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'carbonCredits'), where('verificationStatus', '==', 'Verified'));
    }, [firestore]);

    const { data: liveCredits, isLoading } = useCollection<CarbonCredit>(carbonCreditsQuery);

    const allCredits = useMemo(() => {
        const verifiedMockCredits = mockCarbonCredits.filter(mc => mc.verificationStatus === 'Verified');
        const safeLiveCredits = liveCredits || [];

        const liveCreditIds = new Set(safeLiveCredits.map(c => c.id));
        const mockCreditsToShow = verifiedMockCredits.filter(
            mc => !liveCreditIds.has(mc.id)
        );
        
        return [...safeLiveCredits, ...mockCreditsToShow];
    }, [liveCredits]);


    const filteredCredits = useMemo(() => {
        const creditsToFilter = allCredits || [];
        return creditsToFilter.filter((credit) => {
            const matchesSearch = credit.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCountry = selectedCountry === 'all' || credit.origin === selectedCountry;
            const matchesType = selectedType === 'all' || credit.projectType === selectedType;
            return matchesSearch && matchesCountry && matchesType;
        });
    }, [searchQuery, selectedCountry, selectedType, allCredits]);

    const uniqueCountries = useMemo(() => {
        return [...new Set(allCredits.map(credit => credit.origin))];
    }, [allCredits]);

    const uniqueTypes = useMemo(() => {
        return [...new Set(allCredits.map(credit => credit.projectType as string))];
    }, [allCredits]);


    return (
        <div className="container mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Carbon Credit Marketplace</CardTitle>
                    <CardDescription>Browse and trade verified carbon credits from projects around the world.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search projects..." 
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={selectedCountry} onValueChange={(value) => setSelectedCountry(value ?? 'all')}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by Country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Countries</SelectItem>
                                {uniqueCountries.map(country => (
                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedType} onValueChange={(value) => setSelectedType(value ?? 'all')}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                 {uniqueTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <Card key={i} className="flex flex-col">
                                    <CardHeader className="p-0">
                                        <Skeleton className="h-48 w-full rounded-t-lg" />
                                        <div className="p-6 pb-2">
                                            <Skeleton className="h-7 w-3/4 mb-2" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-3 pt-2">
                                        <div className="space-y-2 pt-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex gap-2">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </CardFooter>
                                </Card>
                            ))
                        ) : filteredCredits.length > 0 ? (
                            filteredCredits.map((credit) => (
                                <Card key={credit.id} className="flex flex-col relative group">
                                    {isAdmin && (
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setSelectedProjectForRemoval(credit)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Remove Project</span>
                                        </Button>
                                    )}
                                    <CardHeader className="p-0">
                                        <div className="relative h-48 w-full">
                                            <Image
                                                src={credit.imageUrl}
                                                alt={credit.name}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                style={{objectFit: "cover"}}
                                                className="rounded-t-lg"
                                                data-ai-hint={credit.imageHint}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.srcset = '/images/placeholder.png';
                                                    target.src = '/images/placeholder.png';
                                                }}
                                            />
                                            <Badge variant="secondary" className="absolute top-2 left-2">${credit.price.toFixed(2)} / ton</Badge>
                                        </div>
                                        <div className="p-6 pb-2">
                                            <CardTitle className="text-xl h-14 line-clamp-2">{credit.name}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-3 pt-2">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span>Integrity Score</span>
                                                <span>{credit.qualityMetrics.integrityScore}</span>
                                            </div>
                                            <Progress value={credit.qualityMetrics.integrityScore} />
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground pt-2">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            <span>{credit.origin}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Recycle className="mr-2 h-4 w-4" />
                                            <span>{credit.projectType}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            <span>Vintage {credit.vintageYear}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex gap-2">
                                        <Button variant="outline" className="w-full" onClick={() => setSelectedProjectForDetails(credit)}>
                                            Details
                                        </Button>
                                        <Button className="w-full" onClick={() => setSelectedProjectForPurchase(credit)}>
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Add to Cart
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-muted-foreground py-16">
                                <p>No projects match your criteria.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
             {selectedProjectForDetails && (
                <ProjectDetailsModal
                    project={selectedProjectForDetails}
                    isOpen={!!selectedProjectForDetails}
                    onClose={() => setSelectedProjectForDetails(null)}
                />
            )}
            {selectedProjectForPurchase && (
                <AddToCartDialog
                    project={selectedProjectForPurchase}
                    isOpen={!!selectedProjectForPurchase}
                    onClose={() => setSelectedProjectForPurchase(null)}
                />
            )}
            {selectedProjectForRemoval && (
                <RemoveProjectDialog
                    project={selectedProjectForRemoval}
                    isOpen={!!selectedProjectForRemoval}
                    onClose={() => setSelectedProjectForRemoval(null)}
                />
            )}
        </div>
    )
}

    