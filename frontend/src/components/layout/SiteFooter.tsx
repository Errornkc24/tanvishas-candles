import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";

export const INSTAGRAM_URL = "https://www.instagram.com/tanvisha.candles";
export const WHATSAPP_URL = "https://wa.me/918200646640";
export const YOUTUBE_URL = "https://youtube.com/@tanvishacandles";
export const CONTACT_EMAIL = "tanvishascandles@gmail.com";

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .1 5.4.1 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7a12 12 0 0 0 5.8 1.5h.1c6.6 0 12-5.4 12-12 0-3.2-1.3-6.1-3.7-8.3ZM12.1 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.3-.4a9.7 9.7 0 0 1-1.5-5.2c0-5.5 4.5-10 10-10a9.9 9.9 0 0 1 7.1 2.9 9.9 9.9 0 0 1 2.9 7.1c0 5.5-4.5 9.8-10.1 9.8Zm5.5-7.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.5-.9-2-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.1 4.9 4.3.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.1-1.3-.1-.2-.3-.3-.6-.4Z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-background/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-4">
            <img
              src="/images/logo.webp"
              alt="Tanvishas Candles logo"
              width={112}
              height={112}
              className="h-24 w-24 rounded-full sm:h-28 sm:w-28"
              loading="lazy"
            />
            <span className="font-brand text-2xl text-gold sm:text-3xl">Tanvishas Candles</span>
          </div>
          <p className="mt-4 font-script text-3xl text-bloom">Light up your moments</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Small-batch soy candles, hand-poured with love in India.
          </p>
        </div>
        <div>
          <h3 className="font-brand text-sm text-primary">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/shop" className="hover:text-primary">
                Shop all
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                Our story
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary">
                Track my order
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-brand text-sm text-primary">Say hello</h3>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open Tanvishas on Instagram"
              title="Instagram"
              className="grid h-10 w-10 place-items-center rounded-full border hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Message Tanvishas on WhatsApp"
              title="WhatsApp"
              className="grid h-10 w-10 place-items-center rounded-full border hover:text-primary"
            >
              <WhatsAppIcon />
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open Tanvishas on YouTube"
              title="YouTube"
              className="grid h-10 w-10 place-items-center rounded-full border hover:text-primary"
            >
              <YouTubeIcon />
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label="Email Tanvishas Candles"
              title="Email"
              className="grid h-10 w-10 place-items-center rounded-full border hover:text-primary"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Connect with us through our social channels.
          </p>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tanvishas Candles · Cash on Delivery across India
      </div>
    </footer>
  );
}
