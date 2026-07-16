module github.com/happycrew/travel_app

go 1.26.0

require github.com/happycrew/travel_app/services/booking-api v0.0.0

replace github.com/happycrew/travel_app/services/booking-api => ./services/booking-api
