import { BibleApp } from "@/components/BibleApp";
import { getBookMeta } from "@/lib/bible";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{
    book: string;
    chapter: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const bookMeta = getBookMeta(resolvedParams.book);
  const bookName = bookMeta ? bookMeta.name : resolvedParams.book;
  const chapter = resolvedParams.chapter;

  return {
    title: `${bookName} Chapter ${chapter} - ScriptureNotes`,
    description: `Read King James Version ${bookName} Chapter ${chapter} and record your personal chapter study notes.`,
  };
}

export default async function BibleChapterPage({ params }: PageProps) {
  const resolvedParams = await params;
  const bookId = resolvedParams.book.toLowerCase();
  const chapterNumber = parseInt(resolvedParams.chapter, 10) || 1;

  return <BibleApp initialBookId={bookId} initialChapter={chapterNumber} />;
}
