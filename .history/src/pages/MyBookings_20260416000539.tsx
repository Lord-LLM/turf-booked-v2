import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Booking {
  _id: string;
  turfId: string;
  turfName?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "failed";
  mpesaReceiptNumber?: string;
  createdAt: string;
}

export default function MyBookings() {
  const { user, isLoading } = useAuth0();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    if (user?.sub) {
      // DEMO MODE: Use demo user ID to show demo booking
      const userId = "auth0|demo-user-presentation-2026";
      fetchBookings(userId);
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const response = await fetch(`/api/bookings?userId=${user?.sub}`);

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      // Filter to only show completed bookings
      const completedBookings = (data.bookings || []).filter(
        (booking: Booking) => booking.paymentStatus === "completed"
      );
      setBookings(completedBookings);
      console.log("[MyBookings] Fetched completed bookings:", completedBookings);
    } catch (error: any) {
      console.error("[MyBookings] Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center justify-center pt-32 text-center">
          <h2 className="font-display text-2xl font-bold">Please sign in to view your bookings</h2>
          <Link to="/signin">
            <Button variant="hero" className="mt-4">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending Payment</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Payment Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-20">
        <Link to="/turfs" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground mb-8">View and manage your turf bookings</p>
        </motion.div>

        {isLoadingBookings ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-muted-foreground mb-4">You don't have any confirmed bookings yet.</p>
            <Link to="/turfs">
              <Button variant="hero">Book a Turf</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.turfName || `Turf ${booking.turfId}`}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.date).toLocaleDateString("en-KE")}
                      </p>
                    </div>
                    {getPaymentStatusIcon(booking.paymentStatus)}
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <p>
                      <span className="font-medium">Time:</span> {booking.startTime} - {booking.endTime}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span> KSh {booking.totalAmount.toLocaleString()}
                    </p>
                    {booking.mpesaReceiptNumber && (
                      <p>
                        <span className="font-medium">Receipt:</span> {booking.mpesaReceiptNumber}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-500">Confirmed</Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString("en-KE")}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
