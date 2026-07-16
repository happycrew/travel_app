// Package booking exposes the booking API as an http.Handler for hosted runtimes.
package booking

import (
	"net/http"

	"github.com/happycrew/travel_app/services/booking-api/internal/httpapi"
	"github.com/happycrew/travel_app/services/booking-api/internal/provider/mock"
)

// NewMockHandler creates a complete booking API backed by deterministic mock data.
func NewMockHandler(propertyCount int, allowedOrigin string) http.Handler {
	return httpapi.New(mock.New(propertyCount), allowedOrigin)
}
