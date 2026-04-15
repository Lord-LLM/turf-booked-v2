import turf1 from "@/assets/turf-1.jpg";
import turf2 from "@/assets/turf-2.jpg";
import turf3 from "@/assets/turf-3.jpg";

export interface Turf {
  id: string;
  name: string;
  location: string;
  image: string;
  pricePerHour: number;
  rating: number;
  reviews: number;
  type: "5-a-side" | "7-a-side" | "Full Size";
  amenities: string[];
  available: boolean;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  isPeak: boolean;
  price: number;
}

export const turfs: Turf[] = [
  {
    id: "1",
    name: "Kasarani Sports Arena",
    location: "Kasarani, Nairobi",
    image: turf1,
    pricePerHour: 2500,
    rating: 4.8,
    reviews: 124,
    type: "7-a-side",
    amenities: ["Floodlights", "Changing Rooms", "Parking", "Water"],
    available: true,
  },
  {
    id: "2",
    name: "DeKUT Green Pitch",
    location: "Nyeri, DeKUT Campus",
    image: turf2,
    pricePerHour: 1,
    rating: 4.5,
    reviews: 87,
    type: "Full Size",
    amenities: ["Floodlights", "Changing Rooms", "First Aid"],
    available: true,
  },
  {
    id: "3",
    name: "South C Indoor Turf",
    location: "South C, Nairobi",
    image: turf3,
    pricePerHour: 3000,
    rating: 4.9,
    reviews: 203,
    type: "5-a-side",
    amenities: ["Indoor", "AC", "Changing Rooms", "Café", "Parking"],
    available: true,
  },
  {
    id: "4",
    name: "Embakasi Community Pitch",
    location: "Embakasi, Nairobi",
    image: turf1,
    pricePerHour: 1800,
    rating: 4.3,
    reviews: 56,
    type: "7-a-side",
    amenities: ["Floodlights", "Parking"],
    available: false,
  },
  {
    id: "5",
    name: "Westlands Sports Hub",
    location: "Westlands, Nairobi",
    image: turf2,
    pricePerHour: 3500,
    rating: 4.7,
    reviews: 145,
    type: "Full Size",
    amenities: ["Floodlights", "VIP Lounge", "Changing Rooms", "Parking", "Café"],
    available: true,
  },
  {
    id: "6",
    name: "Mathare Youth Turf",
    location: "Mathare, Nairobi",
    image: turf3,
    pricePerHour: 1200,
    rating: 4.1,
    reviews: 34,
    type: "5-a-side",
    amenities: ["Floodlights", "Water"],
    available: true,
  },
];

export const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    const isPeak = hour >= 17 && hour <= 21;
    const time = `${hour.toString().padStart(2, "0")}:00`;
    slots.push({
      id: `slot-${hour}`,
      time,
      available: Math.random() > 0.3,
      isPeak,
      price: isPeak ? 1.3 : 1,
    });
  }
  return slots;
};
