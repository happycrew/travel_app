package mock

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/happycrew/travel_app/services/booking-api/internal/domain"
)

var (
	ErrHotelNotFound = errors.New("hotel not found")
	ErrInvalidDates  = errors.New("check-out must be after check-in and stay must be at most 30 nights")
)

type citySeed struct {
	id          string
	name        string
	country     string
	countryCode string
	latitude    float64
	longitude   float64
}

var citySeeds = []citySeed{
	{"city_istanbul", "Стамбул", "Турция", "TR", 41.0082, 28.9784},
	{"city_dubai", "Дубай", "ОАЭ", "AE", 25.2048, 55.2708},
	{"city_bali", "Бали", "Индонезия", "ID", -8.4095, 115.1889},
	{"city_tokyo", "Токио", "Япония", "JP", 35.6762, 139.6503},
	{"city_paris", "Париж", "Франция", "FR", 48.8566, 2.3522},
	{"city_phuket", "Пхукет", "Таиланд", "TH", 7.8804, 98.3923},
	{"city_rome", "Рим", "Италия", "IT", 41.9028, 12.4964},
	{"city_barcelona", "Барселона", "Испания", "ES", 41.3874, 2.1686},
	{"city_lisbon", "Лиссабон", "Португалия", "PT", 38.7223, -9.1393},
	{"city_maldives", "Мальдивы", "Мальдивы", "MV", 4.1755, 73.5093},
	{"city_bangkok", "Бангкок", "Таиланд", "TH", 13.7563, 100.5018},
	{"city_tbilisi", "Тбилиси", "Грузия", "GE", 41.7151, 44.8271},
	{"city_yerevan", "Ереван", "Армения", "AM", 40.1872, 44.5152},
	{"city_budapest", "Будапешт", "Венгрия", "HU", 47.4979, 19.0402},
	{"city_london", "Лондон", "Великобритания", "GB", 51.5072, -0.1276},
	{"city_singapore", "Сингапур", "Сингапур", "SG", 1.3521, 103.8198},
}

var (
	namePrefixes = []string{"Azure", "Nomad", "Grand", "Secret", "Lumen", "Horizon", "Casa", "Atelier", "Silk", "Amber", "Mira", "Olive"}
	nameSuffixes = []string{"House", "Retreat", "Residence", "Garden", "Edition", "Palace", "Suites", "Harbour", "Loft", "Sanctuary"}
	imageURLs    = []string{
		"https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=82",
		"https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=82",
		"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=82",
		"https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=82",
		"https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=82",
		"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=82",
		"https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=82",
		"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=82",
	}
)

type Provider struct {
	hotels    []domain.Hotel
	byID      map[string]domain.Hotel
	locations []domain.Location
}

func New(propertyCount int) *Provider {
	if propertyCount < 1 {
		propertyCount = 2000
	}

	provider := &Provider{
		hotels: make([]domain.Hotel, 0, propertyCount),
		byID:   make(map[string]domain.Hotel, propertyCount),
	}
	counts := make(map[string]int, len(citySeeds))

	for index := 0; index < propertyCount; index++ {
		city := citySeeds[index%len(citySeeds)]
		counts[city.id]++
		name := fmt.Sprintf("%s %s %s %02d", namePrefixes[index%len(namePrefixes)], nameSuffixes[(index*7)%len(nameSuffixes)], city.name, index/len(citySeeds)+1)
		id := fmt.Sprintf("mock_%05d", index+1)
		amenities := []string{"Wi-Fi", "Кондиционер"}
		if index%2 == 0 {
			amenities = append(amenities, "Завтрак")
		}
		if index%3 == 0 {
			amenities = append(amenities, "Бассейн")
		}
		if index%4 == 0 {
			amenities = append(amenities, "Фитнес")
		}
		if index%5 == 0 {
			amenities = append(amenities, "Спа")
		}
		if index%7 == 0 {
			amenities = append(amenities, "Парковка")
		}

		badges := []string{}
		switch {
		case index%11 == 0:
			badges = append(badges, "Выбор гостей")
		case index%7 == 0:
			badges = append(badges, "Выгодная цена")
		case index%5 == 0:
			badges = append(badges, "Тихий отдых")
		}

		hotel := domain.Hotel{
			ID:                 id,
			Name:               name,
			Slug:               slugify(name) + "-" + id,
			Description:        "Отель из демонстрационного каталога Aifory Stay с проверенными удобствами и прозрачными условиями проживания.",
			City:               city.name,
			Country:            city.country,
			CountryCode:        city.countryCode,
			Latitude:           city.latitude + math.Sin(float64(index)*1.37)*0.085,
			Longitude:          city.longitude + math.Cos(float64(index)*1.91)*0.11,
			Stars:              3 + index%3,
			ReviewScore:        7.8 + float64(index%21)/10,
			ReviewCount:        54 + (index*37)%3900,
			DistanceToCenterKM: 0.2 + float64(index%120)/10,
			ImageURL:           imageURLs[index%len(imageURLs)],
			Images:             rotateImages(index),
			Amenities:          amenities,
			Badges:             badges,
			BasePriceMinor:     int64(450_000 + (index%30)*175_000),
			AvailableRooms:     1 + index%7,
			Refundable:         index%3 != 0,
			MealPlan:           map[bool]string{true: "Завтрак включён", false: "Без питания"}[index%2 == 0],
		}
		provider.hotels = append(provider.hotels, hotel)
		provider.byID[hotel.ID] = hotel
	}

	for _, city := range citySeeds {
		provider.locations = append(provider.locations, domain.Location{
			ID:            city.id,
			Type:          "city",
			Name:          city.name,
			Country:       city.country,
			CountryCode:   city.countryCode,
			Latitude:      city.latitude,
			Longitude:     city.longitude,
			PropertyCount: counts[city.id],
		})
	}

	return provider
}

func (p *Provider) SuggestLocations(_ context.Context, query string, limit int) ([]domain.Location, error) {
	query = normalize(query)
	if limit <= 0 || limit > 20 {
		limit = 8
	}

	result := make([]domain.Location, 0, limit)
	for _, location := range p.locations {
		haystack := normalize(location.Name + " " + location.Country)
		if query == "" || strings.Contains(haystack, query) {
			result = append(result, location)
			if len(result) == limit {
				break
			}
		}
	}
	return result, nil
}

func (p *Provider) Search(_ context.Context, request domain.SearchRequest) (domain.SearchResult, error) {
	nights, err := stayNights(request.CheckIn, request.CheckOut)
	if err != nil {
		return domain.SearchResult{}, err
	}
	if request.Limit <= 0 || request.Limit > 100 {
		request.Limit = 24
	}
	if request.Currency == "" {
		request.Currency = "RUB"
	}
	roomCount := len(request.Rooms)
	if roomCount == 0 {
		roomCount = 1
	}

	query := normalize(request.Query)
	filtered := make([]domain.Hotel, 0, len(p.hotels))
	for _, hotel := range p.hotels {
		haystack := normalize(hotel.Name + " " + hotel.City + " " + hotel.Country)
		if query != "" && !strings.Contains(haystack, query) {
			continue
		}
		if len(request.Filters.Stars) > 0 && !containsInt(request.Filters.Stars, hotel.Stars) {
			continue
		}
		if request.Filters.MaxPriceMinor > 0 && hotel.BasePriceMinor > request.Filters.MaxPriceMinor {
			continue
		}
		if request.Filters.MinReviewScore > 0 && hotel.ReviewScore < request.Filters.MinReviewScore {
			continue
		}
		if request.Filters.RefundableOnly && !hotel.Refundable {
			continue
		}
		if !containsAll(hotel.Amenities, request.Filters.Amenities) {
			continue
		}
		filtered = append(filtered, hotel)
	}

	sortHotels(filtered, request.Sort)
	facets := buildFacets(filtered)
	offset := decodeCursor(request.Cursor)
	if offset > len(filtered) {
		offset = len(filtered)
	}
	end := min(offset+request.Limit, len(filtered))

	items := make([]domain.HotelSummary, 0, end-offset)
	for _, hotel := range filtered[offset:end] {
		total := hotel.BasePriceMinor * int64(nights) * int64(roomCount)
		items = append(items, toSummary(hotel, request.Currency, total))
	}

	nextCursor := ""
	if end < len(filtered) {
		nextCursor = encodeCursor(end)
	}

	return domain.SearchResult{
		SearchID:   searchID(request),
		Items:      items,
		Total:      len(filtered),
		NextCursor: nextCursor,
		Facets:     facets,
		ExpiresAt:  time.Now().UTC().Add(15 * time.Minute),
	}, nil
}

func (p *Provider) GetHotel(_ context.Context, hotelID string) (domain.Hotel, error) {
	hotel, ok := p.byID[hotelID]
	if !ok {
		return domain.Hotel{}, ErrHotelNotFound
	}
	return hotel, nil
}

func stayNights(checkIn, checkOut string) (int, error) {
	in, err := time.Parse(time.DateOnly, checkIn)
	if err != nil {
		return 0, ErrInvalidDates
	}
	out, err := time.Parse(time.DateOnly, checkOut)
	if err != nil {
		return 0, ErrInvalidDates
	}
	nights := int(out.Sub(in).Hours() / 24)
	if nights < 1 || nights > 30 {
		return 0, ErrInvalidDates
	}
	return nights, nil
}

func sortHotels(hotels []domain.Hotel, sortBy string) {
	sort.SliceStable(hotels, func(i, j int) bool {
		switch sortBy {
		case "price_asc":
			return hotels[i].BasePriceMinor < hotels[j].BasePriceMinor
		case "price_desc":
			return hotels[i].BasePriceMinor > hotels[j].BasePriceMinor
		case "rating_desc":
			return hotels[i].ReviewScore > hotels[j].ReviewScore
		case "distance_asc":
			return hotels[i].DistanceToCenterKM < hotels[j].DistanceToCenterKM
		default:
			left := hotels[i].ReviewScore*10 + float64(hotels[i].Stars*2) - hotels[i].DistanceToCenterKM/5
			right := hotels[j].ReviewScore*10 + float64(hotels[j].Stars*2) - hotels[j].DistanceToCenterKM/5
			return left > right
		}
	})
}

func buildFacets(hotels []domain.Hotel) domain.SearchFacets {
	facets := domain.SearchFacets{
		StarCounts:    make(map[string]int),
		AmenityCounts: make(map[string]int),
	}
	if len(hotels) == 0 {
		return facets
	}
	facets.MinPriceMinor = hotels[0].BasePriceMinor
	for _, hotel := range hotels {
		facets.MinPriceMinor = min(facets.MinPriceMinor, hotel.BasePriceMinor)
		facets.MaxPriceMinor = max(facets.MaxPriceMinor, hotel.BasePriceMinor)
		facets.StarCounts[strconv.Itoa(hotel.Stars)]++
		for _, amenity := range hotel.Amenities {
			facets.AmenityCounts[amenity]++
		}
	}
	return facets
}

func toSummary(hotel domain.Hotel, currency string, total int64) domain.HotelSummary {
	return domain.HotelSummary{
		ID:                 hotel.ID,
		Name:               hotel.Name,
		Slug:               hotel.Slug,
		City:               hotel.City,
		Country:            hotel.Country,
		Latitude:           hotel.Latitude,
		Longitude:          hotel.Longitude,
		Stars:              hotel.Stars,
		ReviewScore:        hotel.ReviewScore,
		ReviewCount:        hotel.ReviewCount,
		DistanceToCenterKM: hotel.DistanceToCenterKM,
		ImageURL:           hotel.ImageURL,
		Amenities:          hotel.Amenities,
		Badges:             hotel.Badges,
		PricePerNight:      domain.Money{AmountMinor: hotel.BasePriceMinor, Currency: currency},
		TotalPrice:         domain.Money{AmountMinor: total, Currency: currency},
		AvailableRooms:     hotel.AvailableRooms,
		Refundable:         hotel.Refundable,
		MealPlan:           hotel.MealPlan,
	}
}

func searchID(request domain.SearchRequest) string {
	data, _ := json.Marshal(request)
	sum := sha256.Sum256(data)
	return "search_" + hex.EncodeToString(sum[:8])
}

func encodeCursor(offset int) string {
	return base64.RawURLEncoding.EncodeToString([]byte(strconv.Itoa(offset)))
}

func decodeCursor(cursor string) int {
	if cursor == "" {
		return 0
	}
	data, err := base64.RawURLEncoding.DecodeString(cursor)
	if err != nil {
		return 0
	}
	offset, _ := strconv.Atoi(string(data))
	return max(offset, 0)
}

func containsAll(have, required []string) bool {
	for _, item := range required {
		found := false
		for _, candidate := range have {
			if normalize(candidate) == normalize(item) {
				found = true
				break
			}
		}
		if !found {
			return false
		}
	}
	return true
}

func containsInt(values []int, target int) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}

func rotateImages(index int) []string {
	return []string{
		imageURLs[index%len(imageURLs)],
		imageURLs[(index+3)%len(imageURLs)],
		imageURLs[(index+5)%len(imageURLs)],
	}
}

func normalize(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func slugify(value string) string {
	var builder strings.Builder
	lastDash := false
	for _, character := range strings.ToLower(value) {
		if unicode.IsLetter(character) || unicode.IsDigit(character) {
			builder.WriteRune(character)
			lastDash = false
		} else if !lastDash {
			builder.WriteByte('-')
			lastDash = true
		}
	}
	return strings.Trim(builder.String(), "-")
}
