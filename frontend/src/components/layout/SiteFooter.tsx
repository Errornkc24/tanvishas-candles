import { Link } from "react-router-dom";

export const INSTAGRAM_URL = "https://www.instagram.com/tanvisha.candles";
export const WHATSAPP_URL = "https://wa.me/918200646640";
export const YOUTUBE_URL = "https://youtube.com/@tanvishacandles";
export const CONTACT_EMAIL = "tanvishascandles@gmail.com";

export function SiteFooter() {
  return (
    <footer className="mt-0 border-t bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2">
        <div>
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
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tanvishas Candles · Cash on Delivery across India
      </div>
    </footer>
  );
}
