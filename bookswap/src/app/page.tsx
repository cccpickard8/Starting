import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BookCard from '@/components/BookCard'
import type { Book, Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

type BookWithProfile = Book & { profiles: Profile }

export default async function Home() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('books') as any)
    .select('*, profiles(*)')
    .eq('available', true)
    .order('created_at', { ascending: false })
    .limit(8)

  const recentBooks = data as BookWithProfile[] | null

  return (
    <main className="min-h-screen">
      {/* Hero Section - Lime Green Full Screen */}
      <section className="min-h-[90vh] bg-lime-400 relative flex flex-col justify-end pb-16 px-6">
        {/* Logo */}
        <div className="absolute top-8 left-6">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 bg-green-800 rounded-lg"></div>
            <div className="w-4 h-4 bg-green-800 rounded-md -ml-2 -mt-4"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-lg">
          <h1 className="text-5xl md:text-6xl font-bold text-green-900 leading-tight">
            Trade Your
            <br />
            Books
            <br />
            Effortlessly
          </h1>
          <p className="mt-6 text-green-800 text-lg leading-relaxed">
            Connect with fellow readers, share your favorite books, and discover your next great read. Join our community of book lovers today.
          </p>

          <div className="mt-10 space-y-4">
            <Link
              href="/signup"
              className="block w-full text-center bg-green-800 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-900 transition-colors"
            >
              Get Started
            </Link>
            <p className="text-center text-green-800">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center">How It Works</h2>
          <p className="mt-2 text-gray-600 text-center">Simple steps to start swapping</p>

          <div className="mt-16 grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">List Your Books</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Add books you&apos;re ready to trade. Search by title to auto-fill details and cover images.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Discover Books</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Browse available books from other readers. Filter by condition and find hidden gems.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Connect & Trade</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Message book owners directly to arrange swaps. Build connections with fellow readers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Books */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Recently Listed</h2>
              <p className="mt-1 text-gray-600">Fresh additions from our community</p>
            </div>
            <Link
              href="/search"
              className="hidden sm:flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
            >
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentBooks && recentBooks.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="mt-10 text-center py-16 bg-white rounded-3xl border border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="mt-6 text-gray-600 text-lg">No books listed yet. Be the first to add one!</p>
              <Link
                href="/signup"
                className="mt-6 inline-block bg-green-800 text-white px-8 py-3 rounded-full font-medium hover:bg-green-900 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
            >
              View all books
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-green-700 rounded-md"></div>
                <div className="w-3 h-3 bg-green-700 rounded-sm -ml-1.5 -mt-3"></div>
              </div>
              <span className="font-bold text-gray-900 text-lg">BookSwap</span>
            </div>
            <p className="text-gray-500">
              Connecting readers, one book at a time.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
