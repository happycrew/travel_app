package domain

import "time"

type Money struct {
	AmountMinor int64  `json:"amountMinor"`
	Currency    string `json:"currency"`
}

type RoomOccupancy struct {
	Adults       int   `json:"adults"`
	ChildrenAges []int `json:"childrenAges"`
}

type SearchFilters struct {
	Stars          []int    `json:"stars"`
	MaxPriceMinor  int64    `json:"maxPriceMinor"`
	MinReviewScore float64  `json:"minReviewScore"`
	Amenities      []string `json:"amenities"`
	RefundableOnly bool     `json:"refundableOnly"`
}

type SearchRequest struct {
	Query    string          `json:"query"`
	CheckIn  string          `json:"checkIn"`
	CheckOut string          `json:"checkOut"`
	Rooms    []RoomOccupancy `json:"rooms"`
	Currency string          `json:"currency"`
	Sort     string          `json:"sort"`
	Filters  SearchFilters   `json:"filters"`
	Limit    int             `json:"limit"`
	Cursor   string          `json:"cursor,omitempty"`
}

type Hotel struct {
	ID                 string   `json:"id"`
	Name               string   `json:"name"`
	Slug               string   `json:"slug"`
	Description        string   `json:"description,omitempty"`
	City               string   `json:"city"`
	Country            string   `json:"country"`
	CountryCode        string   `json:"countryCode"`
	Latitude           float64  `json:"latitude"`
	Longitude          float64  `json:"longitude"`
	Stars              int      `json:"stars"`
	ReviewScore        float64  `json:"reviewScore"`
	ReviewCount        int      `json:"reviewCount"`
	DistanceToCenterKM float64  `json:"distanceToCenterKm"`
	ImageURL           string   `json:"imageUrl"`
	Images             []string `json:"images,omitempty"`
	Amenities          []string `json:"amenities"`
	Badges             []string `json:"badges"`
	BasePriceMinor     int64    `json:"-"`
	AvailableRooms     int      `json:"availableRooms"`
	Refundable         bool     `json:"refundable"`
	MealPlan           string   `json:"mealPlan"`
}

type HotelSummary struct {
	ID                 string   `json:"id"`
	Name               string   `json:"name"`
	Slug               string   `json:"slug"`
	City               string   `json:"city"`
	Country            string   `json:"country"`
	Latitude           float64  `json:"latitude"`
	Longitude          float64  `json:"longitude"`
	Stars              int      `json:"stars"`
	ReviewScore        float64  `json:"reviewScore"`
	ReviewCount        int      `json:"reviewCount"`
	DistanceToCenterKM float64  `json:"distanceToCenterKm"`
	ImageURL           string   `json:"imageUrl"`
	Amenities          []string `json:"amenities"`
	Badges             []string `json:"badges"`
	PricePerNight      Money    `json:"pricePerNight"`
	TotalPrice         Money    `json:"totalPrice"`
	AvailableRooms     int      `json:"availableRooms"`
	Refundable         bool     `json:"refundable"`
	MealPlan           string   `json:"mealPlan"`
}

type SearchFacets struct {
	MinPriceMinor int64          `json:"minPriceMinor"`
	MaxPriceMinor int64          `json:"maxPriceMinor"`
	StarCounts    map[string]int `json:"starCounts"`
	AmenityCounts map[string]int `json:"amenityCounts"`
}

type SearchResult struct {
	SearchID   string         `json:"searchId"`
	Items      []HotelSummary `json:"items"`
	Total      int            `json:"total"`
	NextCursor string         `json:"nextCursor,omitempty"`
	Facets     SearchFacets   `json:"facets"`
	ExpiresAt  time.Time      `json:"expiresAt"`
}

type Location struct {
	ID            string  `json:"id"`
	Type          string  `json:"type"`
	Name          string  `json:"name"`
	Country       string  `json:"country"`
	CountryCode   string  `json:"countryCode"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	PropertyCount int     `json:"propertyCount"`
}
