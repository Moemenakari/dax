'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductCard from './components/ProductCard'
import api from './lib/api'
import NextImage from 'next/image'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import InventoryIcon from '@mui/icons-material/Inventory'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'

const CATEGORIES = [
  { name: 'Jeans', icon: <CheckroomIcon fontSize="inherit" />, slug: 'Jeans' },
  { name: 'T-Shirts', icon: <CheckroomIcon fontSize="inherit" />, slug: 'T-Shirts' },
  { name: 'Shirts', icon: <CheckroomIcon fontSize="inherit" />, slug: 'Shirts' },
  { name: 'Sport Sets', icon: <CheckroomIcon fontSize="inherit" />, slug: 'Sport Sets' },
  { name: 'Pants', icon: <CheckroomIcon fontSize="inherit" />, slug: 'Pants' },
]

interface Product {
  id: number
  title: string
  price: number
  salePrice: number | null
  category: string
  image: string
}

interface Review {
  id: number
  customerName: string
  rating: number
  comment: string
}

interface FAQItem {
  id: number
  question: string
  answer: string
}

interface DeliveryArea {
  id: number
  areaName: string
  price: number
  estimatedTime: string
}

interface HomepageContent {
  hero_title: string
  hero_subtitle: string
  hero_image: string
  about_title: string
  about_text: string
  about_image: string
  banner_title: string
  banner_subtitle: string
  banner_image: string
  sale_percentage: number
  nav_announcement: string
}

const defaultContent: HomepageContent = {
  hero_title: 'Explore the New Mens Collection',
  hero_subtitle: 'Premium quality. Modern style. Made for men.',
  hero_image: '',
  about_title: 'Our Story',
  about_text: 'DAX was born in Tripoli with one mission — to bring premium men\'s fashion to Lebanon at honest prices. We curate every piece with care, so you always look and feel your best. From streetwear essentials to smart casual, we\'ve got your style covered.',
  about_image: '',
  banner_title: 'UP TO 70% OFF',
  banner_subtitle: 'Limited Time Offer',
  banner_image: '',
  sale_percentage: 70,
  nav_announcement: 'Free delivery on orders over $50'
}

export default function HomePage() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [faq, setFaq] = useState<FAQItem[]>([])
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [content, setContent] = useState<HomepageContent>(defaultContent)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [saleRes, reviewRes, faqRes, deliveryRes, homepageRes] = await Promise.allSettled([
          api.get('/products', { params: { sale: true, limit: 8 } }),
          api.get('/reviews'),
          api.get('/faq'),
          api.get('/delivery/areas'),
          api.get('/homepage'),
        ])
        if (saleRes.status === 'fulfilled') setSaleProducts(saleRes.value.data)
        if (reviewRes.status === 'fulfilled') setReviews(reviewRes.value.data)
        if (faqRes.status === 'fulfilled') setFaq(faqRes.value.data)
        if (deliveryRes.status === 'fulfilled') setDeliveryAreas(deliveryRes.value.data)
        if (homepageRes.status === 'fulfilled' && homepageRes.value.data) {
          setContent({ ...defaultContent, ...homepageRes.value.data })
        }
      } catch {}
    }
    fetchData()
  }, [])

  // Parse hero title for styled rendering
  const heroTitleParts = content.hero_title.split(/(\bMen'?s?\b)/i)

  return (
    <div>

      {/* ═══════ 1. HERO SECTION ═══════ */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center bg-[#0f0f0f] overflow-hidden" id="hero-section">
        {/* Background Image */}
        <div className="absolute inset-0">
          <NextImage 
            src={content.hero_image || '/hero.png'} 
            alt="DAX Men's Collection" 
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="max-w-xl">
            <span className="inline-block text-[#e63946] text-sm font-bold tracking-[0.2em] uppercase mb-4 fade-in-up">
              New Collection 2026
            </span>
            <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-black text-white leading-[1.1] mb-6 fade-in-up">
              {heroTitleParts.map((part, i) => 
                /men'?s?/i.test(part) 
                  ? <span key={i} className="text-[#e63946]">{part}</span>
                  : <span key={i}>{part}</span>
              )}
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl mb-8 leading-relaxed fade-in-up max-w-md">
              {content.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 fade-in-up">
              <Link
                href="/shop"
                className="bg-[#e63946] text-white px-8 sm:px-10 py-4 text-base font-bold rounded-full hover:bg-[#c1121f] transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
              >
                Explore Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/shop?sale=true"
                className="border-2 border-white/30 text-white px-8 py-4 text-base font-bold rounded-full hover:bg-white hover:text-black transition-all duration-300 text-center"
              >
                View Sale
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-white/40 hidden md:flex">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Info Strip */}
      <section className="bg-[#e63946] text-white py-3.5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 md:gap-12 text-xs sm:text-sm font-bold tracking-wide">
          <span className="flex items-center gap-2">✦ Fast Delivery</span>
          <span className="flex items-center gap-2">✦ All Lebanon</span>
          <span className="flex items-center gap-2">✦ Premium Quality</span>
          <span className="hidden sm:flex items-center gap-2">✦ Suitable Prices</span>
        </div>
      </section>


      {/* ═══════ 2. ABOUT US / OUR STORY ═══════ */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24" id="about-section">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[#e63946] text-xs font-bold tracking-[0.2em] uppercase mb-3 inline-block">About Us</span>
          <h2 className="text-3xl md:text-4xl font-black mb-6">{content.about_title || defaultContent.about_title}</h2>
          <p className="text-gray-500 leading-relaxed text-base md:text-lg mb-8">
            {content.about_text || defaultContent.about_text}
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-3xl font-black text-[#e63946]">2000+</p>
              <p className="text-sm text-gray-400 mt-1">Products</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#e63946]">5K+</p>
              <p className="text-sm text-gray-400 mt-1">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#e63946]">24h</p>
              <p className="text-sm text-gray-400 mt-1">Fast Delivery</p>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════ 3. SALES SECTION ═══════ */}
      <section className="bg-gray-50 py-12 md:py-20" id="sales-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-[#e63946] text-xs font-bold tracking-[0.2em] uppercase mb-2 inline-flex items-center gap-1.5"><LocalOfferIcon fontSize="small" /> Hot Deals</span>
              <h2 className="text-3xl md:text-4xl font-black">On Sale Now</h2>
            </div>
            <Link 
              href="/shop?sale=true" 
              className="text-sm font-bold text-[#e63946] hover:underline flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {saleProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {saleProducts.slice(0, 8).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl text-gray-300 mb-3"><LocalOfferIcon fontSize="inherit" /></p>
              <p className="font-medium">Sale products coming soon!</p>
            </div>
          )}
        </div>
      </section>


      {/* ═══════ 4. SHOP BY CATEGORY ═══════ */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20" id="category-section">
        <div className="text-center mb-12">
          <span className="text-[#e63946] text-xs font-bold tracking-[0.2em] uppercase mb-2 inline-block">Collections</span>
          <h2 className="text-3xl md:text-4xl font-black">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group bg-gray-50 hover:bg-[#0f0f0f] rounded-2xl p-6 text-center transition-all duration-300 border border-gray-100 hover:border-transparent"
            >
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-sm font-bold text-gray-700 group-hover:text-white transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>


      {/* ═══════ 5. SECOND BANNER ═══════ */}
      <section className="relative overflow-hidden mx-4 md:mx-auto max-w-7xl rounded-3xl my-6" id="banner-section">
        <div className="relative min-h-75 md:min-h-100 flex items-center overflow-hidden">
          <NextImage 
            src={content.banner_image || '/banner.png'} 
            alt="DAX Store" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 to-black/30" />
          <div className="relative px-6 sm:px-8 md:px-16 py-10 md:py-12 max-w-lg">
            <span className="text-[#e63946] text-xs font-bold tracking-[0.2em] uppercase mb-3 inline-block">Limited Time</span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              {content.banner_title && content.banner_title.includes('%') ? (
                <>
                  {content.banner_title.split(/(\d+%)/)[0]}<br />
                  <span className="text-[#e63946]">{content.banner_title.match(/\d+%\s*\w*/)?.[0] || `${content.sale_percentage}% OFF`}</span>
                </>
              ) : (
                <>{content.banner_title || `UP TO 70% OFF`}<br /></>
              )}
            </h2>
            <p className="text-gray-300 mb-6">{content.banner_subtitle || "Limited Time Offer"}</p>
            <Link
              href="/shop?sale=true"
              className="bg-[#e63946] text-white px-8 py-3.5 text-sm font-bold rounded-full hover:bg-[#c1121f] transition-colors inline-flex items-center gap-2"
            >
              Shop Sale
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>


      {/* ═══════ 6. REVIEWS ═══════ */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20" id="reviews-section">
        <div className="text-center mb-12">
          <span className="text-[#e63946] text-xs font-bold tracking-[0.2em] uppercase mb-2 inline-block">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-black">What Our Customers Say</h2>
        </div>
        
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-lg transition-shadow">
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                <p className="font-bold text-sm">{review.customerName}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: 'Ahmad K.', rating: 5, comment: 'Amazing quality! The jeans fit perfectly and the delivery was super fast to Tripoli.' },
              { name: 'Hassan M.', rating: 5, comment: 'Best men\'s clothing store in Lebanon. Great prices and excellent customer service.' },
              { name: 'Omar R.', rating: 4, comment: 'Love the hoodie I ordered. Very comfortable and stylish. Will definitely order again!' },
              { name: 'Ali S.', rating: 5, comment: 'DAX never disappoints. Every piece I buy is top quality. Highly recommended!' },
            ].map((review, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className={`w-4 h-4 ${j < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                <p className="font-bold text-sm">{review.name}</p>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* ═══════ 7. FAQ ═══════ */}
      <section className="bg-gray-50 py-12 md:py-20" id="faq-section">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#e63946] text-xs font-bold tracking-[0.2em] uppercase mb-2 inline-block">Help</span>
            <h2 className="text-3xl md:text-4xl font-black">Frequently Asked Questions</h2>
          </div>
          <div className="flex flex-col gap-3">
            {(faq.length > 0 ? faq : [
              { id: 1, question: 'How long does delivery take?', answer: 'Delivery within Tripoli takes 24 hours. Beirut and North Lebanon take 1-2 days. All of Lebanon is covered within 3-5 days.' },
              { id: 2, question: 'What payment methods do you accept?', answer: 'We accept Cash on Delivery, Wish app payment, and you can also contact us directly to arrange payment.' },
              { id: 3, question: 'Can I return or exchange an item?', answer: 'Yes, you can return or exchange items within 3 days of delivery, as long as the item is in its original condition with tags attached.' },
              { id: 4, question: 'How do I track my order?', answer: 'After placing your order, you can track its status in the "My Orders" section of your account.' },
              { id: 5, question: 'Do you have a physical store?', answer: 'Yes! Visit us at our store in Tripoli Al-Zahriyeh, Lebanon.' },
            ]).map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                  className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  <span>{item.question}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 shrink-0 ${openFaq === item.id ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === item.id ? 'max-h-40 pb-4' : 'max-h-0'}`}>
                  <p className="px-4 sm:px-6 text-gray-500 text-sm leading-relaxed">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════ 8. DELIVERY SECTION ═══════ */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20" id="delivery-section">
        <div className="text-center mb-12">
          <span className="text-[#e63946] text-xs font-bold tracking-[0.2em] uppercase mb-2 inline-block">Shipping</span>
          <h2 className="text-3xl md:text-4xl font-black">Delivery All Over Lebanon</h2>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">We deliver to your doorstep. Fast, reliable, and affordable.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {(deliveryAreas.length > 0 ? deliveryAreas : [
            { id: 1, areaName: 'Tripoli', price: 2, estimatedTime: '24 hours' },
            { id: 2, areaName: 'Beirut', price: 3, estimatedTime: '1–2 days' },
            { id: 3, areaName: 'North Lebanon', price: 3, estimatedTime: '1–2 days' },
            { id: 4, areaName: 'Mount Lebanon', price: 3.5, estimatedTime: '2–3 days' },
            { id: 5, areaName: 'South Lebanon', price: 4, estimatedTime: '3–5 days' },
          ]).map(area => (
            <div key={area.id} className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 text-center hover:shadow-lg hover:border-[#e63946]/20 transition-all">
              <span className="text-2xl text-gray-500 mb-2 block"><InventoryIcon fontSize="inherit" /></span>
              <h3 className="font-bold text-sm mb-1">{area.areaName}</h3>
              <p className="text-[#e63946] font-black text-lg">${area.price}</p>
              <p className="text-gray-400 text-xs mt-1">{area.estimatedTime}</p>
            </div>
          ))}
        </div>
        
        {/* Order CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/96170474719"
              className="bg-green-500 text-white px-8 py-3.5 text-sm font-bold rounded-full hover:bg-green-600 transition-colors inline-flex items-center gap-2 shadow-lg shadow-green-500/20 w-full sm:w-auto justify-center"
            >
              <WhatsAppIcon fontSize="small" /> WhatsApp Order
            </a>
            <Link
              href="/shop"
              className="bg-[#0f0f0f] text-white px-8 py-3.5 text-sm font-bold rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Shop Online
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ FLOATING SHOP BUTTON ═══════ */}
      <Link
        href="/shop"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 bg-[#e63946] text-white pl-4 pr-5 py-3.5 rounded-full shadow-[0_8px_32px_rgba(230,57,70,0.5)] hover:bg-[#0f0f0f] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#e63946] animate-ping opacity-20 pointer-events-none" />

        <span className="relative flex items-center gap-1 text-lg">
          <CheckroomIcon fontSize="inherit" />
          <ShoppingBagIcon fontSize="inherit" />
        </span>
        <span className="relative text-sm font-black tracking-wide">Shop Now</span>
      </Link>

    </div>
  )
}
