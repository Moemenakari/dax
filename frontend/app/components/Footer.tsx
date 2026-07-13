import Link from 'next/link'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PhoneIcon from '@mui/icons-material/Phone'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import DirectionsIcon from '@mui/icons-material/Directions'
import CodeIcon from '@mui/icons-material/Code'

export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] text-white mt-0">

      {/* ── Map Section ── */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 pt-14 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-white">Find Us</h3>
              <p className="text-gray-400 text-sm">Tripoli Al-Zahriyeh, Lebanon</p>
            </div>
            <a
              href="https://maps.app.goo.gl/EehauCc1ZnpBuKTa7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#e63946] hover:bg-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <DirectionsIcon fontSize="small" />
              Get Directions
            </a>
          </div>
          <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-gray-800">
            <iframe
              src="https://maps.google.com/maps?q=Tripoli+Al-Zahriyeh+Lebanon&output=embed&z=15&hl=en"
              width="100%"
              height="100%"
              className="border-0 [filter:grayscale(30%)_contrast(1.1)]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="DAX Store Location"
            />
          </div>
        </div>
      </div>

      {/* ── Main Footer ── */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-1">
          <h3 className="text-3xl font-black mb-4">
            DA<span className="text-[#e63946]">X</span>
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Premium men&apos;s clothing store based in Tripoli, Lebanon.
            Style meets quality at honest prices.
          </p>
          <div className="flex gap-3">
            <SocialLink href="https://www.instagram.com/daxmenswear?igsh=MXdxdzE5bmZ4bTR1aA==" icon="instagram" />
            <SocialLink href="https://facebook.com" icon="facebook" />
            <SocialLink href="https://tiktok.com" icon="tiktok" />
            <SocialLink href="https://wa.me/96170474190" icon="whatsapp" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">Shop</h4>
          <div className="flex flex-col gap-2.5 text-gray-400 text-sm">
            <Link href="/shop" className="hover:text-white transition-colors">All Products</Link>
            <Link href="/shop?sale=true" className="hover:text-white transition-colors">Sale</Link>
            <Link href="/shop?category=jeans" className="hover:text-white transition-colors">Jeans</Link>
            <Link href="/shop?category=t-shirts" className="hover:text-white transition-colors">T-Shirts</Link>
            <Link href="/shop?category=hoodies" className="hover:text-white transition-colors">Hoodies</Link>
            <Link href="/shop?category=jackets" className="hover:text-white transition-colors">Jackets</Link>
          </div>
        </div>

        {/* Account */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">Account</h4>
          <div className="flex flex-col gap-2.5 text-gray-400 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Login / Sign Up</Link>
            <Link href="/orders" className="hover:text-white transition-colors">My Orders</Link>
            <Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link>
            <Link href="/cart" className="hover:text-white transition-colors">Shopping Cart</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">Contact</h4>
          <div className="flex flex-col gap-3 text-gray-400 text-sm">
            <a
              href="https://maps.app.goo.gl/EehauCc1ZnpBuKTa7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 hover:text-white transition-colors"
            >
              <span className="text-gray-500 mt-px"><LocationOnIcon fontSize="inherit"/></span>
              <span>Tripoli Al-Zahriyeh, Lebanon</span>
            </a>
            <p className="flex items-start gap-2">
              <span className="text-gray-500"><PhoneIcon fontSize="inherit"/></span>
              <span>+961 70 474 190</span>
            </p>
            <a
              href="https://wa.me/96170474190"
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              <span><WhatsAppIcon fontSize="inherit"/></span>
              <span>WhatsApp Order</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} DAX. All rights reserved.</span>
          <span>Premium Men&apos;s Fashion — Made in Lebanon 🇱🇧</span>
          <a
            href="tel:70420110"
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-400 transition-colors font-medium"
          >
            <CodeIcon sx={{ fontSize: 13 }} />
            Powered by Moemen Akari · 70420110
          </a>
        </div>
      </div>

    </footer>
  )
}

function SocialLink({ href, icon }: { href: string; icon: string }) {
  const icons: Record<string, string> = {
    instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="w-9 h-9 bg-gray-800 hover:bg-[#e63946] rounded-full flex items-center justify-center transition-colors"
       aria-label={`Follow us on ${icon.charAt(0).toUpperCase() + icon.slice(1)}`}
    >
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d={icons[icon]} />
      </svg>
    </a>
  )
}
