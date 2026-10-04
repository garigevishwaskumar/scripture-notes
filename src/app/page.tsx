import { BibleApp } from "@/components/BibleApp";

export default function HomePage() {
  return <BibleApp initialBookId="genesis" initialChapter={1} />;
}
