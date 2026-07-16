package provider

import (
	"context"

	"github.com/happycrew/travel_app/services/booking-api/internal/domain"
)

type HotelProvider interface {
	SuggestLocations(ctx context.Context, query string, limit int) ([]domain.Location, error)
	Search(ctx context.Context, request domain.SearchRequest) (domain.SearchResult, error)
	GetHotel(ctx context.Context, hotelID string) (domain.Hotel, error)
}
