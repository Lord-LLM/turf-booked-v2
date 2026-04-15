import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <img src="/logo.png" alt="TurfBook" className="h-9 w-9 rounded-lg object-cover" />
            TurfBook
          </Link>
          <p className="text-sm text-muted-foreground">
            © 2026 TurfBook — Dedan Kimathi University of Technology
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/turfs" className="hover:text-foreground transition-colors">Turfs</Link>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
