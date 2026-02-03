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

interface OpenLibraryBook {
  key: string
  title: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number
  isbn?: string[]
}

interface OpenLibraryResponse {
  docs: OpenLibraryBook[]
  numFound: number
}

// Convert Open Library format to our GoogleBook format for compatibility
function convertToGoogleBookFormat(book: OpenLibraryBook): GoogleBook {
  const isbn = book.isbn?.[0]
  return {
    id: book.key,
    volumeInfo: {
      title: book.title,
      authors: book.author_name,
      publishedDate: book.first_publish_year?.toString(),
      imageLinks: book.cover_i ? {
        thumbnail: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
      } : undefined,
      industryIdentifiers: isbn ? [{ type: 'ISBN_13', identifier: isbn }] : undefined,
    }
  }
}

export async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  const baseUrl = 'https://openlibrary.org/search.json'

  const params = new URLSearchParams({
    q: query,
    limit: '10',
  })

  const response = await fetch(`${baseUrl}?${params}`)
  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status}`)
  }
  const data: OpenLibraryResponse = await response.json()
  return data.docs.map(convertToGoogleBookFormat)
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

  return imageLinks.thumbnail || imageLinks.smallThumbnail || null
}
