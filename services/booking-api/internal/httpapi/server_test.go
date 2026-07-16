package httpapi

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/happycrew/travel_app/services/booking-api/internal/provider/mock"
)

func TestSearchEndpoint(t *testing.T) {
	t.Parallel()
	handler := New(mock.New(200), "http://127.0.0.1:4173")
	body := `{"query":"Дубай","checkIn":"2026-08-14","checkOut":"2026-08-18","rooms":[{"adults":2,"childrenAges":[]}],"currency":"RUB","sort":"recommended","filters":{},"limit":10}`
	request := httptest.NewRequest(http.MethodPost, "/v1/hotels/search", strings.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", response.Code, response.Body.String())
	}
	if !strings.Contains(response.Body.String(), `"searchId"`) {
		t.Fatalf("expected search response, got %s", response.Body.String())
	}
}

func TestCORSPreflight(t *testing.T) {
	t.Parallel()
	handler := New(mock.New(10), "http://127.0.0.1:4173")
	request := httptest.NewRequest(http.MethodOptions, "/v1/hotels/search", nil)
	request.Header.Set("Origin", "http://127.0.0.1:4173")
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)
	if response.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", response.Code)
	}
	if response.Header().Get("Access-Control-Allow-Origin") == "" {
		t.Fatal("expected CORS origin header")
	}
}
