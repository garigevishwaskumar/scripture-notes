const fs = require('fs');

const standardEnglishBooks = [
  // Old Testament (39)
  { id: "genesis", name: "Genesis", testament: "OT" },
  { id: "exodus", name: "Exodus", testament: "OT" },
  { id: "leviticus", name: "Leviticus", testament: "OT" },
  { id: "numbers", name: "Numbers", testament: "OT" },
  { id: "deuteronomy", name: "Deuteronomy", testament: "OT" },
  { id: "joshua", name: "Joshua", testament: "OT" },
  { id: "judges", name: "Judges", testament: "OT" },
  { id: "ruth", name: "Ruth", testament: "OT" },
  { id: "1-samuel", name: "1 Samuel", testament: "OT" },
  { id: "2-samuel", name: "2 Samuel", testament: "OT" },
  { id: "1-kings", name: "1 Kings", testament: "OT" },
  { id: "2-kings", name: "2 Kings", testament: "OT" },
  { id: "1-chronicles", name: "1 Chronicles", testament: "OT" },
  { id: "2-chronicles", name: "2 Chronicles", testament: "OT" },
  { id: "ezra", name: "Ezra", testament: "OT" },
  { id: "nehemiah", name: "Nehemiah", testament: "OT" },
  { id: "esther", name: "Esther", testament: "OT" },
  { id: "job", name: "Job", testament: "OT" },
  { id: "psalms", name: "Psalms", testament: "OT" },
  { id: "proverbs", name: "Proverbs", testament: "OT" },
  { id: "ecclesiastes", name: "Ecclesiastes", testament: "OT" },
  { id: "song-of-solomon", name: "Song of Solomon", testament: "OT" },
  { id: "isaiah", name: "Isaiah", testament: "OT" },
  { id: "jeremiah", name: "Jeremiah", testament: "OT" },
  { id: "lamentations", name: "Lamentations", testament: "OT" },
  { id: "ezekiel", name: "Ezekiel", testament: "OT" },
  { id: "daniel", name: "Daniel", testament: "OT" },
  { id: "hosea", name: "Hosea", testament: "OT" },
  { id: "joel", name: "Joel", testament: "OT" },
  { id: "amos", name: "Amos", testament: "OT" },
  { id: "obadiah", name: "Obadiah", testament: "OT" },
  { id: "jonah", name: "Jonah", testament: "OT" },
  { id: "micah", name: "Micah", testament: "OT" },
  { id: "nahum", name: "Nahum", testament: "OT" },
  { id: "habakkuk", name: "Habakkuk", testament: "OT" },
  { id: "zephaniah", name: "Zephaniah", testament: "OT" },
  { id: "haggai", name: "Haggai", testament: "OT" },
  { id: "zechariah", name: "Zechariah", testament: "OT" },
  { id: "malachi", name: "Malachi", testament: "OT" },
  // New Testament (27)
  { id: "matthew", name: "Matthew", testament: "NT" },
  { id: "mark", name: "Mark", testament: "NT" },
  { id: "luke", name: "Luke", testament: "NT" },
  { id: "john", name: "John", testament: "NT" },
  { id: "acts", name: "Acts", testament: "NT" },
  { id: "romans", name: "Romans", testament: "NT" },
  { id: "1-corinthians", name: "1 Corinthians", testament: "NT" },
  { id: "2-corinthians", name: "2 Corinthians", testament: "NT" },
  { id: "galatians", name: "Galatians", testament: "NT" },
  { id: "ephesians", name: "Ephesians", testament: "NT" },
  { id: "philippians", name: "Philippians", testament: "NT" },
  { id: "colossians", name: "Colossians", testament: "NT" },
  { id: "1-thessalonians", name: "1 Thessalonians", testament: "NT" },
  { id: "2-thessalonians", name: "2 Thessalonians", testament: "NT" },
  { id: "1-timothy", name: "1 Timothy", testament: "NT" },
  { id: "2-timothy", name: "2 Timothy", testament: "NT" },
  { id: "titus", name: "Titus", testament: "NT" },
  { id: "philemon", name: "Philemon", testament: "NT" },
  { id: "hebrews", name: "Hebrews", testament: "NT" },
  { id: "james", name: "James", testament: "NT" },
  { id: "1-peter", name: "1 Peter", testament: "NT" },
  { id: "2-peter", name: "2 Peter", testament: "NT" },
  { id: "1-john", name: "1 John", testament: "NT" },
  { id: "2-john", name: "2 John", testament: "NT" },
  { id: "3-john", name: "3 John", testament: "NT" },
  { id: "jude", name: "Jude", testament: "NT" },
  { id: "revelation", name: "Revelation", testament: "NT" }
];

const rawData = JSON.parse(fs.readFileSync('./public/bible-kjv.json', 'utf8'));

if (rawData.length !== standardEnglishBooks.length) {
  console.error(`Count mismatch: raw has ${rawData.length} books, expected ${standardEnglishBooks.length}`);
  process.exit(1);
}

const cleanedBible = rawData.map((rawBook, index) => {
  const meta = standardEnglishBooks[index];
  return {
    id: meta.id,
    name: meta.name,
    testament: meta.testament,
    bookNumber: index + 1,
    chapterCount: rawBook.chapters.length,
    chapters: rawBook.chapters // Array of arrays of strings (verses)
  };
});

// Also create a lightweight books metadata list so components can render book lists without loading 4MB JSON every time
const booksMeta = cleanedBible.map(b => ({
  id: b.id,
  name: b.name,
  testament: b.testament,
  bookNumber: b.bookNumber,
  chapterCount: b.chapterCount
}));

fs.writeFileSync('./public/bible-kjv.json', JSON.stringify(cleanedBible));
fs.writeFileSync('./src/data/bible-meta.json', JSON.stringify(booksMeta, null, 2));

console.log('Successfully structured Bible JSON and generated metadata!');
console.log('Total books:', cleanedBible.length);
console.log('Sample book:', cleanedBible[0].name, 'chapters:', cleanedBible[0].chapterCount, 'Genesis 1:1:', cleanedBible[0].chapters[0][0]);
