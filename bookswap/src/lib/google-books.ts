export interface GoogleBook {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    publishedDate?: string
    publisher?: string
    pageCount?: number
    categories?: string[]
  }
}

export interface GoogleBooksResponse {
  items?: GoogleBook[]
  totalItems: number
}

export async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
  const baseUrl = 'https://www.googleapis.com/books/v1/volumes'

  const params = new URLSearchParams({
    q: query,
    maxResults: '10',
    printType: 'books',
  })

  if (apiKey) {
    params.append('key', apiKey)
  }

  const response = await fetch(`${baseUrl}?${params}`)
  if (!response.ok) {
    throw new Error(`Google Books API error: ${response.status}`)
  }
  const data: GoogleBooksResponse = await response.json()
  return data.items || []
}

export function extractISBN(book: GoogleBook): string | null {
  const identifiers = book.volumeInfo.industryIdentifiers
  if (!identifiers) return null

  // Prefer ISBN-13
  const isbn13 = identifiers.find(id => id.type === 'ISBN_13')
  if (isbn13) return isbn13.identifier

  // Fall back to ISBN-10
  const isbn10 = identifiers.find(id => id.type === 'ISBN_10')
  if (isbn10) return isbn10.identifier

  return null
}

export function getCoverUrl(book: GoogleBook): string | null {
  const imageLinks = book.volumeInfo.imageLinks
  if (!imageLinks) return null

  // Get the thumbnail and upgrade to higher resolution
  const thumbnail = imageLinks.thumbnail || imageLinks.smallThumbnail
  if (!thumbnail) return null

  // Replace zoom parameter for better quality and use https
  return thumbnail
    .replace('http://', 'https://')
    .replace('zoom=1', 'zoom=2')
}
