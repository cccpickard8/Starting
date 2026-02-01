export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          user_id: string
          google_books_id: string | null
          title: string
          author: string
          isbn: string | null
          cover_url: string | null
          description: string | null
          condition: 'like_new' | 'very_good' | 'good' | 'acceptable'
          notes: string | null
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          google_books_id?: string | null
          title: string
          author: string
          isbn?: string | null
          cover_url?: string | null
          description?: string | null
          condition: 'like_new' | 'very_good' | 'good' | 'acceptable'
          notes?: string | null
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          google_books_id?: string | null
          title?: string
          author?: string
          isbn?: string | null
          cover_url?: string | null
          description?: string | null
          condition?: 'like_new' | 'very_good' | 'good' | 'acceptable'
          notes?: string | null
          available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          book_id: string | null
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          book_id?: string | null
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          book_id?: string | null
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          google_books_id: string | null
          title: string
          author: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          google_books_id?: string | null
          title: string
          author: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          google_books_id?: string | null
          title?: string
          author?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      book_condition: 'like_new' | 'very_good' | 'good' | 'acceptable'
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Book = Database['public']['Tables']['books']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Wishlist = Database['public']['Tables']['wishlists']['Row']

export type BookCondition = Database['public']['Enums']['book_condition']

// Extended types with relations
export type BookWithOwner = Book & {
  profiles: Profile
}

export type MessageWithUsers = Message & {
  from_user: Profile
  to_user: Profile
  book?: Book
}
