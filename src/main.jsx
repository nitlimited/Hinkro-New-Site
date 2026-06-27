import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Play,
  X,
} from "lucide-react";
import "./styles.css";

const navItems = [
  ["Inspiring Tradition", "tradition"],
  ["Design", "design"],
  ["Bespoke", "bespoke"],
  ["Accessories", "accessories"],
  ["Store", "store"],
];

const logoUrl =
  "/images/hinkro-kente-bespoke-kente-weaving-services-logo.png";

const slides = [
  {
    image: "/images/bespoke-kente-weaving-services-hinkro-kente-loom.jpg",
    imageAlt:
      "Bespoke Kente weaving services by Hinkro Kente on a traditional loom",
    text: (
      <>
        Kente is not just a fabric;{" "}
        <strong>it is a work of art</strong>, hand-made to order exclusively
        just for you by our team of highly skilled craftsmen and designers.
      </>
    ),
  },
  {
    image: "/images/made-to-order-bespoke-kente-weaving-services.webp",
    imageAlt: "Made-to-order bespoke Kente weaving services in progress",
    text: (
      <>
        The start is <strong>understanding your dream</strong>. Then creating
        handmade sketches and illustrations for a physical weaving blueprint.
      </>
    ),
  },
  {
    image: "/images/authentic-bespoke-kente-weaving-services-ghana.jpg",
    imageAlt: "Authentic Ghanaian bespoke Kente weaving services",
    text: (
      <>
        We inspire tradition at the very core of Hinkro Kente, where{" "}
        <strong>Innovation</strong> and <strong>Aspiration</strong> unfold.
      </>
    ),
  },
];

const traditionCarouselItems = [
  {
    title: "Attention to details",
    image: "/images/inspiring-tradition-carousel-attention-details.jpg",
  },
  {
    title: "Craftmanship",
    image: "/images/inspiring-tradition-carousel-craftmanship.jpg",
  },
  {
    title: "Exclusivity for you",
    image: "/images/inspiring-tradition-carousel-exclusivity.jpg",
  },
  {
    title: "Tradition and new ways",
    image: "/images/inspiring-tradition-carousel-tradition-new-ways.jpg",
  },
];

const traditionCarouselCopy =
  "At Hinkro Kente, every masterpiece begins with passion, precision, and artistry. Our master weavers create kente cloths that are more than fabric — they are personal statements of elegance, woven to embody your story.";

const valueCards = [
  {
    title: "Royal-standard quality through stringent process",
    text: "At Hinkro Kente, we prioritize quality. Our custom kente cloth undergoes strict processes to meet high standards, akin to royalty.",
    image: "/images/inspiring-tradition-carousel-craftsmanship.jpg",
  },
  {
    title: "Customized accessories for a complete look",
    text: "Equip yourself in style for a complete look. Enhance your outfit with accessories that are well-designed, practical, and refined.",
    image: "/images/hinkro-value-card-customized-accessories.jpg",
  },
  {
    title: "Additional services from aisle to every occasion",
    text: "Enjoy Hinkro’s signature after-sales care, with style support and thoughtful transformations for meaningful occasions.",
    image: "/images/hinkro-value-card-additional-services.jpg",
  },
];

const trendsNewsImages = [
  {
    className: "trend-image-one",
    src: "/images/hinkro-kente-trends-news-purple-red-kente-gown.jpg",
    alt: "Bespoke Hinkro Kente purple and red gown inspiration",
  },
  {
    className: "trend-image-two",
    src: "/images/hinkro-kente-trends-news-yellow-bridal-kente.jpg",
    alt: "Yellow bridal Kente fashion inspiration by Hinkro Kente",
  },
  {
    className: "trend-image-three",
    src: "/images/hinkro-kente-trends-news-green-blue-kente-gown.jpg",
    alt: "Green and blue bespoke Kente gown trend inspiration",
  },
  {
    className: "trend-image-four",
    src: "/images/hinkro-kente-trends-news-peach-bespoke-kente-gown.jpg",
    alt: "Peach bespoke Kente gown trend inspiration",
  },
  {
    className: "trend-image-five",
    src: "/images/hinkro-kente-trends-news-silver-blue-kente-fan.jpg",
    alt: "Silver and blue Hinkro Kente gown with fan",
  },
  {
    className: "trend-image-six",
    src: "/images/hinkro-kente-trends-news-gold-garden-kente-gown.jpg",
    alt: "Gold garden bespoke Kente gown inspiration",
  },
];

const historyItems = [
  {
    year: "2018",
    text: "Since our beginning in 2018, our goal has always been to create customized kente fabrics that look great in design and rich in culture. We began by offering already-made designs loved by early customers.",
  },
  {
    year: "2020",
    text: "Work began in full pursuit of our goal. We secured three trusted weavers in addition to the Hinkro team and started producing customized orders with more structure and care.",
  },
  {
    year: "2022",
    text: "Sales, shipments, and customer reviews strengthened our reputation. Hinkro Kente’s rich designs and cultural detail were featured at executive traditional functions in Ghana.",
  },
  {
    year: "2024",
    text: "Hinkro Kente quickly established itself as a household name and cherished family legacy, attracting a growing number of exclusive clients through exceptional service and post-service care.",
  },
  {
    year: "2026",
    text: "Hinkro Kente continues to stand as one of Ghana’s trusted bespoke Kente services, growing with speed, refinement, and a clear promise: every piece must carry culture, story, and distinction.",
  },
];

const fallbackReviewItems = [
  {
    name: "Elsie Osei Agyapong",
    age: "1 year ago",
    rating: 5,
    text: "Made a perfect birthday gift 🎁 with very short notice. Updated me all the way. Great service! Great packaging too",
  },
  {
    name: "Akua Serwaa",
    age: "1 year ago",
    rating: 5,
    text: "Beautifully woven Kente with excellent finishing. The Hinkro team made the process easy and helped me choose the right colours.",
  },
  {
    name: "Kwame Boateng",
    age: "2 years ago",
    rating: 5,
    text: "Professional service and authentic quality. My family loved the final cloth and the delivery was handled with care.",
  },
];

let googleMapsScriptPromise;

function loadGoogleMapsScript(apiKey) {
  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const callbackName = `initHinkroGoogleReviews${Date.now()}`;
    const script = document.createElement("script");

    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google);
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => reject(new Error("Google Reviews could not load."));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

const faqItems = [
  {
    question: "What is Kente cloth or fabric ?",
    answer:
      "Kente cloth is a traditional Ghanaian textile made from silk, cotton, rayon or polyester, known for vibrant colors and intricate geometric patterns. Each design has cultural significance, representing history, social status, values, heritage, prestige, and pride.",
  },
  {
    question: "How are Kente cloth made ?",
    answer:
      "Kente cloth is made by weaving narrow strips of fabric on a loom, combining silk or cotton threads into intricate patterns. These strips are then sewn together to create larger pieces, requiring skilled craftsmanship and careful attention to detail.",
  },
  {
    question: "What is the price for Kente cloth ?",
    answer:
      "At Hinkro, the price of Kente cloth varies depending on pattern complexity, materials, and fabric size. Kente can range from around $70 to several hundred dollars per piece, with authentic handwoven Kente costing more than wax print versions.",
  },
  {
    question: "Do you produce original or authentic Kente for Engagement ?",
    answer:
      "Yes. Hinkro Kente produces authentic, handwoven Kente cloth, combining traditional craftsmanship with modern design techniques to ensure originality and high quality in every piece.",
  },
  {
    question: "Where are you located ?",
    answer:
      "Hinkro Kente is based in Accra, Ghana, specifically in Ablekuma, where our weaving studio is located. We also have a presence in Atlanta, Georgia, in the United States, and Leicester in the United Kingdom.",
  },
  {
    question: "I want a kente fabric made in my preferred colors ?",
    answer:
      "Hinkro Kente produces Kente fabric in customers’ preferred colors, offering personalized designs for individual tastes and special requests while maintaining the authenticity of traditional weaving.",
  },
  {
    question: "Do you ship outside Ghana ?",
    answer: "Yes! We ship to any country in the world.",
  },
  {
    question: "What are the steps in acquiring a kente from you ?",
    answer:
      "Customers begin by booking an appointment with Hinkro for a fee of $50. During the appointment, they discuss preferred colors, patterns, and design requirements, choose from existing designs or request a custom pattern, receive a quote, and wait for the handcrafted Kente to be produced and delivered.",
  },
];

function getCurrentPage() {
  const hash = window.location.hash.replace("#", "");
  return hash === "tradition" ? "tradition" : "home";
}

function Header({ currentPage }) {
  const [open, setOpen] = useState(false);
  const isHome = currentPage === "home";

  return (
    <header className={`site-header ${isHome ? "home-header" : "inner-header"}`}>
      <a className="brand" href="#home" aria-label="Hinkro Kente home">
        <img src={logoUrl} alt="Hinkro Kente bespoke Kente weaving services" />
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map(([label, id]) => (
          <a
            key={id}
            href={`#${id}`}
            className={currentPage === id ? "is-active" : ""}
          >
            {label}
          </a>
        ))}
      </nav>

      <a className="nav-cta" href="https://hinkrokente.com/appointment/">
        Your Kente Awaits
      </a>

      <button
        className="menu-toggle"
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="mobile-panel">
          <div className="mobile-panel-inner">
            <img
              className="mobile-panel-logo"
              src={logoUrl}
              alt="Hinkro Kente bespoke Kente weaving services"
            />

            <nav className="mobile-panel-nav" aria-label="Mobile navigation">
              {navItems.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={currentPage === id ? "is-active" : ""}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              ))}
            </nav>

            <a className="mobile-panel-cta" href="https://hinkrokente.com/appointment/">
              Your Kente Awaits
            </a>

            <div className="mobile-socials" aria-label="Social links">
              <a href="https://web.facebook.com/hinkro" aria-label="Facebook">
                f
              </a>
              <a href="https://www.pinterest.com/hinkrokente/" aria-label="Pinterest">
                x
              </a>
              <a href="https://www.instagram.com/hinkrokente/" aria-label="Instagram">
                ◎
              </a>
            </div>

            <p className="mobile-copyright">
              © Hinkro Kente 2025. All right reserved. Terms and Privacy.
              <br />
              Built and managed by Nusite IT Consulting Limited
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

function InspiringTradition() {
  return (
    <main className="tradition-page">
      <section
        className="tradition-intro"
        aria-labelledby="inspiring-tradition-title"
      >
        <div className="tradition-art left-art" aria-hidden="true">
          <img
            src="/images/inspiring-tradition-kente-weave-illustration.png"
            alt=""
          />
        </div>

        <article className="tradition-copy">
          <p className="section-kicker">About Us</p>
          <h1 id="inspiring-tradition-title">
            Hinkro Kente designs and hand-weaves bespoke kente textiles,
            crafted to each client&apos;s unique vision. We combine authentic
            Ghanaian weaving tradition with refined design to create
            one-of-a-kind luxury pieces for weddings, special events, and
            heritage celebrations.
          </h1>
          <p className="tradition-lead">
            We serve discerning brides, grooms, families, and cultural
            enthusiasts—in Ghana, Africa, and the diaspora—who want more than
            just fabric. Our clients value authenticity, artistry, and personal
            storytelling woven into every thread.
          </p>
          <p className="tradition-body">
            Because kente is more than clothing—it&apos;s identity, heritage,
            and pride. Every Hinkro piece preserves centuries-old artistry while
            expressing the modern elegance and individuality of its wearer. We
            make sure that when you step out in Hinkro Kente, you carry both
            your story and your culture with unmatched beauty and dignity.
          </p>
        </article>

        <div className="tradition-art right-art" aria-hidden="true">
          <img src="/images/inspiring-tradition-table-loom.svg" alt="" />
        </div>
      </section>

      <section
        className="tradition-exclusivity"
        aria-labelledby="tradition-exclusivity-title"
      >
        <div className="tradition-divider" aria-hidden="true" />
        <div className="tradition-exclusivity-copy">
          <h2 id="tradition-exclusivity-title">
            Committed to exclusivity.
          </h2>
          <p>
            Our goal is to advance the rich tradition of Kente weaving by
            integrating modern technology and design innovation, creating unique
            and high-quality patterns that meet the evolving tastes of
            contemporary fashion. Through our work, we aim to sustain cultural
            heritage, promote craftsmanship, and provide individuals with
            meaningful, personalized textiles that tell their stories.
          </p>
        </div>

        <button
          className="tradition-video-preview"
          type="button"
          aria-label="Play Hinkro Kente tradition video"
        >
          <img
            src="/images/inspiring-tradition-committed-exclusivity-video-preview.jpg"
            alt="Hinkro Kente bespoke Kente weaving story video preview"
          />
          <span className="play-button" aria-hidden="true">
            <Play size={34} fill="currentColor" strokeWidth={0} />
          </span>
        </button>

        <TraditionFeatureCarousel />
      </section>

      <ValueSection />
      <HistorySection />
      <ReviewsFaqSection />
      <TrendsNewsSection />
      <SiteFooter />
    </main>
  );
}


function FooterSocialIcon({ type }) {
  if (type === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.35" cy="6.65" r="1.15" />
      </svg>
    );
  }

  if (type === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10" />
        <path d="M14.68 8.22h-1.5c-.72 0-1.08.42-1.08 1.12v1.42h2.42l-.38 2.46H12.1v5.92H9.5v-5.92H7.64v-2.46H9.5V9.12c0-2.2 1.32-3.5 3.5-3.5.76 0 1.38.06 1.68.12v2.48Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" />
      <path d="M10.15 20.05c.45-1.14.86-2.68 1.07-3.62.18-.76.93-3.62.93-3.62s-.24-.5-.24-1.22c0-1.14.66-1.99 1.48-1.99.7 0 1.04.52 1.04 1.16 0 .7-.45 1.76-.68 2.74-.2.82.42 1.48 1.24 1.48 1.48 0 2.48-1.9 2.48-4.16 0-1.72-1.16-3-3.26-3-2.38 0-3.86 1.78-3.86 3.77 0 .69.2 1.17.51 1.55.15.18.17.26.12.47l-.18.75c-.06.24-.24.34-.5.24-1.08-.44-1.58-1.63-1.58-2.96 0-2.22 1.88-4.9 5.6-4.9 3 0 4.98 2.16 4.98 4.48 0 3.08-1.72 5.37-4.27 5.37-.86 0-1.68-.47-1.96-1 0 0-.46 1.82-.56 2.17-.2.72-.62 1.54-1 2.14-.45.1-.9.15-1.36.15Z" />
    </svg>
  );
}

function TrendsNewsSection() {
  return (
    <section className="trends-news-section" aria-labelledby="trends-news-title">
      <div className="trends-news-inner">
        <div className="trends-news-divider" aria-hidden="true" />
        <h2 id="trends-news-title">
          Learn exciting trends and news, get helpful inspiration, advice and
          resources here.
        </h2>

        <a className="trends-news-cta" href="#store">
          Kente Trends and News
        </a>
      </div>

      <div className="trends-carousel" aria-label="Kente trends and news gallery">
        {trendsNewsImages.map((image, index) => (
          <figure
            className="trend-card"
            key={image.src}
            style={{ "--trend-delay": `${index * 90}ms` }}
          >
            <img src={image.src} alt={image.alt} />
            <div className="trend-card-overlay" aria-hidden="true" />
          </figure>
        ))}
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <>
      <section className="shop-footer-cta" aria-labelledby="shop-footer-title">
        <h2 id="shop-footer-title">
          Visit our Kente Shop for our curated kente fabric just for you
        </h2>
        <a className="shop-footer-button" href="#store">
          Shop Now <span aria-hidden="true">→</span>
        </a>
      </section>

      <footer className="site-footer" aria-label="Website footer">
        <nav className="footer-socials" aria-label="Hinkro Kente social media">
          <a href="https://www.instagram.com/hinkrokente/" aria-label="Instagram">
            <FooterSocialIcon type="instagram" />
          </a>
          <a href="https://web.facebook.com/hinkro" aria-label="Facebook">
            <FooterSocialIcon type="facebook" />
          </a>
          <a href="https://www.pinterest.com/hinkrokente/" aria-label="Pinterest">
            <FooterSocialIcon type="pinterest" />
          </a>
        </nav>

        <p className="footer-copyright">
          Copyright © Hinkro Kente 2026 All Rights Reserved. <a href="#terms">Terms of Use</a> and <a href="#privacy">Privacy Policy</a>
        </p>

        <img
          className="footer-payments"
          src="/images/hinkro-kente-payment-options-paystack.svg"
          alt="Payment options including Mastercard, Visa, MTN MoMo, Apple Pay, and AirtelTigo Money"
        />
      </footer>
    </>
  );
}

function ReviewsFaqSection() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="reviews-faq-section" aria-labelledby="reviews-faq-title">
      <div className="reviews-faq-divider" aria-hidden="true" />
      <h2 id="reviews-faq-title" className="sr-only">
        Reviews and Frequently Asked Questions
      </h2>

      <div className="reviews-faq-grid">
        <div className="reviews-column">
          <h3>Reviews</h3>
          <GoogleReviewsWidget />
        </div>

        <div className="faq-column">
          <h3>Frequently Asked Questions (FAQ)</h3>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <article className="faq-item" key={item.question}>
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon" aria-hidden="true">⌄</span>
                </button>
                <div className={openFaq === index ? "faq-answer is-open" : "faq-answer"}>
                  <p>{item.answer}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GoogleReviewsWidget() {
  const [activeReview, setActiveReview] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [placeSummary, setPlaceSummary] = useState(null);
  const [status, setStatus] = useState("idle");
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const placeId = import.meta.env.VITE_GOOGLE_PLACE_ID;
  const hasGoogleConfig = Boolean(apiKey && placeId);
  const visibleReviews = reviews.length ? reviews : fallbackReviewItems;
  const review = visibleReviews[activeReview % visibleReviews.length];

  useEffect(() => {
    if (!hasGoogleConfig) return;

    let cancelled = false;

    setStatus("loading");

    loadGoogleMapsScript(apiKey)
      .then((google) => {
        if (cancelled) return;

        const container = document.createElement("div");
        const service = new google.maps.places.PlacesService(container);

        service.getDetails(
          {
            placeId,
            fields: ["name", "rating", "user_ratings_total", "reviews", "url"],
          },
          (place, serviceStatus) => {
            if (cancelled) return;

            if (
              serviceStatus !== google.maps.places.PlacesServiceStatus.OK ||
              !place
            ) {
              setStatus("error");
              return;
            }

            const googleReviews = (place.reviews || []).map((item) => ({
              name: item.author_name,
              age: item.relative_time_description,
              rating: item.rating,
              text: item.text,
              photo: item.profile_photo_url,
            }));

            setPlaceSummary({
              name: place.name,
              rating: place.rating,
              total: place.user_ratings_total,
              url: place.url,
            });
            setReviews(googleReviews);
            setActiveReview(0);
            setStatus("ready");
          },
        );
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, hasGoogleConfig, placeId]);

  const goToReview = (direction) => {
    setActiveReview((index) => {
      const nextIndex = index + direction;
      if (nextIndex < 0) return visibleReviews.length - 1;
      if (nextIndex >= visibleReviews.length) return 0;
      return nextIndex;
    });
  };

  return (
    <div
      className={`review-widget ${hasGoogleConfig ? "is-live" : "needs-config"}`}
      aria-live="polite"
    >
      <div className="review-source">
        <span className="google-mark">G</span>
        <span>
          {hasGoogleConfig
            ? status === "ready"
              ? "Live Google Reviews"
              : "Connecting Google Reviews"
            : "Google Reviews Widget"}
        </span>
      </div>

      {!hasGoogleConfig && (
        <p className="review-config-note">
          Add `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_PLACE_ID` to connect
          this widget to Hinkro Kente’s Google Business reviews.
        </p>
      )}

      {hasGoogleConfig && status === "error" && (
        <p className="review-config-note">
          Google Reviews could not load. Please confirm the Maps JavaScript API,
          Places API, API key, and Place ID are active.
        </p>
      )}

      {placeSummary && (
        <a
          className="review-business-summary"
          href={placeSummary.url}
          target="_blank"
          rel="noreferrer"
        >
          <strong>{placeSummary.rating?.toFixed?.(1) || placeSummary.rating}</strong>
          <span>rating from {placeSummary.total} Google reviews</span>
        </a>
      )}

      <div className="review-avatar">
        {review.photo ? (
          <img src={review.photo} alt="" />
        ) : (
          <span>{review.name?.charAt(0) || "H"}</span>
        )}
        <strong>G</strong>
      </div>
      <h4>{review.name}</h4>
      <p className="review-age">{review.age}</p>
      <div className="review-stars" aria-label={`${review.rating || 5} star Google review`}>
        {"★".repeat(Math.round(review.rating || 5))}
        <span>✹</span>
      </div>
      <p className="review-text">{review.text}</p>
      <button
        className="review-arrow review-arrow-left"
        type="button"
        aria-label="Previous review"
        onClick={() => goToReview(-1)}
      >
        <ChevronLeft size={28} strokeWidth={2.2} />
      </button>
      <button
        className="review-arrow review-arrow-right"
        type="button"
        aria-label="Next review"
        onClick={() => goToReview(1)}
      >
        <ChevronRight size={28} strokeWidth={2.2} />
      </button>
    </div>
  );
}

function HistorySection() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateHistory = () => {
      const section = sectionRef.current;

      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const travel = Math.max(rect.height - viewportHeight, 1);
      const nextProgress = Math.min(
        Math.max((viewportHeight * 0.34 - rect.top) / travel, 0),
        1,
      );

      setProgress(nextProgress);
      setActiveIndex(
        Math.min(
          historyItems.length - 1,
          Math.floor(nextProgress * historyItems.length),
        ),
      );
    };

    updateHistory();
    window.addEventListener("scroll", updateHistory, { passive: true });
    window.addEventListener("resize", updateHistory);

    return () => {
      window.removeEventListener("scroll", updateHistory);
      window.removeEventListener("resize", updateHistory);
    };
  }, []);

  return (
    <section
      className="history-section"
      ref={sectionRef}
      style={{ "--history-progress": progress }}
      aria-labelledby="history-title"
    >
      <div className="history-sticky">
        <h2 id="history-title">Our History</h2>

        <img
          className="history-tape"
          src="/images/inspiring-tradition-history-measuring-tape.png"
          alt=""
          aria-hidden="true"
        />

        <div className="history-timeline" aria-label="Hinkro Kente history timeline">
          <div className="history-line" aria-hidden="true" />
          <div className="history-line-progress" aria-hidden="true" />

          {historyItems.map((item, index) => (
            <article
              className={`history-item ${
                index === activeIndex ? "is-active" : ""
              } ${index < activeIndex ? "is-past" : ""}`}
              key={item.year}
            >
              <div className="history-year">{item.year}</div>
              <div className="history-star" aria-hidden="true">★</div>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueSection() {
  return (
    <section className="value-section" aria-labelledby="value-title">
      <div className="value-divider" aria-hidden="true" />

      <div className="value-header">
        <div className="value-copy">
          <h2 id="value-title">How we add value</h2>
          <p>
            Kente cloth symbolizes prestige and heritage. At Hinkro Kente, we
            aim to preserve and enhance this tradition. Our custom weaving
            services provide high-quality, unique pieces fit for royalty.
          </p>
          <a className="value-cta" href="https://hinkrokente.com/appointment/">
            Bespoke Service <span aria-hidden="true">→</span>
          </a>
        </div>

        <img
          className="value-yarn"
          src="/images/inspiring-tradition-yarn-value-illustration.png"
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="value-cards" aria-label="Hinkro Kente service values">
        {valueCards.map((card) => (
          <article className="value-card" key={card.title}>
            <img src={card.image} alt={`${card.title} by Hinkro Kente`} />
            <div className="value-card-overlay">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="value-divider value-divider-bottom" aria-hidden="true" />
    </section>
  );
}

function TraditionFeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const visibleCount = 1;
  const pageCount = Math.ceil(traditionCarouselItems.length / visibleCount);
  const carouselLoopItems = [
    ...traditionCarouselItems,
    ...traditionCarouselItems,
  ];
  const activePage = Math.floor(
    (activeIndex % traditionCarouselItems.length) / visibleCount,
  );

  const moveCarousel = (pageIndex) => {
    setIsTransitioning(true);
    setActiveIndex(pageIndex * visibleCount);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsTransitioning(true);
      setActiveIndex((index) => index + visibleCount);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const handleTransitionEnd = () => {
    if (activeIndex < traditionCarouselItems.length) return;

    setIsTransitioning(false);
    setActiveIndex(activeIndex % traditionCarouselItems.length);
  };

  return (
    <div className="tradition-carousel" aria-label="Hinkro Kente values carousel">
      <div className="tradition-carousel-topline">
        <span>Our approach</span>
        <div className="tradition-carousel-pagination" aria-label="Carousel pages">
          {Array.from({ length: pageCount }).map((_, pageIndex) => (
            <button
              className={pageIndex === activePage ? "is-active" : ""}
              key={pageIndex}
              type="button"
              aria-label={`Show carousel page ${pageIndex + 1}`}
              onClick={() => moveCarousel(pageIndex)}
            />
          ))}
        </div>
      </div>

      <div className="tradition-carousel-viewport">
        <div
          className="tradition-carousel-track"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translate3d(calc(${activeIndex} * var(--carousel-step) * -1), 0, 0)`,
            transition: isTransitioning
              ? "transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
          }}
        >
          {carouselLoopItems.map((item, index) => (
            <article className="tradition-carousel-card" key={`${item.title}-${index}`}>
              <div className="tradition-carousel-image">
                <img src={item.image} alt={`${item.title} at Hinkro Kente`} />
              </div>
              <div className="tradition-carousel-copy">
                <h3>{item.title}</h3>
                <p>{traditionCarouselCopy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 6200);

    return () => window.clearInterval(timer);
  }, []);

  const goToSlide = (direction) => {
    setActiveIndex((index) => {
      const nextIndex = index + direction;
      if (nextIndex < 0) return slides.length - 1;
      if (nextIndex >= slides.length) return 0;
      return nextIndex;
    });
  };

  return (
    <section
      className="hero"
      id="home"
      aria-label="Bespoke Kente Weaving Services by Hinkro Kente"
    >
      <h1 className="seo-title">
        Bespoke Kente Weaving Services | Hinkro Kente
      </h1>
      {slides.map((slide, index) => (
        <div
          className={`hero-bg ${activeIndex === index ? "is-active" : ""}`}
          key={slide.image}
          role="img"
          aria-label={slide.imageAlt}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}
      <div className="hero-shade" />

      <button
        className="hero-arrow left"
        type="button"
        aria-label="Previous slide"
        onClick={() => goToSlide(-1)}
      >
        <ChevronLeft size={38} strokeWidth={1.4} />
      </button>

      <div className="hero-content" key={activeIndex}>
        <p>{activeSlide.text}</p>
        <a className="mobile-hero-cta" href="https://wa.link/yeqwcd">
          Start Your Kente Now
        </a>
      </div>

      <div className="hero-marquee" aria-hidden="true">
        <span>Bespoke Kente Weaving Services</span>
        <span>Bespoke Kente Weaving Services</span>
      </div>

      <button
        className="hero-arrow right"
        type="button"
        aria-label="Next slide"
        onClick={() => goToSlide(1)}
      >
        <ChevronRight size={38} strokeWidth={1.4} />
      </button>

      <div className="slide-dots" aria-label="Slide controls">
        {slides.map((slide, index) => (
          <button
            type="button"
            key={slide.image}
            className={activeIndex === index ? "is-active" : ""}
            aria-label={`Show slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState(getCurrentPage);

  useEffect(() => {
    const syncPage = () => setCurrentPage(getCurrentPage());
    window.addEventListener("hashchange", syncPage);
    syncPage();

    return () => window.removeEventListener("hashchange", syncPage);
  }, []);

  return (
    <>
      <Header currentPage={currentPage} />
      {currentPage === "tradition" ? <InspiringTradition /> : <Hero />}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
