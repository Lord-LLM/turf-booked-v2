import { motion } from "framer-motion";
import { Search, CalendarCheck, CreditCard, Trophy } from "lucide-react";

const steps = [
  { icon: Search, title: "Find a Turf", desc: "Search by location, size, and price to find the perfect pitch." },
  { icon: CalendarCheck, title: "Pick a Slot", desc: "View real-time availability and select your preferred time." },
  { icon: CreditCard, title: "Pay Securely", desc: "Confirm with M-Pesa or card. Get instant confirmation." },
  { icon: Trophy, title: "Play!", desc: "Show up and enjoy your game. It's that simple." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/50 py-20">
      <div className="container">
        <div className="mb-14 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
          <p className="mt-2 text-muted-foreground">Book your pitch in 4 simple steps</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-hero">
                <step.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="absolute -top-2 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-accent font-display text-xs font-bold text-accent-foreground">
                {i + 1}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
