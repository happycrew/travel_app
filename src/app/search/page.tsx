import type { Metadata } from "next";
import SearchResultsClient from "./search-results-client";

export const metadata: Metadata = {
  title: "Поиск отелей",
  description: "Сравните отели, цены и условия проживания в выбранном направлении.",
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function single(value: string | string[] | undefined, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <SearchResultsClient
      initialQuery={single(params.destination, "Стамбул")}
      initialCheckIn={single(params.checkIn, "2026-08-14")}
      initialCheckOut={single(params.checkOut, "2026-08-21")}
      initialGuests={Number(single(params.guests, "2")) || 2}
    />
  );
}
