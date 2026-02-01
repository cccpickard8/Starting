import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookCard from '@/components/BookCard'
import type { Profile, Book } from '@/types/database'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('username')
    .eq('id', id)
    .single()

  if (!profile) {
    return { title: 'User Not Found - BookSwap' }
  }

  return {
    title: `${profile.username || 'User'}'s Profile - BookSwap`,
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = await (supabase.from('profiles') as any)
    .select('*')
    .eq('id', id)
    .single()

  const profile = profileData as Profile | null

  if (!profile) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booksData } = await (supabase.from('books') as any)
    .select('*')
    .eq('user_id', id)
    .eq('available', true)
    .order('created_at', { ascending: false })

  const books = booksData as Book[] | null

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === id

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-700 font-bold text-3xl md:text-4xl">
              {(profile.username?.[0] || profile.email?.[0] || '?').toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {profile.username || 'Anonymous User'}
            </h1>
            {profile.location && (
              <p className="mt-1 text-gray-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location}
              </p>
            )}
            {profile.bio && (
              <p className="mt-3 text-gray-600">{profile.bio}</p>
            )}
            <p className="mt-3 text-sm text-gray-500">
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          {isOwnProfile && (
            <a
              href="/profile"
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit Profile
            </a>
          )}
        </div>
      </div>

      {/* User's Books */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900">
          {isOwnProfile ? 'Your Available Books' : 'Available Books'}
        </h2>
        {books && books.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} showOwner={false} />
            ))}
          </div>
        ) : (
          <div className="mt-6 text-center py-12 bg-white rounded-xl border border-gray-200">
            <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="mt-4 text-gray-600">
              {isOwnProfile
                ? "You haven't listed any books yet."
                : 'This user has no available books.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
