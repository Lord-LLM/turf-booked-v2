import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Turfs", to: "/turfs" },
  { label: "How It Works", to: "/how-it-works" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isLoading, logout, loginWithRedirect, user } = useAuth0();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <img src="/logo.png" alt="TurfBook" className="h-10 w-10 rounded-lg object-cover" />
          TurfBook
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {!isLoading && (
            isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/mybookings"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Bookings
                </Link>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => loginWithRedirect()}
                >
                  Log In
                </Button>
                <Button 
                  variant="hero" 
                  size="sm"
                  onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })}
                >
                  Sign Up
                </Button>
              </>
            )
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="container flex flex-col gap-2 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2 flex-col">
                <ThemeToggle />
                {!isLoading && (
                  isAuthenticated ? (
                    <>
                      <p className="px-4 py-2 text-sm text-muted-foreground">{user?.email}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          logout({ logoutParams: { returnTo: window.location.origin } });
                          setOpen(false);
                        }}
                      >
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          loginWithRedirect();
                          setOpen(false);
                        }}
                      >
                        Log In
                      </Button>
                      <Button 
                        variant="hero" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          loginWithRedirect({ authorizationParams: { screen_hint: "signup" } });
                          setOpen(false);
                        }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
