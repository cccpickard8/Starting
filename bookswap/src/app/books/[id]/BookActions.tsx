'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface BookActionsProps {
  bookId: string
  available: boolean
}

export default function BookActions({ bookId, available }: BookActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isAvailable, setIsAvailable] = useState(available)
  const [updating, setUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const toggleAvailability = async () => {
    setUpdating(true)
    const newAvailability = !isAvailable
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('books') as any)
      .update({ available: newAvailability })
      .eq('id', bookId)

    if (!error) {
      setIsAvailable(newAvailability)
    }
    setUpdating(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('books') as any).delete().eq('id', bookId)

    if (!error) {
      router.push('/profile')
      router.refresh()
    } else {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={toggleAvailability}
        disabled={updating}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          isAvailable
            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {updating ? (
          'Updating...'
        ) : isAvailable ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Mark as Not Available
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark as Available
          </>
        )}
      </button>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full px-6 py-3 rounded-lg font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
      >
        Delete Book
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Delete this book?</h3>
            <p className="mt-2 text-gray-600">
              This action cannot be undone. The book will be permanently removed from your library.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
