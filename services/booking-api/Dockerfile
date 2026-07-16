FROM golang:1.26.5-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /booking-api ./cmd/api

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /booking-api /booking-api
EXPOSE 8080
ENTRYPOINT ["/booking-api"]
