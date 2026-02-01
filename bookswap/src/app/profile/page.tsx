import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'
import BookCard from '@/components/BookCard'
import Link from 'next/link'
import type { Profile, Book } from '@/types/database'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Your Profile - BookSwap',
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = await (supabase.from('profiles') as any)
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booksData } = await (supabase.from('books') as any)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const books = booksData as Book[] | null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900">Your Profile</h2>
            <ProfileForm profile={profile} />
          </div>
        </div>

        {/* Books Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Books</h2>
            <Link
              href="/books/add"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Add Book
            </Link>
          </div>

          {books && books.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} showOwner={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="mt-4 text-gray-600">You haven&apos;t listed any books yet.</p>
              <Link
                href="/books/add"
                className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Add your first book
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
