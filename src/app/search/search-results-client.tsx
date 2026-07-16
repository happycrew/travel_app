"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Heart,
  ListFilter,
  LoaderCircle,
  MapPin,
  MapPinned,
  Search,
  SlidersHorizontal,
  Star,
  UsersRound,
  Wifi,
} from "lucide-react";
import { motion } from "motion/react";
import { formatMoney, searchHotels, type HotelSummary, type SearchResponse } from "@/lib/api";
import { track } from "@/analytics";

type SearchResultsClientProps = {
  initialQuery: string;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
};

type Sort = "recommended" | "price_asc" | "price_desc" | "rating_desc" | "distance_asc";

const sortLabels: Record<Sort, string> = {
  recommended: "Рекомендуемые",
  price_asc: "Сначала дешевле",
  price_desc: "Сначала дороже",
  rating_desc: "Лучший рейтинг",
  distance_asc: "Ближе к центру",
};

function Brand() {
  return (
    <Link className="logo" href="/" aria-label="Aifory Stay — на главную">
      <span className="logo-mark"><span /><span /></span>
      <span>AIFORY<strong>STAY</strong></span>
    </Link>
  );
}

function HotelResultCard({ hotel, position }: { hotel: HotelSummary; position: number }) {
  return (
    <motion.article
      className="result-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(position * 0.035, 0.25) }}
    >
      <div className="result-photo">
        {/* The mock provider returns licensed placeholder URLs; Next optimization will be added with provider content. */}
        <img src={hotel.imageUrl} alt={`${hotel.name}, ${hotel.city}`} />
        {hotel.badges[0] && <span className="result-badge">{hotel.badges[0]}</span>}
        <button type="button" aria-label={`Добавить ${hotel.name} в избранное`} onClick={() => track("search_favorite_click", { hotel_id: hotel.id })}>
          <Heart size={18} />
        </button>
      </div>
      <div className="result-body">
        <div className="result-title-row">
          <div>
            <span className="result-location"><MapPin size={13} /> {hotel.city}, {hotel.country} · {hotel.distanceToCenterKm.toFixed(1)} км от центра</span>
            <h2>{hotel.name}</h2>
            <span className="stars" aria-label={`${hotel.stars} звёзд`}>
              {Array.from({ length: hotel.stars }, (_, index) => <Star key={index} size={12} fill="currentColor" />)}
            </span>
          </div>
          <div className="result-rating"><strong>{hotel.reviewScore.toFixed(1)}</strong><span>{hotel.reviewCount} отзывов</span></div>
        </div>
        <div className="result-amenities">
          {hotel.amenities.slice(0, 3).map((amenity) => <span key={amenity}><Check size={12} /> {amenity}</span>)}
          {hotel.amenities.includes("Wi-Fi") && <Wifi size={14} />}
        </div>
        <div className="result-bottom">
          <div className="result-policies">
            <strong>{hotel.mealPlan}</strong>
            <span className={hotel.refundable ? "is-refundable" : ""}>{hotel.refundable ? "Бесплатная отмена" : "Невозвратный тариф"}</span>
            <small>Осталось номеров: {hotel.availableRooms}</small>
          </div>
          <div className="result-price">
            <span>за весь период</span>
            <strong>{formatMoney(hotel.totalPrice)}</strong>
            <small>{formatMoney(hotel.pricePerNight)} / ночь</small>
            <button type="button" onClick={() => track("search_hotel_click", { hotel_id: hotel.id, position })}>Посмотреть номера</button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function MapPreview({ hotels, selectedId, onSelect }: { hotels: HotelSummary[]; selectedId?: string; onSelect: (id: string) => void }) {
  const bounds = useMemo(() => {
    if (!hotels.length) return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
    const latitudes = hotels.map((hotel) => hotel.latitude);
    const longitudes = hotels.map((hotel) => hotel.longitude);
    return {
      minLat: Math.min(...latitudes),
      maxLat: Math.max(...latitudes),
      minLng: Math.min(...longitudes),
      maxLng: Math.max(...longitudes),
    };
  }, [hotels]);

  return (
    <aside className="map-preview" aria-label="Карта найденных отелей">
      <div className="map-streets" />
      <span className="map-caption"><MapPinned size={16} /> Карта · интерактивный слой подключим следующим этапом</span>
      {hotels.slice(0, 18).map((hotel) => {
        const lngRange = Math.max(bounds.maxLng - bounds.minLng, 0.01);
        const latRange = Math.max(bounds.maxLat - bounds.minLat, 0.01);
        const left = 8 + ((hotel.longitude - bounds.minLng) / lngRange) * 82;
        const top = 10 + (1 - (hotel.latitude - bounds.minLat) / latRange) * 76;
        return (
          <button
            type="button"
            key={hotel.id}
            className={selectedId === hotel.id ? "map-price is-active" : "map-price"}
            style={{ left: `${left}%`, top: `${top}%` }}
            onClick={() => onSelect(hotel.id)}
          >
            {formatMoney(hotel.pricePerNight).replace(/\s/g, "")}
          </button>
        );
      })}
    </aside>
  );
}

export default function SearchResultsClient({ initialQuery, initialCheckIn, initialCheckOut, initialGuests }: SearchResultsClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [appliedSearch, setAppliedSearch] = useState({
    query: initialQuery,
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    guests: initialGuests,
  });
  const [sort, setSort] = useState<Sort>("recommended");
  const [stars, setStars] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState(80_000);
  const [refundableOnly, setRefundableOnly] = useState(false);
  const [breakfastOnly, setBreakfastOnly] = useState(false);
  const [data, setData] = useState<SearchResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedHotelId, setSelectedHotelId] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(undefined);

    searchHotels({
      query: appliedSearch.query,
      checkIn: appliedSearch.checkIn,
      checkOut: appliedSearch.checkOut,
      rooms: [{ adults: appliedSearch.guests, childrenAges: [] }],
      currency: "RUB",
      sort,
      filters: {
        stars,
        maxPriceMinor: maxPrice * 100,
        amenities: breakfastOnly ? ["Завтрак"] : [],
        refundableOnly,
      },
      limit: 24,
    }, controller.signal)
      .then((response) => {
        if (!active) return;
        setData(response);
        track("search_results_view", { search_id: response.searchId, total: response.total, sort });
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError("Не удалось получить варианты. Проверьте, что booking-api запущен на порту 8080.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [appliedSearch, breakfastOnly, maxPrice, refundableOnly, sort, stars]);

  const submitSearch = () => {
    const params = new URLSearchParams({ destination: query, checkIn, checkOut, guests: String(guests) });
    router.replace(`/search?${params.toString()}`);
    setAppliedSearch({ query, checkIn, checkOut, guests });
    track("search_modify_submit", { destination: query, check_in: checkIn, check_out: checkOut, guests });
  };

  const toggleStar = (star: number) => {
    setStars((current) => current.includes(star) ? current.filter((value) => value !== star) : [...current, star]);
  };

  return (
    <main className="results-page">
      <header className="results-header">
        <Brand />
        <Link className="results-back" href="/"><ArrowLeft size={16} /> На главную</Link>
        <button className="results-account" type="button">Войти</button>
      </header>

      <section className="results-searchbar" aria-label="Параметры поиска">
        <label><span><MapPin size={14} /> Куда</span><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label><span><CalendarDays size={14} /> Заезд</span><input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} /></label>
        <label><span><CalendarDays size={14} /> Выезд</span><input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /></label>
        <label><span><UsersRound size={14} /> Гости</span><input type="number" min="1" max="8" value={guests} onChange={(event) => setGuests(Number(event.target.value))} /></label>
        <button type="button" onClick={submitSearch}><Search size={18} /> Обновить</button>
      </section>

      <div className="results-layout">
        <aside className="filters-panel">
          <div className="filters-title"><strong><SlidersHorizontal size={17} /> Фильтры</strong><button type="button" onClick={() => { setStars([]); setMaxPrice(80_000); setRefundableOnly(false); setBreakfastOnly(false); }}>Сбросить</button></div>
          <div className="filter-group">
            <span>Цена за ночь — до {maxPrice.toLocaleString("ru-RU")} ₽</span>
            <input type="range" min="5000" max="80000" step="2500" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} />
            <div className="range-labels"><small>5 000 ₽</small><small>80 000 ₽</small></div>
          </div>
          <div className="filter-group">
            <span>Количество звёзд</span>
            {[5, 4, 3].map((star) => <label className="check-row" key={star}><input type="checkbox" checked={stars.includes(star)} onChange={() => toggleStar(star)} /><span>{star} звёзд</span><small>{data?.facets.starCounts[String(star)] ?? "—"}</small></label>)}
          </div>
          <div className="filter-group">
            <span>Условия</span>
            <label className="check-row"><input type="checkbox" checked={refundableOnly} onChange={(event) => setRefundableOnly(event.target.checked)} /><span>Бесплатная отмена</span></label>
            <label className="check-row"><input type="checkbox" checked={breakfastOnly} onChange={(event) => setBreakfastOnly(event.target.checked)} /><span>Завтрак включён</span></label>
          </div>
        </aside>

        <section className="results-list">
          <div className="results-toolbar">
          <div><span className="kicker">Выбрано направление</span><h1>{appliedSearch.query}</h1><p>{loading ? "Ищем лучшие варианты…" : `${data?.total ?? 0} вариантов на выбранные даты`}</p></div>
            <label className="sort-select"><ListFilter size={16} /><select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>{Object.entries(sortLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><ChevronDown size={14} /></label>
          </div>

          {loading && <div className="results-state"><LoaderCircle className="spin" /><strong>Собираем актуальные цены</strong><span>Проверяем доступность номеров</span></div>}
          {error && <div className="results-state is-error"><strong>Поиск временно недоступен</strong><span>{error}</span><button type="button" onClick={() => window.location.reload()}>Повторить</button></div>}
          {!loading && !error && data?.items.length === 0 && <div className="results-state"><strong>Ничего не найдено</strong><span>Попробуйте изменить даты или снять часть фильтров.</span></div>}
          {!loading && !error && data?.items.map((hotel, index) => <HotelResultCard key={hotel.id} hotel={hotel} position={index + 1} />)}
        </section>

        <MapPreview hotels={data?.items ?? []} selectedId={selectedHotelId} onSelect={setSelectedHotelId} />
      </div>
    </main>
  );
}
