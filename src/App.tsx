import { type FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Bitcoin,
  CalendarDays,
  Check,
  ChevronDown,
  CircleUserRound,
  Globe2,
  Heart,
  Hotel,
  Languages,
  LockKeyhole,
  MapPin,
  Menu,
  MessageCircleQuestion,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { track } from "./analytics";

const hotels = [
  {
    name: "Cap Rocat",
    place: "Майорка, Испания",
    price: "от 46 800 ₽",
    rating: "4.9",
    tag: "У моря",
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=82",
  },
  {
    name: "The Tokyo EDITION",
    place: "Токио, Япония",
    price: "от 38 200 ₽",
    rating: "4.8",
    tag: "Выбор гостей",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=82",
  },
  {
    name: "Casa Cook",
    place: "Родос, Греция",
    price: "от 24 900 ₽",
    rating: "4.9",
    tag: "Тихий отдых",
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=82",
  },
];

const destinations = ["Стамбул", "Дубай", "Бали", "Токио", "Париж", "Пхукет"];

const faqs = [
  {
    question: "Как проходит оплата криптовалютой?",
    answer:
      "После выбора номера вы увидите итоговую цену и доступные монеты. Курс фиксируется на время оплаты, а ваучер приходит сразу после подтверждения транзакции.",
  },
  {
    question: "Нужна ли зарубежная банковская карта?",
    answer:
      "Нет. Для криптооплаты достаточно вашего кошелька. На следующих этапах также можно подключить альтернативные локальные способы оплаты.",
  },
  {
    question: "Что делать, если планы изменились?",
    answer:
      "У каждого тарифа указаны собственные условия отмены. Для возвратных тарифов возврат оформляется через поддержку или личный кабинет.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="Aifory Stay — на главную">
      <span className="logo-mark">
        <span />
        <span />
      </span>
      <span>
        AIFORY
        <strong>STAY</strong>
      </span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  const closeAndTrack = (target: string) => {
    setOpen(false);
    track("navigation_click", { target });
  };

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Основная навигация">
          <a href="#hotels">Отели</a>
          <a href="#how">Как это работает</a>
          <a href="#benefits">Почему Aifory</a>
          <a href="#faq">Помощь</a>
        </nav>
        <div className="header-actions">
          <button className="lang-button" type="button" aria-label="Выбрать язык">
            <Languages size={17} /> RU
          </button>
          <a
            className="button button-dark desktop-account"
            href="#search"
            onClick={() => track("header_cta_click")}
          >
            Найти отель <ArrowDownRight size={17} />
          </a>
          <button
            className="menu-button"
            type="button"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-nav"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <a href="#hotels" onClick={() => closeAndTrack("hotels")}>Отели</a>
            <a href="#how" onClick={() => closeAndTrack("how")}>Как это работает</a>
            <a href="#benefits" onClick={() => closeAndTrack("benefits")}>Почему Aifory</a>
            <a href="#faq" onClick={() => closeAndTrack("faq")}>Помощь</a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function SearchForm() {
  const [destination, setDestination] = useState("Стамбул");
  const [searched, setSearched] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearched(true);
    track("hotel_search_submit", {
      destination,
      check_in: "2026-08-14",
      check_out: "2026-08-21",
      guests: 2,
    });
    document.querySelector("#hotels")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => setSearched(false), 2500);
  };

  return (
    <motion.form
      id="search"
      className="search-panel"
      onSubmit={submit}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.35, ease }}
    >
      <label className="search-field destination-field">
        <span><MapPin size={15} /> Куда</span>
        <input
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          aria-label="Направление"
        />
      </label>
      <label className="search-field">
        <span><CalendarDays size={15} /> Заезд</span>
        <input type="date" defaultValue="2026-08-14" aria-label="Дата заезда" />
      </label>
      <label className="search-field">
        <span><CalendarDays size={15} /> Выезд</span>
        <input type="date" defaultValue="2026-08-21" aria-label="Дата выезда" />
      </label>
      <label className="search-field guests-field">
        <span><UsersRound size={15} /> Гости</span>
        <select defaultValue="2" aria-label="Количество гостей">
          <option value="1">1 гость</option>
          <option value="2">2 гостя</option>
          <option value="3">3 гостя</option>
          <option value="4">4 гостя</option>
        </select>
      </label>
      <button className="search-button" type="submit">
        {searched ? <Check size={20} /> : <Search size={20} />}
        <span>{searched ? "Нашли варианты" : "Найти"}</span>
      </button>
    </motion.form>
  );
}

function HeroVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="hero-visual"
      initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease }}
      aria-label="Подборка отелей по всему миру"
    >
      <div className="visual-grid" />
      <motion.div
        className="sun-orbit"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles size={18} />
      </motion.div>
      <motion.article
        className="floating-card floating-card-main"
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=85"
          alt="Отель с бассейном среди тропической зелени"
        />
        <div className="floating-card-copy">
          <div>
            <span className="eyebrow">Убуд, Бали</span>
            <strong>Hideout Horizon</strong>
          </div>
          <span className="rating"><Star size={13} fill="currentColor" /> 4.9</span>
        </div>
      </motion.article>
      <motion.div
        className="float-note float-note-price"
        animate={reduceMotion ? undefined : { x: [0, 6, 0], y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span>7 ночей</span>
        <strong>142 500 ₽</strong>
        <small>≈ 1 780 USDT</small>
      </motion.div>
      <motion.div
        className="float-note float-note-confirmed"
        animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <BadgeCheck size={22} />
        <span><strong>Бронь подтверждена</strong><small>Ваучер уже в почте</small></span>
      </motion.div>
      <div className="route-line route-line-one" />
      <div className="route-line route-line-two" />
    </motion.div>
  );
}

function Hero() {
  return (
    <main id="top">
      <section className="hero shell">
        <div className="hero-copy">
          <motion.div
            className="pill"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="live-dot" /> 1 000 000+ отелей · оплата в криптовалюте
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.08, ease }}
          >
            Отели без границ.
            <span className="headline-accent"> Путешествия без «не получится».</span>
          </motion.h1>
          <motion.p
            className="hero-lead"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
          >
            Выбирайте место, бронируйте по честной цене и оплачивайте привычным способом — даже если зарубежная карта осталась дома.
          </motion.p>
          <motion.div
            className="hero-points"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span><ShieldCheck size={17} /> Поддержка 24/7</span>
            <span><Zap size={17} /> Ваучер за минуты</span>
            <span><WalletCards size={17} /> USDT, BTC и другие</span>
          </motion.div>
        </div>
        <HeroVisual />
        <SearchForm />
      </section>
    </main>
  );
}

function Marquee() {
  const items = [...destinations, ...destinations];
  return (
    <section className="marquee-section" aria-label="Популярные направления">
      <div className="marquee-track">
        {items.map((destination, index) => (
          <span key={`${destination}-${index}`}>
            {destination} <Sparkles size={16} />
          </span>
        ))}
      </div>
    </section>
  );
}

function HotelCards() {
  return (
    <section className="section shell" id="hotels">
      <div className="section-heading">
        <div>
          <span className="kicker">Куда хочется прямо сейчас</span>
          <h2>Отели с характером,<br />отобранные для вас</h2>
        </div>
        <a className="round-link" href="#search" onClick={() => track("all_hotels_click")}>
          Все отели <ArrowRight size={18} />
        </a>
      </div>
      <div className="hotel-grid">
        {hotels.map((hotel, index) => (
          <motion.article
            className="hotel-card"
            key={hotel.name}
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: index * 0.1, ease }}
          >
            <div className="hotel-photo">
              <img src={hotel.image} alt={`${hotel.name}, ${hotel.place}`} loading="lazy" />
              <span className="hotel-tag">{hotel.tag}</span>
              <button
                type="button"
                className="heart-button"
                aria-label={`Добавить ${hotel.name} в избранное`}
                onClick={() => track("hotel_favorite", { hotel_name: hotel.name })}
              >
                <Heart size={19} />
              </button>
            </div>
            <div className="hotel-info">
              <div>
                <span className="hotel-place"><MapPin size={14} /> {hotel.place}</span>
                <h3>{hotel.name}</h3>
              </div>
              <span className="hotel-rating"><Star size={14} fill="currentColor" /> {hotel.rating}</span>
            </div>
            <div className="hotel-bottom">
              <span><strong>{hotel.price}</strong> / ночь</span>
              <button
                type="button"
                onClick={() => track("hotel_card_click", { hotel_name: hotel.name, position: index + 1 })}
              >
                Смотреть <ArrowRight size={16} />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Search, number: "01", title: "Найдите своё место", text: "Город, даты, пожелания — мы покажем актуальные номера и цены." },
    { icon: BedDouble, number: "02", title: "Выберите номер", text: "Сравните условия, питание и отмену без спрятанных деталей." },
    { icon: Bitcoin, number: "03", title: "Оплатите как удобно", text: "Переведите криптовалюту и получите подтверждение брони." },
  ];

  return (
    <section className="section dark-section" id="how">
      <div className="shell">
        <div className="section-heading inverse">
          <div>
            <span className="kicker">Меньше формальностей — больше путешествий</span>
            <h2>От идеи до заселения<br />за три понятных шага</h2>
          </div>
          <span className="giant-arrow"><ArrowDownRight /></span>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                className="step-card"
                key={step.number}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.55, delay: index * 0.12 }}
              >
                <div className="step-card-top">
                  <span className="step-icon"><Icon size={23} /></span>
                  <span className="step-number">{step.number}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                {index < 2 && <span className="step-connector"><ArrowRight /></span>}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="section shell benefits" id="benefits">
      <div className="benefits-visual">
        <motion.div
          className="passport-card"
          initial={{ rotate: -8, opacity: 0, y: 30 }}
          whileInView={{ rotate: -4, opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          <Globe2 size={38} />
          <span>AIFORY</span>
          <strong>TRAVEL<br />PASS</strong>
          <small>WORLDWIDE ACCESS · 2026</small>
        </motion.div>
        <motion.div
          className="booking-ticket"
          initial={{ rotate: 5, opacity: 0, x: 20 }}
          whileInView={{ rotate: 3, opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15, ease }}
        >
          <div className="ticket-route"><strong>MOW</strong><span>···· ✈ ····</span><strong>IST</strong></div>
          <span>14 AUG — 21 AUG</span>
          <div className="ticket-code" />
        </motion.div>
        <div className="benefit-stamp">NO<br />BORDERS</div>
      </div>
      <div className="benefits-copy">
        <span className="kicker">Свобода выбора — в каждой поездке</span>
        <h2>Не просто бронь.<br />Ваш путь в любую точку.</h2>
        <p className="benefits-lead">Мы убираем платёжные барьеры и оставляем главное: предвкушение нового города, любимого завтрака и вида из окна.</p>
        <div className="benefit-list">
          <div><span><LockKeyhole /></span><p><strong>Цена фиксируется</strong>Курс не изменится, пока вы оплачиваете заказ.</p></div>
          <div><span><CircleUserRound /></span><p><strong>Поддержка остаётся рядом</strong>Поможем до поездки, во время и после неё.</p></div>
          <div><span><Hotel /></span><p><strong>Только подтверждённые варианты</strong>Показываем прозрачные условия и реальную доступность.</p></div>
        </div>
      </div>
    </section>
  );
}

function TrustBanner() {
  return (
    <section className="shell trust-banner">
      <div>
        <span className="kicker">Aifory — финансовая опора путешественника</span>
        <h2>Спокойно оплачивайте.<br />Смело отправляйтесь.</h2>
      </div>
      <div className="trust-metrics">
        <p><strong>180+</strong><span>стран</span></p>
        <p><strong>24/7</strong><span>поддержка</span></p>
        <p><strong>4.9</strong><span>оценка сервиса</span></p>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="section shell faq" id="faq">
      <div className="faq-heading">
        <span className="faq-icon"><MessageCircleQuestion /></span>
        <span className="kicker">Всё, что важно знать</span>
        <h2>Вопросы перед<br />путешествием</h2>
        <p>Если ответа не нашлось, команда поддержки на связи круглосуточно.</p>
      </div>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <details
            key={faq.question}
            onToggle={(event) => {
              if (event.currentTarget.open) track("faq_open", { question_index: index + 1 });
            }}
          >
            <summary>{faq.question}<ChevronDown size={20} /></summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="shell final-cta">
      <div className="cta-orbit cta-orbit-one" />
      <div className="cta-orbit cta-orbit-two" />
      <span className="cta-pin pin-one"><MapPin /></span>
      <span className="cta-pin pin-two"><Sparkles /></span>
      <span className="pill light"><Globe2 size={14} /> Весь мир — в одном поиске</span>
      <h2>Ваш следующий отель<br />уже где-то ждёт.</h2>
      <p>Осталось только выбрать направление.</p>
      <a className="button button-accent" href="#search" onClick={() => track("final_cta_click")}>
        Начать путешествие <ArrowRight size={18} />
      </a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer shell">
      <div className="footer-main">
        <div><Logo /><p>Бронируйте отели по всему миру<br />и платите привычным способом.</p></div>
        <div className="footer-links"><strong>Сервис</strong><a href="#hotels">Отели</a><a href="#how">Как это работает</a><a href="#faq">Поддержка</a></div>
        <div className="footer-links"><strong>Компания</strong><a href="#benefits">О Aifory</a><a href="#top">Контакты</a><a href="#top">Партнёрам</a></div>
        <div className="footer-support"><span>Есть вопрос?</span><strong>Мы онлайн 24/7</strong><button type="button" onClick={() => track("support_click")}>Написать нам <ArrowRight size={16} /></button></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Aifory Stay</span><span>Политика конфиденциальности</span><span>Пользовательское соглашение</span><span className="footer-status"><i /> Все системы работают</span></div>
    </footer>
  );
}

export default function App() {
  useEffect(() => {
    track("landing_view", { page_variant: "travel_editorial_v1" });

    const timer = window.setTimeout(() => track("engaged_30_seconds"), 30_000);
    const tracked = new Set<number>();
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const depth = Math.round((window.scrollY / scrollable) * 100);
      [25, 50, 75, 90].forEach((milestone) => {
        if (depth >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);
          track("scroll_depth", { percent: milestone });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <Header />
      <Hero />
      <Marquee />
      <HotelCards />
      <HowItWorks />
      <Benefits />
      <TrustBanner />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  );
}
