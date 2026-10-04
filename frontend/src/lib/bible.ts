import booksMetadata from '@/data/bible-meta.json';

export interface BibleBookMeta {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  bookNumber: number;
  chapterCount: number;
}

export interface BibleBookFull extends BibleBookMeta {
  chapters: string[][]; // chapters[chapterIndex][verseIndex]
}

export const ALL_BOOKS: BibleBookMeta[] = booksMetadata as BibleBookMeta[];

export const OT_BOOKS = ALL_BOOKS.filter((b) => b.testament === 'OT');
export const NT_BOOKS = ALL_BOOKS.filter((b) => b.testament === 'NT');

let cachedBible: BibleBookFull[] | null = null;
let bibleFetchPromise: Promise<BibleBookFull[]> | null = null;

export async function getFullBible(): Promise<BibleBookFull[]> {
  if (cachedBible) return cachedBible;
  if (bibleFetchPromise) return bibleFetchPromise;

  bibleFetchPromise = (async () => {
    try {
      const response = await fetch('/bible-kjv.json');
      if (!response.ok) {
        throw new Error(`Failed to load Bible dataset: ${response.statusText}`);
      }
      const data: BibleBookFull[] = await response.json();
      cachedBible = data;
      return data;
    } catch (error) {
      console.error('Error fetching Bible JSON:', error);
      throw error;
    } finally {
      bibleFetchPromise = null;
    }
  })();

  return bibleFetchPromise;
}

export async function getChapterVerses(
  bookId: string,
  chapterNumber: number
): Promise<{ book: BibleBookMeta; verses: string[] } | null> {
  const meta = ALL_BOOKS.find((b) => b.id.toLowerCase() === bookId.toLowerCase());
  if (!meta) return null;

  if (chapterNumber < 1 || chapterNumber > meta.chapterCount) {
    return null;
  }

  const bible = await getFullBible();
  const fullBook = bible.find((b) => b.id.toLowerCase() === bookId.toLowerCase());
  if (!fullBook || !fullBook.chapters[chapterNumber - 1]) {
    return null;
  }

  return {
    book: meta,
    verses: fullBook.chapters[chapterNumber - 1],
  };
}

export function getBookMeta(bookId: string): BibleBookMeta | undefined {
  return ALL_BOOKS.find((b) => b.id.toLowerCase() === bookId.toLowerCase());
}

export function getAdjacentChapter(
  bookId: string,
  chapterNumber: number,
  direction: 'next' | 'prev'
): { bookId: string; chapterNumber: number } | null {
  const currentIndex = ALL_BOOKS.findIndex((b) => b.id.toLowerCase() === bookId.toLowerCase());
  if (currentIndex === -1) return null;

  const currentBook = ALL_BOOKS[currentIndex];

  if (direction === 'next') {
    if (chapterNumber < currentBook.chapterCount) {
      return { bookId: currentBook.id, chapterNumber: chapterNumber + 1 };
    }
    // Next book if available
    if (currentIndex + 1 < ALL_BOOKS.length) {
      return { bookId: ALL_BOOKS[currentIndex + 1].id, chapterNumber: 1 };
    }
    return null;
  } else {
    if (chapterNumber > 1) {
      return { bookId: currentBook.id, chapterNumber: chapterNumber - 1 };
    }
    // Previous book last chapter
    if (currentIndex - 1 >= 0) {
      const prevBook = ALL_BOOKS[currentIndex - 1];
      return { bookId: prevBook.id, chapterNumber: prevBook.chapterCount };
    }
    return null;
  }
}
