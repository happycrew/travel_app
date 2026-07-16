package httpapi

import (
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/happycrew/travel_app/services/booking-api/internal/domain"
	"github.com/happycrew/travel_app/services/booking-api/internal/provider"
)

type Server struct {
	provider      provider.HotelProvider
	allowedOrigin string
}

func New(provider provider.HotelProvider, allowedOrigin string) http.Handler {
	server := &Server{provider: provider, allowedOrigin: allowedOrigin}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", server.health)
	mux.HandleFunc("GET /v1/locations/suggest", server.suggestLocations)
	mux.HandleFunc("POST /v1/hotels/search", server.searchHotels)
	mux.HandleFunc("GET /v1/hotels/{hotelID}", server.getHotel)
	return server.withMiddleware(mux)
}

func (s *Server) health(response http.ResponseWriter, _ *http.Request) {
	writeJSON(response, http.StatusOK, map[string]any{
		"status":   "ok",
		"service":  "booking-api",
		"provider": "mock",
		"time":     time.Now().UTC(),
	})
}

func (s *Server) suggestLocations(response http.ResponseWriter, request *http.Request) {
	limit, _ := strconv.Atoi(request.URL.Query().Get("limit"))
	locations, err := s.provider.SuggestLocations(request.Context(), request.URL.Query().Get("q"), limit)
	if err != nil {
		writeError(response, http.StatusInternalServerError, "location_search_failed", "Не удалось получить направления")
		return
	}
	writeJSON(response, http.StatusOK, map[string]any{"items": locations})
}

func (s *Server) searchHotels(response http.ResponseWriter, request *http.Request) {
	request.Body = http.MaxBytesReader(response, request.Body, 1<<20)
	decoder := json.NewDecoder(request.Body)
	decoder.DisallowUnknownFields()

	var searchRequest domain.SearchRequest
	if err := decoder.Decode(&searchRequest); err != nil {
		writeError(response, http.StatusBadRequest, "invalid_request", "Проверьте формат параметров поиска")
		return
	}

	result, err := s.provider.Search(request.Context(), searchRequest)
	if err != nil {
		writeError(response, http.StatusUnprocessableEntity, "invalid_search", err.Error())
		return
	}
	writeJSON(response, http.StatusOK, result)
}

func (s *Server) getHotel(response http.ResponseWriter, request *http.Request) {
	hotelID := strings.TrimSpace(request.PathValue("hotelID"))
	if hotelID == "" {
		writeError(response, http.StatusBadRequest, "hotel_id_required", "Не указан идентификатор отеля")
		return
	}

	hotel, err := s.provider.GetHotel(request.Context(), hotelID)
	if err != nil {
		writeError(response, http.StatusNotFound, "hotel_not_found", "Отель не найден")
		return
	}
	writeJSON(response, http.StatusOK, hotel)
}

func (s *Server) withMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		startedAt := time.Now()
		origin := request.Header.Get("Origin")
		if origin != "" && (origin == s.allowedOrigin || s.allowedOrigin == "*") {
			response.Header().Set("Access-Control-Allow-Origin", origin)
			response.Header().Set("Vary", "Origin")
			response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Idempotency-Key")
			response.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		}
		if request.Method == http.MethodOptions {
			response.WriteHeader(http.StatusNoContent)
			return
		}

		response.Header().Set("X-Content-Type-Options", "nosniff")
		next.ServeHTTP(response, request)
		slog.Info("http request", "method", request.Method, "path", request.URL.Path, "duration", time.Since(startedAt).String())
	})
}

func writeJSON(response http.ResponseWriter, status int, payload any) {
	response.Header().Set("Content-Type", "application/json; charset=utf-8")
	response.WriteHeader(status)
	if err := json.NewEncoder(response).Encode(payload); err != nil && !errors.Is(err, http.ErrHandlerTimeout) {
		slog.Error("encode response", "error", err)
	}
}

func writeError(response http.ResponseWriter, status int, code, message string) {
	writeJSON(response, status, map[string]any{
		"error": map[string]string{
			"code":    code,
			"message": message,
		},
	})
}

func Address(port string) string {
	if port == "" {
		port = "8080"
	}
	return fmt.Sprintf(":%s", port)
}
