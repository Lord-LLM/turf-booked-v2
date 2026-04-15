import { motion } from "framer-motion";
import { Star, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { Turf } from "@/data/turfs";

interface TurfCardProps {
  turf: Turf;
  index?: number;
}

export function TurfCard({ turf, index = 0 }: TurfCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={turf.image}
          alt={turf.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-turf-dark/60 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant={turf.available ? "default" : "secondary"} className={turf.available ? "bg-gradient-primary text-primary-foreground" : ""}>
            {turf.available ? "Available" : "Booked"}
          </Badge>
          <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm">
            {turf.type}
          </Badge>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-card/80 px-2.5 py-1 text-sm font-semibold backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-turf-gold text-turf-gold" />
          {turf.rating}
          <span className="text-xs font-normal text-muted-foreground">({turf.reviews})</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-card-foreground">{turf.name}</h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {turf.location}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {turf.amenities.slice(0, 3).map((a) => (
            <span key={a} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{a}</span>
          ))}
          {turf.amenities.length > 3 && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">+{turf.amenities.length - 3}</span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="font-display text-xl font-bold text-foreground">KSh {turf.pricePerHour.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground"> /hr</span>
          </div>
          <Link to={`/book/${turf.id}`}>
            <Button variant="hero" size="sm" disabled={!turf.available}>
              <Clock className="mr-1 h-3.5 w-3.5" />
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
