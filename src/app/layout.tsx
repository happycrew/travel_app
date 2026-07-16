import type { Metadata } from "next";
import "../styles.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://quiet-orbit-7k9m.vercel.app"),
  title: {
    default: "Aifory Stay — отели без границ",
    template: "%s · Aifory Stay",
  },
  description: "Бронирование отелей по всему миру с оплатой криптовалютой.",
  openGraph: {
    title: "Aifory Stay — отели без границ",
    description: "Ищите и бронируйте отели по всему миру без платёжных ограничений.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Unbounded:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
