import { turfs } from "@/data/turfs";
import { TurfCard } from "./TurfCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function FeaturedTurfs() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Popular Turfs
            </h2>
            <p className="mt-2 text-muted-foreground">Top-rated pitches near you</p>
          </div>
          <Link to="/turfs">
            <Button variant="ghost" className="hidden sm:flex">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {turfs.slice(0, 3).map((turf, i) => (
            <TurfCard key={turf.id} turf={turf} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
