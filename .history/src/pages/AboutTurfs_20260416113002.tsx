import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeaturedTurfs } from "@/components/FeaturedTurfs";
import { Button } from "@/components/ui/button";
import { Search, Calendar, MapPin, Users, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AboutTurfs() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
              Discover <span className="text-gradient-primary">Premium Turfs</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Find the perfect pitch for your game. Browse our curated selection of top-quality sports facilities.
            </p>
          </motion.div>

          {/* Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto"
          >
            {/* Find a Turf Card */}
            <div className="group">
              <Link to="/turfs" className="block h-full">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card transition-all hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 blur-3xl" />
                  <div className="relative flex flex-col h-full">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-hero mb-6">
                      <Search className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-card-foreground mb-3">
                      Find a Turf
                    </h3>
                    <p className="text-muted-foreground mb-6 flex-1">
                      Search by location, size, and price to find the perfect pitch for your game. Filter by amenities and availability.
                    </p>
                    <Button variant="hero" className="group-hover:scale-105 transition-transform w-full" onClick={(e) => { e.preventDefault(); window.location.href = "/turfs"; }}>
                      Explore Turfs
                      <MapPin className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            </div>

            {/* View Bookings Card */}
            <Link to="/bookings" className="group">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card transition-all hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 blur-3xl" />
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-hero mb-6">
                    <Calendar className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-card-foreground mb-3">
                    View Bookings
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Check your confirmed bookings and manage your game schedule. View all your reserved turfs in one place.
                  </p>
                  <Button variant="outline" className="group-hover:scale-105 transition-transform">
                    My Bookings
                    <Clock className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: MapPin, title: "50+ Locations", desc: "Turfs across Nairobi and beyond" },
              { icon: Users, title: "All Sizes", desc: "5-a-side, 7-a-side, and full-size pitches" },
              { icon: Star, title: "Top Rated", desc: "Verified reviews from real players" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 rounded-xl bg-card p-6 border border-border"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-card-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Turfs */}
      <FeaturedTurfs />

      <Footer />
    </div>
  );
}
