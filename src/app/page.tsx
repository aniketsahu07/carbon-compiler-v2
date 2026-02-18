import { BrandLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Lock, Shield } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto">
      <section className="text-center py-20">
        <div className="flex justify-center mb-4">
          <BrandLogo className="h-20 w-20 text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-primary">
          Bharat Carbon Exchange (BCX)
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          A verifiable, transparent, and compliant platform for trading carbon credits under India's climate commitments.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/marketplace">
              Explore Marketplace <ArrowRight className="ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/ledger">
              View Public Ledger
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 py-16">
        <Card>
          <CardHeader className="items-center text-center">
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <CardTitle>Prevent Greenwashing</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Immutable records and single-use claims ensure that every carbon credit is verifiably retired, preventing double counting.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="items-center text-center">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <CardTitle>Regulatory Compliance</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Built-in logic for Nationally Determined Contributions (NDC) and Corresponding Adjustments (CA) to meet international standards.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="items-center text-center">
            <Lock className="h-12 w-12 text-primary mb-4" />
            <CardTitle>Blockchain-like Transparency</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Every transaction, from issuance to retirement, is logged on a public, append-only ledger for complete auditability.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
