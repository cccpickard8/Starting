import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MessagesClient from './MessagesClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Messages - BookSwap',
}

export default async function MessagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/messages')
  }

  // Get all messages for this user (both sent and received)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: messages } = await (supabase.from('messages') as any)
    .select(`
      *,
      from_user:profiles!messages_from_user_id_fkey(*),
      to_user:profiles!messages_to_user_id_fkey(*),
      book:books(id, title, cover_url)
    `)
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
      <p className="mt-2 text-gray-600">Your conversations with other book traders</p>
      <MessagesClient messages={messages || []} currentUserId={user.id} />
    </div>
  )
}
