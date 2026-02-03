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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Browse Books</h1>
      <p className="mt-2 text-gray-600">Find your next great read from fellow book lovers</p>

      {/* Search and Filters */}
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
          >
            Search
          </button>
        </form>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
        >
          <option value="">All Conditions</option>
          <option value="like_new">Like New</option>
          <option value="very_good">Very Good</option>
          <option value="good">Good</option>
          <option value="acceptable">Acceptable</option>
        </select>
      </div>

      {/* Results */}
      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="mt-4 text-gray-600">No books found matching your search.</p>
            <button
              onClick={() => {
                setQuery('')
                setCondition('')
                setActiveQuery('')
              }}
              className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
