"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Search, MapPin, Recycle, Calendar, ShoppingCart, Trash2, GitCompare, X,
  Star, TrendingUp, Leaf, SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import { ProjectDetailsModal } from "@/components/ProjectDetailsModal";
import type { CarbonCredit, UserRole } from "@/lib/types";
import { AddToCartDialog } from "@/components/AddToCartDialog";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { carbonCredits as mockCarbonCredits } from "@/lib/mock-data";
import { RemoveProjectDialog } from "@/components/RemoveProjectDialog";
import { CompareCreditsDialog } from "@/components/CompareCreditsDialog";
import { cn } from "@/lib/utils";

/* ─── Credit Card ──────────────────────────────────────────── */
function CreditCard({
  credit,
  isAdmin,
  isInCompare,
  compareDisabled,
  onDetails,
  onPurchase,
  onRemove,
  onToggleCompare,
  index,
}: {
  credit: CarbonCredit;
  isAdmin: boolean;
  isInCompare: boolean;
  compareDisabled: boolean;
  onDetails: () => void;
  onPurchase: () => void;
  onRemove: () => void;
  onToggleCompare: () => void;
  index: number;
}) {
  const fallbackMap: Record<string, string> = {
    Reforestation: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    "Renewable Energy": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
    "Methane Capture": "https://images.unsplash.com/photo-1497435334941-8c899a9bd771?w=800&q=80",
    "Direct Air Capture": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
    Geothermal: "https://images.unsplash.com/photo-1661755877249-b0fe30accbb1?w=800&q=80",
    Hydroelectric: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
    "Wind Energy": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80",
  };

  return (
    <div
      className="group flex flex-col rounded-xl border border-border bg-card shadow-card overflow-hidden card-hover animate-slide-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        <Image
          src={credit.imageUrl}
          alt={credit.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={credit.imageHint}
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.onerror = null;
            t.src = fallbackMap[credit.projectType] ?? fallbackMap["Reforestation"];
          }}
        />
        {/* Price badge */}
        <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1">
          ${credit.price.toFixed(2)}/ton
        </span>
        {/* Project type */}
        <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/50 backdrop-blur-sm text-white/90 text-[10px] font-medium px-2 py-0.5 flex items-center gap-1">
          <Leaf className="h-2.5 w-2.5" />
          {credit.projectType}
        </span>
        {/* Remove button (admin) */}
        {isAdmin && (
          <button
            onClick={onRemove}
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
          {credit.name}
        </h3>

        {/* Meta */}
        <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" /> {credit.origin}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" /> Vintage {credit.vintageYear}
          </span>
        </div>

        {/* Integrity score */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium">
            <span className="text-muted-foreground">Integrity Score</span>
            <span className="text-foreground font-semibold">{credit.qualityMetrics.integrityScore}</span>
          </div>
          <Progress value={credit.qualityMetrics.integrityScore} className="h-1.5" />
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2 pt-1">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onDetails}>
              Details
            </Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={onPurchase}>
              <ShoppingCart className="h-3 w-3" />
              Add to Cart
            </Button>
          </div>
          <Button
            variant={isInCompare ? "default" : "ghost"}
            size="sm"
            className="h-7 text-[11px] gap-1"
            onClick={onToggleCompare}
            disabled={!isInCompare && compareDisabled}
          >
            <GitCompare className="h-3 w-3" />
            {isInCompare ? "In Compare" : "Compare"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<CarbonCredit | null>(null);
  const [selectedProjectForPurchase, setSelectedProjectForPurchase] = useState<CarbonCredit | null>(null);
  const [selectedProjectForRemoval, setSelectedProjectForRemoval] = useState<CarbonCredit | null>(null);
  const [compareList, setCompareList] = useState<CarbonCredit[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const { user } = useUser();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = sessionStorage.getItem("userRole") as UserRole;
      if (storedRole) setUserRole(storedRole);
    }
  }, [user]);

  const isAdmin = userRole === "ADMIN";
  const firestore = useFirestore();

  const carbonCreditsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "carbonCredits"), where("verificationStatus", "==", "Verified"));
  }, [firestore]);

  const { data: liveCredits, isLoading } = useCollection<CarbonCredit>(carbonCreditsQuery);

  const allCredits = useMemo(() => {
    const verifiedMockCredits = mockCarbonCredits.filter((mc) => mc.verificationStatus === "Verified");
    const safeLiveCredits = liveCredits || [];
    const liveCreditIds = new Set(safeLiveCredits.map((c) => c.id));
    const mockCreditsToShow = verifiedMockCredits.filter((mc) => !liveCreditIds.has(mc.id));
    return [...safeLiveCredits, ...mockCreditsToShow];
  }, [liveCredits]);

  const filteredCredits = useMemo(() => {
    return allCredits.filter((credit) => {
      const matchesSearch = credit.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === "all" || credit.origin === selectedCountry;
      const matchesType = selectedType === "all" || credit.projectType === selectedType;
      return matchesSearch && matchesCountry && matchesType;
    });
  }, [searchQuery, selectedCountry, selectedType, allCredits]);

  const uniqueCountries = useMemo(() => [...new Set(allCredits.map((c) => c.origin))], [allCredits]);
  const uniqueTypes = useMemo(() => [...new Set(allCredits.map((c) => c.projectType as string))], [allCredits]);

  const toggleCompare = (credit: CarbonCredit) => {
    setCompareList((prev) => {
      const exists = prev.find((c) => c.id === credit.id);
      if (exists) return prev.filter((c) => c.id !== credit.id);
      if (prev.length >= 3) return prev;
      return [...prev, credit];
    });
  };

  const hasFilters = searchQuery || selectedCountry !== "all" || selectedType !== "all";

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 animate-slide-up">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <Leaf className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Carbon Credit Marketplace</h1>
          <Badge variant="secondary" className="ml-1 text-xs">
            {allCredits.length} projects
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground ml-10">
          Browse and trade verified carbon credits from projects around the world.
        </p>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up delay-75">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={selectedCountry} onValueChange={(v) => setSelectedCountry(v ?? "all")}>
            <SelectTrigger className="h-9 w-[150px] text-sm">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {uniqueCountries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v ?? "all")}>
            <SelectTrigger className="h-9 w-[150px] text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs text-muted-foreground gap-1"
              onClick={() => { setSearchQuery(""); setSelectedCountry("all"); setSelectedType("all"); }}
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Results count ────────────────────────────────────── */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground animate-fade-in">
          Showing <span className="font-semibold text-foreground">{filteredCredits.length}</span> of{" "}
          <span className="font-semibold text-foreground">{allCredits.length}</span> projects
        </p>
      )}

      {/* ── Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2 w-full" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </div>
            </div>
          ))
        ) : filteredCredits.length > 0 ? (
          filteredCredits.map((credit, i) => (
            <CreditCard
              key={credit.id}
              credit={credit}
              isAdmin={isAdmin}
              isInCompare={!!compareList.find((c) => c.id === credit.id)}
              compareDisabled={compareList.length >= 3}
              onDetails={() => setSelectedProjectForDetails(credit)}
              onPurchase={() => setSelectedProjectForPurchase(credit)}
              onRemove={() => setSelectedProjectForRemoval(credit)}
              onToggleCompare={() => toggleCompare(credit)}
              index={i}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center gap-3 animate-fade-in">
            <Leaf className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">No projects match your criteria.</p>
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearchQuery(""); setSelectedCountry("all"); setSelectedType("all"); }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────── */}
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
      <CompareCreditsDialog
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        credits={compareList}
      />

      {/* ── Compare Float Bar ───────────────────────────────── */}
      {compareList.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-emerald-700 dark:bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-2xl animate-slide-up">
          <TrendingUp className="h-4 w-4 shrink-0" />
          <span className="text-sm font-semibold">{compareList.length} selected</span>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs ml-1"
            onClick={() => setIsCompareOpen(true)}
          >
            Compare Now
          </Button>
          <button
            onClick={() => setCompareList([])}
            className="ml-1 hover:opacity-70 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
