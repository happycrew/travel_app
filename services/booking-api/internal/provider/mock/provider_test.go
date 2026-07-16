package mock

import (
	"context"
	"testing"

	"github.com/happycrew/travel_app/services/booking-api/internal/domain"
)

func TestSearchFiltersAndSortsHotels(t *testing.T) {
	t.Parallel()
	provider := New(2000)

	result, err := provider.Search(context.Background(), domain.SearchRequest{
		Query:    "Стамбул",
		CheckIn:  "2026-08-14",
		CheckOut: "2026-08-21",
		Currency: "RUB",
		Sort:     "price_asc",
		Limit:    24,
		Rooms:    []domain.RoomOccupancy{{Adults: 2}},
		Filters: domain.SearchFilters{
			Stars:          []int{4, 5},
			Amenities:      []string{"Завтрак"},
			RefundableOnly: true,
		},
	})
	if err != nil {
		t.Fatalf("search returned an error: %v", err)
	}
	if result.Total == 0 {
		t.Fatal("expected filtered hotels")
	}
	if len(result.Items) > 24 {
		t.Fatalf("expected at most 24 hotels, got %d", len(result.Items))
	}
	for index, hotel := range result.Items {
		if hotel.City != "Стамбул" {
			t.Fatalf("expected Istanbul, got %s", hotel.City)
		}
		if hotel.Stars != 4 && hotel.Stars != 5 {
			t.Fatalf("unexpected star count: %d", hotel.Stars)
		}
		if !hotel.Refundable {
			t.Fatal("expected refundable hotel")
		}
		if index > 0 && result.Items[index-1].PricePerNight.AmountMinor > hotel.PricePerNight.AmountMinor {
			t.Fatal("items are not sorted by ascending price")
		}
	}
}

func TestSearchRejectsInvalidDates(t *testing.T) {
	t.Parallel()
	provider := New(10)
	_, err := provider.Search(context.Background(), domain.SearchRequest{CheckIn: "2026-08-14", CheckOut: "2026-08-14"})
	if err == nil {
		t.Fatal("expected invalid dates error")
	}
}

func TestSuggestLocations(t *testing.T) {
	t.Parallel()
	provider := New(100)
	items, err := provider.SuggestLocations(context.Background(), "стам", 5)
	if err != nil {
		t.Fatalf("suggest returned an error: %v", err)
	}
	if len(items) != 1 || items[0].Name != "Стамбул" {
		t.Fatalf("unexpected suggestions: %#v", items)
	}
}
