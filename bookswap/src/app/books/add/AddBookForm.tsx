'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { searchGoogleBooks, extractISBN, getCoverUrl, type GoogleBook } from '@/lib/google-books'

type BookCondition = 'like_new' | 'very_good' | 'good' | 'acceptable'

interface BookFormData {
  title: string
  author: string
  isbn: string
  cover_url: string
  description: string
  google_books_id: string
  condition: BookCondition
  notes: string
}

const conditionOptions = [
  { value: 'like_new', label: 'Like New', description: 'Perfect condition, barely read' },
  { value: 'very_good', label: 'Very Good', description: 'Minor wear, no markings' },
  { value: 'good', label: 'Good', description: 'Some wear, may have minor markings' },
  { value: 'acceptable', label: 'Acceptable', description: 'Readable, visible wear' },
]

export default function AddBookForm() {
  const router = useRouter()
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    isbn: '',
    cover_url: '',
    description: '',
    google_books_id: '',
    condition: 'good',
    notes: '',
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    setSearchResults([])
    setSearchError(null)

    try {
      const results = await searchGoogleBooks(searchQuery)
      setSearchResults(results)
      if (results.length === 0) {
        setSearchError('No books found. Try a different search term.')
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to search Google Books')
    } finally {
      setSearching(false)
    }
  }

  const selectBook = (book: GoogleBook) => {
    setFormData({
      ...formData,
      title: book.volumeInfo.title || '',
      author: book.volumeInfo.authors?.join(', ') || '',
      isbn: extractISBN(book) || '',
      cover_url: getCoverUrl(book) || '',
      description: book.volumeInfo.description || '',
      google_books_id: book.id,
    })
    setSearchResults([])
    setSearchQuery('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to add a book')
      setSubmitting(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase.from('books') as any).insert({
      user_id: user.id,
      title: formData.title,
      author: formData.author,
      isbn: formData.isbn || null,
      cover_url: formData.cover_url || null,
      description: formData.description || null,
      google_books_id: formData.google_books_id || null,
      condition: formData.condition,
      notes: formData.notes || null,
      available: true,
    })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    router.push('/profile')
    router.refresh()
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Google Books Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Search Google Books</h2>
        <p className="mt-1 text-sm text-gray-600">
          Find your book to auto-fill title, author, cover, and ISBN.
        </p>
        <form onSubmit={handleSearch} className="mt-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Search Error */}
        {searchError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {searchError}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {searchResults.map((book) => (
              <button
                key={book.id}
                onClick={() => selectBook(book)}
                className="w-full flex items-start gap-4 p-4 hover:bg-gray-50 text-left transition-colors"
              >
                {getCoverUrl(book) ? (
                  <img
                    src={getCoverUrl(book)!}
                    alt={book.volumeInfo.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{book.volumeInfo.title}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                  </p>
                  {book.volumeInfo.publishedDate && (
                    <p className="text-xs text-gray-500 mt-1">{book.volumeInfo.publishedDate}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Book Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Book Details</h2>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {/* Cover Preview */}
          <div className="md:row-span-3">
            <label className="block text-sm font-medium text-gray-700">Cover Preview</label>
            <div className="mt-2 aspect-[2/3] max-w-48 bg-gray-100 rounded-lg overflow-hidden">
              {formData.cover_url ? (
                <img
                  src={formData.cover_url}
                  alt={formData.title || 'Book cover'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
              ISBN
            </label>
            <input
              type="text"
              id="isbn"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Condition */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Condition <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
            {conditionOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.condition === option.value
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value={option.value}
                  checked={formData.condition === option.value}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as BookCondition })}
                  className="sr-only"
                />
                <span className="font-medium text-gray-900">{option.label}</span>
                <span className="text-xs text-gray-500 mt-1">{option.description}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional details about this book's condition, edition, etc."
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !formData.title || !formData.author}
            className="flex-1 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Adding Book...' : 'Add Book'}
          </button>
        </div>
      </form>
    </div>
  )
}
