package main

import (
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/happycrew/travel_app/services/booking-api/internal/httpapi"
	"github.com/happycrew/travel_app/services/booking-api/internal/provider/mock"
)

func main() {
	propertyCount, _ := strconv.Atoi(env("MOCK_PROPERTY_COUNT", "2000"))
	provider := mock.New(propertyCount)
	handler := httpapi.New(provider, env("WEB_ORIGIN", "http://127.0.0.1:4173"))
	address := httpapi.Address(env("PORT", "8080"))

	server := &http.Server{
		Addr:              address,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	slog.Info("booking-api started", "address", address, "properties", propertyCount, "provider", "mock")
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		slog.Error("booking-api stopped", "error", err)
		os.Exit(1)
	}
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
