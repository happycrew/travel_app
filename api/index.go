// Package handler adapts the Go booking API to the Vercel Functions runtime.
package handler

import (
	"net/http"
	"net/url"
	"strings"

	"github.com/happycrew/travel_app/services/booking-api/booking"
)

var bookingHandler = booking.NewMockHandler(2000, "*")

// Handler serves all booking API routes rewritten to this Vercel Function.
func Handler(response http.ResponseWriter, request *http.Request) {
	path := strings.Trim(request.URL.Query().Get("path"), "/")
	if path != "" {
		clonedRequest := request.Clone(request.Context())
		clonedURL := *request.URL
		clonedURL.Path = "/" + path

		query := cloneQuery(request.URL.Query())
		query.Del("path")
		clonedURL.RawQuery = query.Encode()
		clonedRequest.URL = &clonedURL
		request = clonedRequest
	}

	bookingHandler.ServeHTTP(response, request)
}

func cloneQuery(source url.Values) url.Values {
	cloned := make(url.Values, len(source))
	for key, values := range source {
		cloned[key] = append([]string(nil), values...)
	}
	return cloned
}
