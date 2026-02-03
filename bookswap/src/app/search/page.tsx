'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookCard from '@/components/BookCard'
import type { Book, Profile } from '@/types/database'

type BookWithProfile = Book & { profiles: Profile }

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState<BookWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [condition, setCondition] = useState<string>('')
  const [activeQuery, setActiveQuery] = useState('')
  const supabase = useMemo(() => createClient(), [])

  const fetchBooks = useCallback(async (searchQuery?: string) => {
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let queryBuilder = (supabase.from('books') as any)
      .select('*, profiles(*)')
      .eq('available', true)
      .order('created_at', { ascending: false })

    if (condition) {
      queryBuilder = queryBuilder.eq('condition', condition)
    }

    if (searchQuery) {
      queryBuilder = queryBuilder.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
    }

    const { data } = await queryBuilder.limit(50)
    setBooks((data as BookWithProfile[]) || [])
    setLoading(false)
  }, [supabase, condition])

  useEffect(() => {
    fetchBooks(activeQuery)
  }, [fetchBooks, activeQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveQuery(query)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Books</h1>
          <p className="mt-2 text-gray-600">Find your next great read from fellow book lovers</p>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title or author..."
                  className="w-full px-5 py-3.5 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-colors"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-green-700 text-white font-medium rounded-xl hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Search
              </button>
            </form>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer min-w-[160px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 12px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '20px',
              }}
            >
              <option value="">All Conditions</option>
              <option value="like_new">Like New</option>
              <option value="very_good">Very Good</option>
              <option value="good">Good</option>
              <option value="acceptable">Acceptable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-500">Loading books...</p>
            </div>
          </div>
        ) : books.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-6">{books.length} books found</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="mt-6 text-gray-600 text-lg">No books found matching your search.</p>
            <button
              onClick={() => {
                setQuery('')
                setCondition('')
                setActiveQuery('')
              }}
              className="mt-6 px-6 py-3 bg-green-700 text-white rounded-full font-medium hover:bg-green-800 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
