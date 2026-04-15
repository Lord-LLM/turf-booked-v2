import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Search, CalendarCheck, CreditCard, Trophy, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  { 
    icon: Search, 
    title: "Find a Turf", 
    desc: "Search by location, size, and price to find the perfect pitch for your game.",
    details: [
      "Browse 50+ verified turf locations",
      "Filter by pitch size (5-a-side, 7-a-side, full)",
      "Compare prices and amenities",
      "Read reviews from other players"
    ]
  },
  { 
    icon: CalendarCheck, 
    title: "Pick a Slot", 
    desc: "View real-time availability and select your preferred time.",
    details: [
      "See live availability calendars",
      "Choose peak or off-peak hours",
      "Book recurring weekly slots",
      "Get instant slot confirmation"
    ]
  },
  { 
    icon: CreditCard, 
    title: "Pay Securely", 
    desc: "Confirm with M-Pesa or card. Get instant confirmation.",
    details: [
      "M-Pesa STK push integration",
      "Card payments supported",
      "Secure encrypted transactions",
      "Digital receipts sent instantly"
    ]
  },
  { 
    icon: Trophy, 
    title: "Play!", 
    desc: "Show up and enjoy your game. It's that simple.",
    details: [
      "Receive reminder notifications",
      "Show booking QR code on arrival",
      "Access changing rooms & amenities",
      "Rate your experience after"
    ]
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
              How <span className="text-gradient-primary">TurfBook</span> Works
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Book your perfect pitch in 4 simple steps. No hassle, no phone calls, just instant bookings.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="container">
          <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                {/* Connector line for desktop */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                
                <div className="text-center lg:text-left">
                  {/* Step number badge */}
                  <div className="relative inline-flex mb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary shadow-hero">
                      <step.icon className="h-9 w-9 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground shadow-lg">
                      {i + 1}
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground mb-4">{step.desc}</p>

                  {/* Details list */}
                  <ul className="space-y-2">
                    {step.details.map((detail, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl mb-4">
                Ready to Book Your First Pitch?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of players who book their games hassle-free with TurfBook.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/turfs">
                  <Button size="xl" className="bg-background text-foreground hover:bg-background/90">
                    Find a Turf
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/turfs">
                  <Button size="xl" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Explore Turfs
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
