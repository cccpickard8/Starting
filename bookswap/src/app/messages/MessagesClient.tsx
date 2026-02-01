'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Book } from '@/types/database'

interface Message {
  id: string
  from_user_id: string
  to_user_id: string
  content: string
  book_id: string | null
  read: boolean
  created_at: string
  from_user: Profile
  to_user: Profile
  book: Pick<Book, 'id' | 'title' | 'cover_url'> | null
}

interface Conversation {
  otherUser: Profile
  messages: Message[]
  lastMessage: Message
  unreadCount: number
}

interface MessagesClientProps {
  messages: Message[]
  currentUserId: string
}

export default function MessagesClient({ messages, currentUserId }: MessagesClientProps) {
  const supabase = createClient()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [sending, setSending] = useState(false)
  const [localMessages, setLocalMessages] = useState(messages)

  // Group messages by conversation (other user)
  const conversations: Conversation[] = Object.values(
    localMessages.reduce((acc: Record<string, Conversation>, msg) => {
      const otherUserId = msg.from_user_id === currentUserId ? msg.to_user_id : msg.from_user_id
      const otherUser = msg.from_user_id === currentUserId ? msg.to_user : msg.from_user

      if (!acc[otherUserId]) {
        acc[otherUserId] = {
          otherUser,
          messages: [],
          lastMessage: msg,
          unreadCount: 0,
        }
      }

      acc[otherUserId].messages.push(msg)
      if (!msg.read && msg.to_user_id === currentUserId) {
        acc[otherUserId].unreadCount++
      }

      return acc
    }, {})
  ).sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime())

  const markAsRead = async (conversation: Conversation) => {
    const unreadMessages = conversation.messages.filter(
      m => !m.read && m.to_user_id === currentUserId
    )

    if (unreadMessages.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('messages') as any)
        .update({ read: true })
        .in('id', unreadMessages.map(m => m.id))

      setLocalMessages(prev =>
        prev.map(m =>
          unreadMessages.some(um => um.id === m.id) ? { ...m, read: true } : m
        )
      )
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    markAsRead(conversation)
  }

  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedConversation) return

    setSending(true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('messages') as any)
      .insert({
        from_user_id: currentUserId,
        to_user_id: selectedConversation.otherUser.id,
        content: replyContent.trim(),
        book_id: selectedConversation.lastMessage.book_id,
      })
      .select(`
        *,
        from_user:profiles!messages_from_user_id_fkey(*),
        to_user:profiles!messages_to_user_id_fkey(*),
        book:books(id, title, cover_url)
      `)
      .single()

    if (!error && data) {
      setLocalMessages(prev => [data as Message, ...prev])
      setReplyContent('')

      // Update selected conversation
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [data as Message, ...prev.messages],
        lastMessage: data as Message,
      } : null)
    }

    setSending(false)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
        <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="mt-4 text-gray-600">No messages yet.</p>
        <Link href="/search" className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium">
          Browse books to start trading
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-8 grid md:grid-cols-3 gap-6">
      {/* Conversations List */}
      <div className="md:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.otherUser.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                selectedConversation?.otherUser.id === conversation.otherUser.id
                  ? 'bg-emerald-50'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 font-medium">
                    {(conversation.otherUser.username?.[0] || conversation.otherUser.email?.[0] || '?').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 truncate">
                      {conversation.otherUser.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessage.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {conversation.lastMessage.from_user_id === currentUserId && 'You: '}
                    {conversation.lastMessage.content}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-medium">
                  {(selectedConversation.otherUser.username?.[0] || selectedConversation.otherUser.email?.[0] || '?').toUpperCase()}
                </span>
              </div>
              <div>
                <Link
                  href={`/users/${selectedConversation.otherUser.id}`}
                  className="font-medium text-gray-900 hover:text-emerald-600"
                >
                  {selectedConversation.otherUser.username || 'Anonymous'}
                </Link>
                {selectedConversation.lastMessage.book && (
                  <p className="text-sm text-gray-500">
                    Re:{' '}
                    <Link
                      href={`/books/${selectedConversation.lastMessage.book.id}`}
                      className="text-emerald-600 hover:underline"
                    >
                      {selectedConversation.lastMessage.book.title}
                    </Link>
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto max-h-[400px] flex flex-col-reverse gap-4">
              {selectedConversation.messages.map((message) => {
                const isMe = message.from_user_id === currentUserId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        isMe
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-emerald-100' : 'text-gray-500'}`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendReply}
                  disabled={sending || !replyContent.trim()}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  )
}
