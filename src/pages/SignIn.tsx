import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, error, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      toast.success("Signed in successfully!", {
        description: "Redirecting to dashboard...",
      });
      setTimeout(() => {
        navigate("/turfs");
      }, 1500);
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 pb-20 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-20">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto rounded-2xl border-2 border-primary bg-card shadow-lg overflow-hidden"
        >
          <div className="bg-primary/5 px-6 py-6 border-b border-primary/10">
            <h1 className="font-display text-2xl font-bold text-foreground">Sign In</h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome back to turf-booked</p>
          </div>

          <div className="space-y-4 p-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            )}

            <Button 
              variant="hero" 
              size="lg" 
              onClick={() => loginWithRedirect()} 
              className="w-full"
            >
              Sign In
            </Button>
          </div>

          <div className="border-t border-border bg-primary/5 px-6 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition">
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
