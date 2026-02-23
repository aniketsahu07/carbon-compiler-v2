import { BrandLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Lock,
  Shield,
  Leaf,
  BarChart3,
  Globe2,
  Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: CheckCircle,
    title: "Prevent Greenwashing",
    description:
      "Immutable records and single-use claims ensure every carbon credit is verifiably retired, eliminating double counting.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    icon: Shield,
    title: "Regulatory Compliance",
    description:
      "Built-in logic for Nationally Determined Contributions (NDC) and Corresponding Adjustments to meet international standards.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: Lock,
    title: "Blockchain Transparency",
    description:
      "Every transaction from issuance to retirement is logged on a public, append-only ledger for complete auditability.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
];

const stats = [
  { label: "Projects Listed", value: "120+", icon: Leaf },
  { label: "Credits Verified", value: "2.4M", icon: CheckCircle },
  { label: "tCO2e Retired", value: "850K", icon: BarChart3 },
  { label: "Countries", value: "18", icon: Globe2 },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-24 pb-16">
      <section className="relative pt-12 pb-4 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-20 mx-auto h-[380px] w-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(ellipse, hsl(158 64% 40%) 0%, transparent 70%)" }}
        />
        <div className="relative flex justify-center mb-6 animate-slide-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-200 dark:ring-emerald-800/50 shadow-glow-sm">
            <BrandLogo className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <h1 className="relative text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground animate-slide-up delay-75">
          Bharat Carbon Exchange
          <span className="block text-emerald-600 dark:text-emerald-400">(BCX)</span>
        </h1>
        <p className="relative mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up delay-150">
          India&apos;s verifiable, transparent, and compliant platform for trading carbon credits --
          aligned with national climate commitments and international standards.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3 animate-slide-up delay-225">
          <Button size="lg" asChild className="gap-2 shadow-glow-sm">
            <Link href="/marketplace">
              Explore Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/ledger">View Public Ledger</Link>
          </Button>
        </div>
      </section>

      <section className="animate-slide-up delay-300">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5 text-center shadow-card card-hover animate-slide-up"
              style={{ animationDelay: `${i * 60 + 300}ms` }}
            >
              <s.icon className="mx-auto h-6 w-6 text-emerald-500 mb-2" />
              <p className="text-2xl font-bold tabular-nums text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="text-center mb-10 animate-slide-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
            <Zap className="h-3 w-3" />
            Why BCX
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Built for Integrity</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
            Every feature is designed to ensure credibility, verifiability, and compliance at every step.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 shadow-card card-hover animate-slide-up"
              style={{ animationDelay: `${i * 80 + 200}ms` }}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl mb-4 ${f.bg}`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-slide-up">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/30 dark:to-emerald-900/20 p-8 md:p-12 text-center shadow-card-md">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(158 64% 45%) 0%, transparent 70%)" }}
          />
          <h2 className="relative text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Ready to take climate action?
          </h2>
          <p className="relative text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Join BCX and trade verified carbon credits that directly support India&apos;s climate goals.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild className="gap-2">
              <Link href="/signup">Get Started Free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/calculator">Carbon Calculator</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
