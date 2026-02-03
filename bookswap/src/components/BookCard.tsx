import Link from 'next/link'
import type { Book, Profile } from '@/types/database'

interface BookCardProps {
  book: Book & { profiles?: Profile }
  showOwner?: boolean
}

const conditionLabels: Record<string, string> = {
  like_new: 'Like New',
  very_good: 'Very Good',
  good: 'Good',
  acceptable: 'Acceptable',
}

const conditionColors: Record<string, string> = {
  like_new: 'bg-green-100 text-green-700',
  very_good: 'bg-blue-100 text-blue-700',
  good: 'bg-amber-100 text-amber-700',
  acceptable: 'bg-gray-100 text-gray-600',
}

export default function BookCard({ book, showOwner = true }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="group">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300">
        <div className="aspect-[2/3] bg-gray-50 relative overflow-hidden">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lime-50 to-lime-100">
              <svg className="w-16 h-16 text-lime-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          {!book.available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium">
                Not Available
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-green-700 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{book.author}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${conditionColors[book.condition]}`}>
              {conditionLabels[book.condition]}
            </span>
          </div>
          {showOwner && book.profiles && (
            <p className="mt-3 text-xs text-gray-400">
              Listed by {book.profiles.username || 'Anonymous'}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
