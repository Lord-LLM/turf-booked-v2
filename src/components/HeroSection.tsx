import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-turf.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Aerial view of football turf" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-turf-dark/90 via-turf-dark/40 to-transparent" />
      </div>

      <div className="container relative flex min-h-[90vh] flex-col items-center justify-center pt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-turf-green/30 bg-turf-green/10 px-4 py-2 backdrop-blur-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-turf-lime" />
            <span className="text-sm font-medium text-turf-lime">Live availability • Book instantly</span>
          </div>

          <h1 className="mb-6 font-display text-5xl font-bold leading-tight tracking-tight text-primary-foreground md:text-7xl">
            Book Your
            <span className="text-gradient-primary"> Perfect Pitch</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-primary-foreground/70">
            Find and reserve sports turfs near you in seconds. Real-time availability, instant booking, secure payments.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/turfs">
              <Button variant="hero" size="xl">
                <Search className="mr-2 h-5 w-5" />
                Explore Turfs
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" size="xl" className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/10">
                <Calendar className="mr-2 h-5 w-5" />
                How It Works
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 grid w-full max-w-2xl grid-cols-3 gap-8"
        >
          {[
            { value: "50+", label: "Turfs Listed" },
            { value: "10K+", label: "Bookings Made" },
            { value: "4.8", label: "Avg Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">{stat.value}</div>
              <div className="mt-1 text-sm text-primary-foreground/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-primary-foreground/10 bg-turf-dark/60 backdrop-blur-xl">
        <div className="container grid grid-cols-1 gap-0 divide-y divide-primary-foreground/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: Search, title: "Search & Filter", desc: "Find turfs by location, size & price" },
            { icon: Calendar, title: "Real-Time Slots", desc: "See live availability instantly" },
            { icon: Shield, title: "Secure Payments", desc: "M-Pesa & card payments supported" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-turf-green/15">
                <f.icon className="h-5 w-5 text-turf-lime" />
              </div>
              <div>
                <div className="text-sm font-semibold text-primary-foreground">{f.title}</div>
                <div className="text-xs text-primary-foreground/50">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
