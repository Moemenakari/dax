'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setQuery('')
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSearch} className="flex items-center">
          <SearchIcon className="h-5 w-5 text-gray-400 ml-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="flex-1 px-4 py-5 text-lg focus:outline-none"
          />
          <button type="button" onClick={onClose} className="pr-5 text-gray-400 hover:text-gray-600">
              <CloseIcon className="h-5 w-5" />
          </button>
        </form>
        <div className="border-t px-5 py-3 text-xs text-gray-400 flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">ESC</kbd>
          <span>to close</span>
          <span className="ml-auto">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">↵</kbd> to search
          </span>
        </div>
      </div>
    </div>
  )
}
