'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setUser, logout } from '../store/authSlice'
import SearchModal from './SearchModal'
import api from '../lib/api'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dispatch = useDispatch()
  
  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  )
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Check auth on mount
  useEffect(() => {
    let active = true
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me')
        if (active) dispatch(setUser(res.data))
      } catch {
        if (active) dispatch(setUser(null))
      }
    }
    checkAuth()
    return () => { active = false }
  }, [dispatch])

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const [announcement, setAnnouncement] = useState("Free delivery on orders over $50 • Fast shipping all Lebanon")

  useEffect(() => {
    api.get('/homepage').then(res => {
      if (res.data?.nav_announcement) {
        setAnnouncement(res.data.nav_announcement)
      }
    }).catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    dispatch(logout())
    setMenuOpen(false)
  }

  return (
    <>
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
        {/* Top bar Announcement */}
        <div className="bg-[#0f0f0f] text-white text-xs font-medium tracking-wide overflow-hidden whitespace-nowrap py-1.5 flex items-center justify-center relative">
          <div className="animate-marquee sm:animate-none sm:flex sm:items-center sm:justify-center w-full sm:w-auto text-center">
            <span className="inline-block px-4">{announcement}</span>
            <span className="hidden sm:inline-block">🇱🇧</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 -ml-2 hover:bg-gray-50 rounded-xl transition-colors" 
            onClick={() => setMenuOpen(!menuOpen)}
            id="mobile-menu-toggle"
          >
            {menuOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </button>

          {/* Logo */}
          <Link href="/" className="text-2xl font-black tracking-tight select-none" id="brand-logo">
            DA<span className="text-[#e63946]">X</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-[#e63946] transition-colors">Home</Link>
            <Link href="/shop" className="hover:text-[#e63946] transition-colors">Shop</Link>
            <Link href="/shop?sale=true" className="text-[#e63946] font-bold hover:opacity-80 transition-opacity flex items-center gap-1">
              Sale <LocalOfferIcon sx={{ fontSize: 14 }} />
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Search */}
            <button 
              onClick={() => { setSearchOpen(true); setMenuOpen(false); }} 
              className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
              id="search-button"
              title="Open search"
            >
              <SearchIcon fontSize="small" />
            </button>

            {/* Account */}
            <Link 
              href={isAuthenticated ? "/account" : "/login"} 
              className="p-2 hover:bg-gray-50 rounded-xl transition-colors hidden md:flex"
              id="account-link"
            >
              <PersonOutlineIcon fontSize="small" />
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className="p-2 hover:bg-gray-50 rounded-xl transition-colors" id="wishlist-link">
              <FavoriteBorderIcon fontSize="small" />
            </Link>

            {/* Cart */}
            <Link 
              href="/cart" 
              onClick={() => setMenuOpen(false)}
              className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors" 
              id="cart-link"
            >
              <ShoppingBagOutlinedIcon fontSize="small" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#e63946] text-white text-[10px] min-w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold leading-none px-1">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white border-t px-6 py-4 flex flex-col gap-1">
            <MobileLink href="/" onClick={() => setMenuOpen(false)}>Home</MobileLink>
            <MobileLink href="/shop" onClick={() => setMenuOpen(false)}>Shop</MobileLink>
            <MobileLink href="/shop?sale=true" onClick={() => setMenuOpen(false)}>
              <span className="text-[#e63946] flex items-center gap-2">Sale <LocalOfferIcon sx={{ fontSize: 16 }} /></span>
            </MobileLink>
            <div className="border-t my-2" />
            {isAuthenticated ? (
              <>
                <MobileLink href="/account" onClick={() => setMenuOpen(false)}>
                  My Account ({user?.name})
                </MobileLink>
                <MobileLink href="/orders" onClick={() => setMenuOpen(false)}>My Orders</MobileLink>
                <MobileLink href="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</MobileLink>
                <button
                  onClick={handleLogout}
                  className="text-left py-3 px-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <MobileLink href="/login" onClick={() => setMenuOpen(false)}>Login / Sign Up</MobileLink>
            )}
          </div>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="py-3 px-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
    >
      {children}
    </Link>
  )
}
