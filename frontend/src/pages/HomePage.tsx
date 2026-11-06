import { Link } from "react-router-dom";
import { Flame, Heart, Instagram, Leaf, Mail, MessageCircle, Quote, Youtube } from "lucide-react";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { ProductCard, ProductCardSkeleton } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/layout/Reveal";
import { Button } from "@/components/ui/button";
import {
  CONTACT_EMAIL,
  INSTAGRAM_URL,
  WHATSAPP_URL,
  YOUTUBE_URL,
} from "@/components/layout/SiteFooter";
import { useProducts, useCategories } from "@/hooks/useProducts";

const testimonials = [
  {
    name: "Priya S.",
    city: "Mumbai",
    text: "The Daisy Candle adds such a cheerful touch to my bedside table. The handmade details make it feel special.",
  },
  {
    name: "Ananya R.",
    city: "Bengaluru",
    text: "I gifted the Lotus Urli Candle to my sister — she loved its delicate shape and has already found a place for it at home.",
  },
  {
    name: "Meera K.",
    city: "Ahmedabad",
    text: "The Iced Coffee Latte Candle looks lovely on my coffee table. It makes such a fun gift for coffee lovers.",
  },
];

function Section({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal className="mb-10 flex flex-col items-center gap-3 text-center">
        <span className="font-brand text-xs tracking-[0.4em] text-primary">{eyebrow}</span>
        <h2 className="text-4xl sm:text-5xl">{title}</h2>
        <div className="gold-divider mt-2 w-32" />
      </Reveal>
      {children}
      {action && <div className="mt-10 flex justify-center">{action}</div>}
    </section>
  );
}

export function Home() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const featured = (products ?? []).filter((p) => p.featured).slice(0, 4);
  const best = (products ?? []).filter((p) => p.bestseller).slice(0, 4);

  return (
    <div className="candle-page-background relative isolate">
      {/* Hero */}
      <section className="relative -mt-16 overflow-hidden pt-16 sm:-mt-20 sm:pt-20">
        <AmbientBackground density={1.8} />
        <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
          <img
            src="/images/logo.webp"
            alt="Tanvishas Candles"
            width={192}
            height={192}
            className="h-36 w-36 rounded-full object-cover shadow-soft sm:h-44 sm:w-44"
          />
          <p className="mt-6 font-brand text-xs tracking-[0.5em] text-muted-foreground">
            HAND-POURED · SMALL BATCH · SOY WAX
          </p>
          <h1 className="mt-6 font-brand text-5xl leading-[1.05] text-gold sm:text-7xl lg:text-8xl">
            Tanvishas
          </h1>
          <p className="mt-2 font-brand text-sm tracking-[0.8em] text-foreground/90 sm:text-base">
            CANDLES
          </p>
          <p className="mt-6 font-script text-4xl text-bloom sm:text-5xl">Light up your moments</p>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Every candle begins in a tiny home studio — slow-melted soy, pure fragrance oils and a
            wish that your evenings feel a little softer.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/shop">Shop the collection</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/about">Our story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 sm:grid-cols-3">
        {[
          { icon: Leaf, t: "100% soy wax", d: "Clean, slow, soot-free burn" },
          { icon: Flame, t: "40+ hour burn", d: "Cotton wicks, even melt pool" },
          { icon: Heart, t: "Made with love", d: "Hand-poured in small batches" },
        ].map((f, i) => (
          <Reveal
            key={f.t}
            delay={i * 120}
            className="flex items-center gap-4 rounded-2xl border bg-card/60 p-5 backdrop-blur"
          >
            <f.icon className="h-8 w-8 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-display text-xl">{f.t}</p>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <Section
        eyebrow="CURATED FOR YOU"
        title="Featured Candles"
        action={
          <Button asChild variant="outline">
            <Link to="/shop">View all candles</Link>
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
        </div>
      </Section>

      <Section eyebrow="FIND YOUR MOOD" title="Shop by Scent">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {(categories ?? []).map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <Link
                to={`/shop?category=${encodeURIComponent(c.slug)}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border"
              >
                <img
                  src={c.image_url ?? ""}
                  alt={`${c.name} candles`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-display text-2xl">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="LOVED BY MANY" title="Best Sellers">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : best.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
        </div>
      </Section>

      {/* About */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <Reveal>
          <img
            src="/images/about.jpg"
            alt="Hand-pouring soy wax into glass jars in our home studio"
            loading="lazy"
            width={1200}
            height={1200}
            className="rounded-3xl border shadow-soft"
          />
        </Reveal>
        <Reveal delay={150}>
          <span className="font-brand text-xs tracking-[0.4em] text-primary">OUR STORY</span>
          <h2 className="mt-3 text-4xl sm:text-5xl">Born from quiet evenings</h2>
          <p className="mt-5 text-muted-foreground">
            Tanvishas began at a kitchen table with a single pot of wax and a love for the way a
            candle can change a room. Today, every jar is still poured by hand, cured for two weeks
            and checked before it reaches you.
          </p>
          <p className="mt-4 text-muted-foreground">
            We use natural soy wax, lead-free cotton wicks and fragrances inspired by Indian
            gardens, temples and monsoon kitchens.
          </p>
          <Button asChild variant="outline" className="mt-8">
            <Link to="/about">Read more</Link>
          </Button>
        </Reveal>
      </section>

      <Section eyebrow="KIND WORDS" title="From Our Candle Family">
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 120}
              className="rounded-2xl border bg-card-gradient p-7"
            >
              <Quote className="h-6 w-6 text-primary" aria-hidden />
              <p className="mt-4 font-display text-xl italic leading-relaxed">“{t.text}”</p>
              <p className="mt-5 text-sm text-muted-foreground">
                {t.name} · {t.city}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <Reveal className="mb-8 text-center">
          <span className="font-brand text-xs font-semibold tracking-[0.35em] text-primary">
            SAY HELLO
          </span>
          <h2 className="mt-2 text-4xl sm:text-5xl">Find us around the web</h2>
          <p className="mt-3 text-muted-foreground">
            Follow along, watch our pours, or get in touch.
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Instagram",
              blurb: "Behind-the-scenes pours and new scent drops.",
              text: "@tanvisha.candles",
              href: INSTAGRAM_URL,
              icon: Instagram,
            },
            {
              name: "WhatsApp",
              blurb: "Questions about a candle or your order?",
              text: "Chat with us",
              href: WHATSAPP_URL,
              icon: MessageCircle,
            },
            {
              name: "YouTube",
              blurb: "Watch candle making and studio moments.",
              text: "Tanvishas Candles",
              href: YOUTUBE_URL,
              icon: Youtube,
            },
            {
              name: "Email",
              blurb: "We’d love to hear from you.",
              text: CONTACT_EMAIL,
              href: `mailto:${CONTACT_EMAIL}`,
              icon: Mail,
            },
          ].map((item) => (
            <Reveal
              key={item.name}
              className="relative flex min-h-64 flex-col items-center overflow-hidden rounded-3xl border bg-card-gradient px-5 py-7 text-center shadow-soft"
            >
              <AmbientBackground density={0.35} />
              <item.icon className="relative h-9 w-9 text-primary" aria-hidden />
              <h3 className="relative mt-4 text-2xl font-semibold">{item.name}</h3>
              <p className="relative mt-2 flex min-h-12 items-start justify-center text-sm font-medium text-muted-foreground">
                {item.blurb}
              </p>
              <Button asChild size="sm" className="relative mt-6 max-w-full">
                <a
                  href={item.href}
                  target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="truncate"
                >
                  {item.text}
                </a>
              </Button>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
