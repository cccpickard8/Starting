import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AddBookForm from './AddBookForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Add Book - BookSwap',
}

export default async function AddBookPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/books/add')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Add a Book</h1>
      <p className="mt-2 text-gray-600">
        Search for your book to auto-fill details, or enter them manually.
      </p>
      <AddBookForm />
    </div>
  )
}
