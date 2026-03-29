import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  Search,
  FileText,
  CreditCard,
  Star,
  ArrowRight,
  Home,
  Users,
  TrendingUp,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    description:
      "Every property is manually reviewed and landlord identity confirmed before going live.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Filter by location, price, and trust score to find the perfect fit faster.",
  },
  {
    icon: FileText,
    title: "Transparent Applications",
    description:
      "See exactly where your application stands in real time — no ghosting, no guesswork.",
  },
  {
    icon: CreditCard,
    title: "Escrow Payments",
    description:
      "Rent is held securely in escrow and released only when both parties confirm.",
  },
];

const steps = [
  {
    step: "01",
    role: "Tenant",
    title: "Search & Apply",
    description:
      "Browse verified listings, submit an application with your verified profile, and track its status live.",
  },
  {
    step: "02",
    role: "Landlord",
    title: "Review & Approve",
    description:
      "Receive structured applications with trust scores. Approve or decline with one click.",
  },
  {
    step: "03",
    role: "Both",
    title: "Move In & Pay",
    description:
      "Sign the digital lease, pay securely through TrustRent escrow, and build your reputation.",
  },
];

const testimonials = [
  {
    name: "Amara O.",
    role: "Tenant",
    quote:
      "I found my apartment in 4 days and never once felt like I was being scammed. TrustRent changed renting for me.",
    avatar: "AO",
  },
  {
    name: "David K.",
    role: "Landlord",
    quote:
      "I used to spend weeks vetting applicants. TrustRent gives me everything I need before I even pick up the phone.",
    avatar: "DK",
  },
  {
    name: "Priya M.",
    role: "Tenant",
    quote:
      "The escrow payment feature alone is worth it. I finally feel protected as a renter.",
    avatar: "PM",
  },
];

const stats = [
  { icon: Home, value: "12,400+", label: "Verified Properties" },
  { icon: Users, value: "38,000+", label: "Trusted Users" },
  { icon: TrendingUp, value: "97%", label: "Dispute-Free Tenancies" },
];

// ─── Navbar ───────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-bold tracking-tight">TrustRent</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
          <Link href="#testimonials" className="hover:text-foreground transition-colors">Reviews</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>Log in</Link>
          <Link href="/signup" className={cn(buttonVariants(), "bg-emerald-600 hover:bg-emerald-700 text-white")}>Get Started</Link>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-24 md:py-36">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[700px] w-[700px] rounded-full border border-emerald-100 opacity-50" />
        <div className="absolute h-[450px] w-[450px] rounded-full border border-emerald-200 opacity-40" />
      </div>

      <div className="container mx-auto relative flex flex-col items-center text-center gap-6 px-6">
        <Badge
          variant="secondary"
          className="bg-emerald-100 text-emerald-800 border-emerald-200 text-sm px-4 py-1"
        >
          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
          Trust-First Renting
        </Badge>

        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Renting built on{" "}
          <span className="text-emerald-600">verified trust</span>,{" "}
          not blind hope.
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
          TrustRent connects tenants and landlords through transparency,
          identity verification, and secure escrow payments — so every rental
          experience is one worth repeating.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link
            href="/signup?role=tenant"
            className={cn(buttonVariants({ size: "lg" }), "bg-emerald-600 hover:bg-emerald-700 text-white gap-2")}
          >
            Find a Home <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/signup?role=landlord"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "gap-2")}
          >
            List Your Property <Home className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-10">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-2xl font-bold text-emerald-700">
                <Icon className="h-5 w-5" />
                {value}
              </div>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────

function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why TrustRent?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            We removed every reason to distrust the rental process and replaced
            it with systems that protect both sides.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="group hover:shadow-md hover:border-emerald-200 transition-all"
            >
              <CardContent className="pt-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple. Transparent. Trusted.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Three steps to a rental relationship that works for everyone.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map(({ step, role, title, description }) => (
            <div key={step} className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <span className="text-5xl font-black text-emerald-100 leading-none select-none">
                  {step}
                </span>
                <div>
                  <Badge variant="outline" className="mb-2 text-xs">
                    {role}
                  </Badge>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────

function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Real people. Real rentals.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map(({ name, role, quote, avatar }) => (
            <Card key={name} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 flex flex-col gap-4">
                <div className="flex text-emerald-500 gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &ldquo;{quote}&rdquo;
                </p>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-20 bg-emerald-600">
      <div className="container mx-auto flex flex-col items-center text-center gap-6 px-6">
        <ShieldCheck className="h-12 w-12 text-white/80" />
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl max-w-xl">
          Start renting the way it should always have been.
        </h2>
        <p className="text-emerald-100 max-w-md">
          Join thousands of landlords and tenants who chose trust over hope.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup?role=tenant"
            className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "bg-white text-emerald-700 hover:bg-emerald-50 gap-2")}
          >
            I&apos;m a Tenant <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/signup?role=landlord"
            className={cn(buttonVariants({ size: "lg" }), "bg-emerald-800 hover:bg-emerald-900 text-white gap-2")}
          >
            I&apos;m a Landlord <Home className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t py-10 bg-background">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground px-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold text-foreground">TrustRent</span>
          <span>— Trust-First Renting</span>
        </div>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
        </div>
        <p>© {new Date().getFullYear()} TrustRent. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
