import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules'
import { Sparkles, ArrowRight } from 'lucide-react'
import { getApiOrigin } from '@/shared/config/api'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

// Fallback when no banners are configured in the database
const FALLBACK = {
  title: 'Own a home that tells a story.',
  subtitle:
    'Discover and acquire extraordinary alternative dwellings worldwide. Vetted micro-dwellings, clay earthships, timber cabins, and custom container sanctuaries built by master craftsmen.',
  image_url:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80',
}

function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const origin = getApiOrigin()
  return origin ? `${origin}${url}` : url
}

export default function HeroSwiper({ banners = [], onWaitlist }) {
  const slides = banners.length > 0 ? banners : [FALLBACK]
  const single = slides.length === 1

  return (
    <section className="relative w-full min-h-[540px]">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        loop={!single}
        autoplay={!single && { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        speed={800}
        navigation={!single}
        pagination={!single && { clickable: true }}
        className="w-full min-h-[540px] hero-swiper"
      >
        {slides.map((banner, idx) => (
          <SwiperSlide key={banner.id ?? idx}>
            <div className="relative min-h-[540px] flex items-center w-full bg-black">
              {/* Background image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={resolveImageUrl(banner.image_url)}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/55" />
              </div>

              {/* Slide content */}
              <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24 flex flex-col gap-6 items-center justify-center text-center text-white">
                <div className="inline-flex items-center gap-2 bg-brand-terracotta/25 border border-brand-terracotta/40 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-brand-terracotta-light uppercase max-w-max">
                  <Sparkles className="h-3.5 w-3.5" /> RareNest Marketplace
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight max-w-3xl">
                  {banner.title}
                </h1>

                {banner.subtitle && (
                  <p className="text-brand-warm-white/85 font-sans font-light text-base sm:text-lg max-w-2xl leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <a
                    href="#dwellings"
                    className="bg-brand-terracotta hover:bg-brand-terracotta-light text-white px-7 py-4 rounded-xl font-bold shadow-lg shadow-brand-terracotta/20 transition-all duration-300 text-center flex items-center justify-center gap-2 group border-none"
                  >
                    Explore Dwellings
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                  <button
                    onClick={onWaitlist}
                    className="bg-white/15 hover:bg-white/25 text-white border border-white/30 px-7 py-4 rounded-xl font-bold backdrop-blur-sm transition-all duration-300"
                  >
                    Join Waitlist
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: white;
          background: rgba(0,0,0,0.28);
          width: 22px;
          height: 22px;
          border-radius: 50%;
          backdrop-filter: blur(4px);
        }
        .hero-swiper .swiper-button-next::after,
        .hero-swiper .swiper-button-prev::after {
          font-size: 7px;
          font-weight: 900;
        }
        .hero-swiper .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          background: white;
          opacity: 0.45;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #c1826b;
          transform: scale(1.25);
        }
      `}</style>
    </section>
  )
}
