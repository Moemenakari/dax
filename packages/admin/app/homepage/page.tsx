'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'


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

export default function HomepagePage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [faq, setFaq] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reviews')

  // Form states
  const [reviewForm, setReviewForm] = useState({ customerName: '', rating: 5, comment: '' })
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' })

  const fetchData = useCallback(async () => {
    try {
      const [rRes, fRes] = await Promise.allSettled([
        api.get('/reviews/all'),
        api.get('/faq/all'),
      ])
      if (rRes.status === 'fulfilled') setReviews(rRes.value.data)
      if (fRes.status === 'fulfilled') setFaq(fRes.value.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { 
    fetchData()
  }, [fetchData])

  // Reviews CRUD
  const addReview = async () => {
    try {
      await api.post('/reviews', reviewForm)
      setReviewForm({ customerName: '', rating: 5, comment: '' })
      fetchData()
    } catch {}
  }

  const deleteReview = async (id: number) => {
    try {
      await api.delete(`/reviews/${id}`)
      fetchData()
    } catch {}
  }

  // FAQ CRUD
  const addFaq = async () => {
    try {
      await api.post('/faq', faqForm)
      setFaqForm({ question: '', answer: '' })
      fetchData()
    } catch {}
  }

  const deleteFaq = async (id: number) => {
    try {
      await api.delete(`/faq/${id}`)
      fetchData()
    } catch {}
  }

  const tabs = [
    { key: 'reviews', label: '⭐ Reviews' },
    { key: 'faq', label: '❓ FAQ' },
  ]

  if (loading) return <div className="animate-pulse text-sm text-slate-400">Loading homepage content...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black">Homepage Control</h1>
        <p className="text-sm text-slate-400 mt-1">Edit all sections of your homepage</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key ? 'bg-[#0f172a] text-white' : 'bg-white border border-slate-100 hover:border-slate-300'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Reviews ═══ */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-black text-lg mb-6">⭐ Customer Reviews</h2>

          {/* Add Review Form */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
            <p className="font-bold text-sm">Add Review</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Customer Name" value={reviewForm.customerName} onChange={e => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                className="border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900" />
              <select title="Review Rating" value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                className="border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900">
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
              </select>
            </div>
            <textarea placeholder="Comment" value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
              rows={2} className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 resize-none" />
            <button onClick={addReview} className="bg-[#0f172a] text-white px-5 py-2.5 rounded-xl text-sm font-bold">Add Review</button>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="flex items-start justify-between p-3 border border-slate-100 rounded-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{r.customerName}</span>
                    <span className="text-yellow-400 text-xs">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-xs text-slate-500">{r.comment}</p>
                </div>
                <button onClick={() => deleteReview(r.id)} className="text-xs text-red-500 hover:underline flex-shrink-0 ml-3">Delete</button>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No reviews yet</p>}
          </div>
        </div>
      )}

      {/* ═══ FAQ ═══ */}
      {activeTab === 'faq' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-black text-lg mb-6">❓ FAQ</h2>

          {/* Add FAQ Form */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
            <p className="font-bold text-sm">Add FAQ</p>
            <input placeholder="Question" value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
              className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900" />
            <textarea placeholder="Answer" value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
              rows={2} className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 resize-none" />
            <button onClick={addFaq} className="bg-[#0f172a] text-white px-5 py-2.5 rounded-xl text-sm font-bold">Add FAQ</button>
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {faq.map(f => (
              <div key={f.id} className="flex items-start justify-between p-3 border border-slate-100 rounded-xl">
                <div>
                  <p className="font-bold text-sm">{f.question}</p>
                  <p className="text-xs text-slate-500 mt-1">{f.answer}</p>
                </div>
                <button onClick={() => deleteFaq(f.id)} className="text-xs text-red-500 hover:underline flex-shrink-0 ml-3">Delete</button>
              </div>
            ))}
            {faq.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No FAQ items yet</p>}
          </div>
        </div>
      )}
    </div>
  )
}
