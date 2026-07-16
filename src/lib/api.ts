export type Money = {
  amountMinor: number;
  currency: string;
};

export type HotelSummary = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  stars: number;
  reviewScore: number;
  reviewCount: number;
  distanceToCenterKm: number;
  imageUrl: string;
  amenities: string[];
  badges: string[];
  pricePerNight: Money;
  totalPrice: Money;
  availableRooms: number;
  refundable: boolean;
  mealPlan: string;
};

export type SearchFilters = {
  stars?: number[];
  maxPriceMinor?: number;
  minReviewScore?: number;
  amenities?: string[];
  refundableOnly?: boolean;
};

export type SearchRequest = {
  query: string;
  checkIn: string;
  checkOut: string;
  rooms: Array<{ adults: number; childrenAges: number[] }>;
  currency: string;
  sort: "recommended" | "price_asc" | "price_desc" | "rating_desc" | "distance_asc";
  filters: SearchFilters;
  limit: number;
  cursor?: string;
};

export type SearchResponse = {
  searchId: string;
  items: HotelSummary[];
  total: number;
  nextCursor?: string;
  facets: {
    minPriceMinor: number;
    maxPriceMinor: number;
    starCounts: Record<string, number>;
    amenityCounts: Record<string, number>;
  };
  expiresAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_BOOKING_API_URL ?? "http://127.0.0.1:8080";

export async function searchHotels(request: SearchRequest, signal?: AbortSignal) {
  const response = await fetch(`${API_URL}/v1/hotels/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Search API responded with ${response.status}`);
  }

  return (await response.json()) as SearchResponse;
}

export function formatMoney(money: Money) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amountMinor / 100);
}
