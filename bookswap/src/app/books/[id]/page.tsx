import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MessageButton from './MessageButton'
import BookActions from './BookActions'
import type { Book, Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

type BookWithProfile = Book & { profiles: Profile | null }

const conditionLabels: Record<string, string> = {
  like_new: 'Like New',
  very_good: 'Very Good',
  good: 'Good',
  acceptable: 'Acceptable',
}

const conditionColors: Record<string, string> = {
  like_new: 'bg-emerald-100 text-emerald-800',
  very_good: 'bg-blue-100 text-blue-800',
  good: 'bg-yellow-100 text-yellow-800',
  acceptable: 'bg-gray-100 text-gray-800',
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: book } = await (supabase.from('books') as any)
    .select('title, author')
    .eq('id', id)
    .single()

  if (!book) {
    return { title: 'Book Not Found - BookSwap' }
  }

  return {
    title: `${book.title} by ${book.author} - BookSwap`,
  }
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('books') as any)
    .select('*, profiles(*)')
    .eq('id', id)
    .single()

  const book = data as BookWithProfile | null

  if (!book) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === book.user_id

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="md:col-span-1">
          <div className="aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden shadow-lg">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                <svg className="w-24 h-24 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
              <p className="mt-2 text-xl text-gray-600">{book.author}</p>
            </div>
            {!book.available && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Not Available
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${conditionColors[book.condition]}`}>
              {conditionLabels[book.condition]}
            </span>
            {book.isbn && (
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                ISBN: {book.isbn}
              </span>
            )}
          </div>

          {book.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600 leading-relaxed">{book.description}</p>
            </div>
          )}

          {book.notes && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Seller&apos;s Notes</h2>
              <p className="mt-2 text-gray-600">{book.notes}</p>
            </div>
          )}

          {/* Owner Info */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Listed by</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-semibold text-lg">
                  {(book.profiles?.username?.[0] || book.profiles?.email?.[0] || '?').toUpperCase()}
                </span>
              </div>
              <div>
                <Link
                  href={`/users/${book.user_id}`}
                  className="font-medium text-gray-900 hover:text-emerald-600"
                >
                  {book.profiles?.username || 'Anonymous'}
                </Link>
                {book.profiles?.location && (
                  <p className="text-sm text-gray-500">{book.profiles.location}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6">
              {isOwner ? (
                <BookActions bookId={book.id} available={book.available} />
              ) : (
                <MessageButton
                  bookId={book.id}
                  ownerId={book.user_id}
                  bookTitle={book.title}
                  isLoggedIn={!!user}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
