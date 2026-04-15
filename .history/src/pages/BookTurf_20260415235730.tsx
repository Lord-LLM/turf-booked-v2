import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { turfs, generateTimeSlots } from "@/data/turfs";
import { Calendar } from "@/components/ui/calendar";
import { Star, MapPin, ArrowLeft, Check, Clock, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BookTurf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth0();
  const turf = turfs.find((t) => t.id === id);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment state
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const slots = useMemo(() => generateTimeSlots(date || new Date()), [date]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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
          <h2 className="font-display text-2xl font-bold">Please sign in to book a turf</h2>
          <Link to="/signin"><Button variant="hero" className="mt-4">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center justify-center pt-32 text-center">
          <h2 className="font-display text-2xl font-bold">Turf not found</h2>
          <Link to="/turfs"><Button variant="hero" className="mt-4">Explore Turfs</Button></Link>
        </div>
      </div>
    );
  }

  const selectedSlotData = slots.find((s) => s.id === selectedSlot);
  const totalPrice = selectedSlotData ? Math.round(turf.pricePerHour * selectedSlotData.price) : turf.pricePerHour;

  const validateMpesaPhone = (phone: string): boolean => {
    const regex = /^254\d{9}$/;
    return regex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!mpesaPhone.trim()) newErrors.mpesaPhone = "M-Pesa phone is required";
    else if (!validateMpesaPhone(mpesaPhone)) newErrors.mpesaPhone = "Invalid format. Use 2547XXXXXXXX";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pollBookingStatus = async (bId: string) => {
    try {
      const response = await fetch(`/api/bookings?bookingId=${bId}`);
      const result = await response.json();

      console.log(`[BookTurf] 🔄 Polling status for booking ${bId}`);
      console.log(`[BookTurf] Status received: "${result.status}" | Full response:`, result);

      if (result.status === "completed") {
        console.log("[BookTurf] ✅ Payment confirmed! Status changed to 'completed'");
        console.log("[BookTurf] Receipt:", result.booking?.mpesaReceiptNumber);
        setPaymentState("success");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          console.log("[BookTurf] ✅ Stopped polling interval");
        }
        toast.success("Payment successful! Booking confirmed.");
      } else if (result.status === "failed") {
        console.log("[BookTurf] ❌ Payment failed - Status is 'failed'");
        setPaymentState("failed");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          console.log("[BookTurf] ✅ Stopped polling interval");
        }
        toast.error("Payment failed. Please try again.");
      } else if (result.status === "processing") {
        console.log(`[BookTurf] ⏳ Payment still processing... (status: "${result.status}")`);
      } else {
        console.log(`[BookTurf] ⏳ Waiting for callback (status: "${result.status || 'pending'}")`);
      }
    } catch (error) {
      console.error("[BookTurf] ❌ Error polling booking status:", error);
    }
  };

  const handleBook = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create booking first to get ID
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.sub,
          turfId: turf.id,
          date: date,
          startTime: selectedSlotData?.time,
          endTime: "17:00",
          totalAmount: totalPrice,
        }),
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingResult?.error || "Failed to create booking");
      }

      const newBookingId = bookingResult.booking.id;
      setBookingId(newBookingId);

      // Step 2: Initiate STK Push with booking ID
      const stkResponse = await fetch("/api/mpesa?action=stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: newBookingId,
          phoneNumber: mpesaPhone,
          amount: totalPrice,
        }),
      });

      const stkResult = await stkResponse.json();

      if (!stkResponse.ok) {
        throw new Error(stkResult?.error || "STK push failed");
      }

      setPaymentState("processing");

      // DEMO MODE: Auto-complete after 17 seconds for demonstration
      const demoTimeout = setTimeout(() => {
        console.log("[BookTurf] 🎬 DEMO MODE: Auto-completing payment after 17 seconds");
        setPaymentState("success");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        toast.success("Payment successful! Booking confirmed.");
      }, 17000);

      // Start polling for payment confirmation (timeout after 5 minutes)
      let pollCount = 0;
      const maxPolls = 100; // 100 polls × 3 seconds = 5 minutes
      
      pollingIntervalRef.current = setInterval(() => {
        pollCount++;
        console.log(`[BookTurf] Poll attempt ${pollCount}/${maxPolls}`);
        
        if (pollCount > maxPolls) {
          // Timeout - stop polling
          console.log("[BookTurf] ⏱️ Polling timeout reached");
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setPaymentState("failed");
          toast.error("Payment confirmation timeout. Please check your M-Pesa or try again.");
          return;
        }
        
        pollBookingStatus(newBookingId);
      }, 3000);
    } catch (error: any) {
      console.error("[BookTurf] Error in handleBook:", error);
      toast.error(error?.message || "Unable to process payment");
      setIsSubmitting(false);
      setPaymentState("failed");
    }
  };

  const handleRetry = () => {
    setPaymentState("idle");
    setBookingId(null);
    setIsSubmitting(false);
  };

  const handleViewBookings = () => {
    navigate("/turfs");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-20">
        <Link to="/turfs" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Turfs
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Turf Info */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
              <img src={turf.image} alt={turf.name} className="aspect-video w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <h1 className="font-display text-xl font-bold text-card-foreground">{turf.name}</h1>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-turf-gold text-turf-gold" />
                    {turf.rating}
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {turf.location}
                </div>
                <Badge variant="secondary" className="mt-3">{turf.type}</Badge>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {turf.amenities.map((a) => (
                    <span key={a} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{a}</span>
                  ))}
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  <span className="font-display text-2xl font-bold text-foreground">KSh {turf.pricePerHour.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground"> /hr</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Select Date</h2>
              <Calendar mode="single" selected={date} onSelect={setDate} className="mx-auto" disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} />
            </motion.div>

            {/* Time Slots */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-card-foreground">Select Time</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-turf-gold" /> Peak</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Available</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-muted" /> Booked</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.id === selectedSlot ? null : slot.id)}
                    className={`relative rounded-lg border px-3 py-3 text-center text-sm font-medium transition-all ${
                      slot.id === selectedSlot
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : slot.available
                        ? "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
                        : "border-border bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
                    }`}
                  >
                    <Clock className="mx-auto mb-1 h-3.5 w-3.5" />
                    {slot.time}
                    {slot.isPeak && slot.available && (
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-turf-gold" />
                    )}
                    {slot.id === selectedSlot && (
                      <Check className="absolute right-1 top-1 h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Confirm - Main Form */}
            <AnimatePresence mode="wait">
              {selectedSlot && date && paymentState === "idle" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="rounded-2xl border-2 border-primary bg-card shadow-lg"
                >
                  <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                    <h3 className="font-display text-lg font-bold text-foreground">Complete Your Booking</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Enter your details to confirm</p>
                  </div>

                  <div className="grid gap-8 p-6 lg:grid-cols-[1.5fr_1fr]">
                    <div className="space-y-4">
                      <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                        <h4 className="font-display text-sm font-semibold text-foreground">Booking Details</h4>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Turf</span>
                            <span className="font-medium text-foreground">{turf.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium text-foreground">{format(date, "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Time</span>
                            <span className="font-medium text-foreground">{selectedSlotData?.time}</span>
                          </div>
                          {selectedSlotData?.isPeak && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Type</span>
                              <span className="inline-flex items-center gap-1 rounded-md bg-turf-gold/10 px-2 py-1 font-medium text-turf-gold">
                                <span className="h-1.5 w-1.5 rounded-full bg-turf-gold" />
                                Peak Hours
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 border-t border-primary/10 pt-3">
                          <div className="flex justify-between">
                            <span className="font-display font-semibold text-foreground">Total</span>
                            <span className="font-display text-2xl font-bold text-primary">KSh {totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-xl bg-muted/50 border border-border p-4">
                        <p className="text-sm text-muted-foreground">
                          <span className="block font-semibold text-foreground">Logged in as</span>
                          {user?.name}
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-1 text-sm font-semibold text-foreground">
                          M-Pesa Phone
                          {!mpesaPhone && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="tel"
                          value={mpesaPhone}
                          onChange={(event) => {
                            setMpesaPhone(event.target.value);
                            if (errors.mpesaPhone) setErrors({ ...errors, mpesaPhone: "" });
                          }}
                          className={`w-full rounded-lg border-2 bg-background px-4 py-3 text-sm text-foreground outline-none transition ${
                            errors.mpesaPhone ? "border-red-500" : "border-border focus:border-primary"
                          } focus:ring-2 focus:ring-primary/20`}
                          placeholder="2547XXXXXXXX"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Format: 2547XXXXXXXX</p>
                        {errors.mpesaPhone && <p className="mt-1 text-xs text-red-500">{errors.mpesaPhone}</p>}
                      </div>

                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleBook}
                        disabled={!mpesaPhone || isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Pay KSh ${totalPrice.toLocaleString()} with M-Pesa`
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Processing Payment State */}
              {paymentState === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border-2 border-primary bg-card shadow-lg p-12 flex flex-col items-center justify-center text-center"
                >
                  <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">Processing Payment</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    Please check your phone. Enter your M-Pesa PIN to complete the payment of <span className="font-semibold text-foreground">KSh {totalPrice.toLocaleString()}</span> to <span className="font-semibold text-foreground">DeKUT Green Pitch</span>.
                  </p>
                  <p className="text-sm text-muted-foreground">This may take a moment...</p>
                </motion.div>
              )}

              {/* Success State */}
              {paymentState === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border-2 border-green-500 bg-green-50 dark:bg-green-950/20 shadow-lg p-12 flex flex-col items-center justify-center text-center"
                >
                  <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
                  <h3 className="font-display text-3xl font-bold text-green-700 dark:text-green-400 mb-2">Payment Successful!</h3>
                  <p className="text-green-600 dark:text-green-300 mb-2">Your booking has been confirmed.</p>
                  <p className="text-sm text-muted-foreground mb-8">
                    Confirmation details have been sent to <span className="font-semibold">{user?.email}</span>
                  </p>
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleViewBookings}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    View My Bookings
                  </Button>
                </motion.div>
              )}

              {/* Failed State */}
              {paymentState === "failed" && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-950/20 shadow-lg p-12 flex flex-col items-center justify-center text-center"
                >
                  <AlertCircle className="h-20 w-20 text-red-500 mb-4" />
                  <h3 className="font-display text-3xl font-bold text-red-700 dark:text-red-400 mb-2">Payment Failed</h3>
                  <p className="text-red-600 dark:text-red-300 mb-8">
                    The M-Pesa payment could not be processed. Please check your phone and try again.
                  </p>
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleRetry}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Try Again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
