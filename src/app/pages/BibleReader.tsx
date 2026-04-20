import { useNavigate, useLocation } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { Book, ChevronLeft, ChevronRight, ArrowLeft, Loader2, Globe, BookOpen, Maximize2, Minimize2 } from 'lucide-react';

const MALAYALAM_PDF_URL = 'https://www.missionsagacity.com/_files/ugd/690627_c90570ee666244ed83dbec77a41ad6d0.pdf';

const BIBLE_BOOKS = [
  // Old Testament
  { name: 'Genesis', chapters: 50 },
  { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 },
  { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 },
  { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 },
  { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 },
  { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 },
  { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 },
  { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 150 },
  { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 },
  { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 },
  { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 },
  { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 },
  { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 },
  { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 },
  { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 },
  { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 },
  { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 },
  // New Testament
  { name: 'Matthew', chapters: 28 },
  { name: 'Mark', chapters: 16 },
  { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 },
  { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 },
  { name: '2 Corinthians', chapters: 13 },
  { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 },
  { name: 'Philippians', chapters: 4 },
  { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 },
  { name: '2 Thessalonians', chapters: 3 },
  { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 },
  { name: 'Titus', chapters: 3 },
  { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 },
  { name: 'James', chapters: 5 },
  { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 },
  { name: '1 John', chapters: 5 },
  { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 },
  { name: 'Jude', chapters: 1 },
  { name: 'Revelation', chapters: 22 },
];

const OT_COUNT = 39;

interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleResponse {
  reference: string;
  verses: BibleVerse[];
  text: string;
  translation_id: string;
  translation_name: string;
}

// ─── Malayalam PDF Reader ─────────────────────────────────────────────
function MalayalamBibleReader({ onSwitchLanguage }: { onSwitchLanguage: () => void }) {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[200] bg-white' : 'min-h-screen bg-gradient-to-b from-gray-50 to-white lined-bg'}`}>
      {/* Top Bar */}
      <div className="bg-black sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Back to Home</span>
            </button>

            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-[#d4af37]" />
              <span className="text-white font-semibold tracking-wide hidden sm:inline">സത്യവേദപുസ്തകം</span>
              <span className="text-white font-semibold tracking-wide sm:hidden">Bible</span>
              <span className="text-[#d4af37]/60 text-xs ml-1">ML</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full border border-[#d4af37]/20 text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-all cursor-pointer"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={onSwitchLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 transition-all text-sm cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>EN</span>
              </button>
            </div>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      </div>

      {/* Info bar */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black py-3 px-4 border-b border-[#d4af37]/10">
        <div className="container mx-auto flex items-center justify-center gap-3 text-center">
          <BookOpen className="h-4 w-4 text-[#d4af37] shrink-0" />
          <p className="text-sm text-gray-300">
            <span className="text-[#d4af37] font-medium">മലയാളം ബൈബിൾ</span>
            <span className="text-gray-500 mx-2">|</span>
            <span className="text-gray-400">Malayalam Holy Bible — Scroll to read</span>
          </p>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-100px)]' : 'h-[calc(100vh-160px)]'}`}>
        {/* Loading state */}
        {!pdfLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-50 z-10">
            <Loader2 className="h-10 w-10 text-[#d4af37] animate-spin" />
            <div className="text-center">
              <p className="text-gray-600 font-medium">Loading Malayalam Bible...</p>
              <p className="text-sm text-gray-400 mt-1">സത്യവേദപുസ്തകം ലോഡ് ചെയ്യുന്നു...</p>
            </div>
          </div>
        )}

        <iframe
          src={`${MALAYALAM_PDF_URL}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
          className="w-full h-full border-0"
          title="Malayalam Holy Bible - സത്യവേദപുസ്തകം"
          onLoad={() => setPdfLoaded(true)}
        />
      </div>

      {/* Footer */}
      <div className="bg-black py-2.5 px-4 border-t border-[#d4af37]/10">
        <div className="container mx-auto flex items-center justify-between">
          <p className="text-[10px] text-gray-500">Mission Sagacity &middot; സത്യവേദപുസ്തകം</p>
          <a
            href={MALAYALAM_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#d4af37]/50 hover:text-[#d4af37] transition-colors"
          >
            Open in new tab &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── English API Reader ───────────────────────────────────────────────
function EnglishBibleReader({ onSwitchLanguage }: { onSwitchLanguage: () => void }) {
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [reference, setReference] = useState('');
  const [translationName, setTranslationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);

  const currentBook = BIBLE_BOOKS[selectedBook];

  const fetchChapter = useCallback(async (bookIdx: number, chapter: number) => {
    setLoading(true);
    setError('');
    setVerses([]);

    const book = BIBLE_BOOKS[bookIdx];
    const bookQuery = book.name.replace(/ /g, '+');

    try {
      const res = await fetch(
        `https://bible-api.com/${bookQuery}+${chapter}?translation=kjv`
      );

      if (!res.ok) {
        setError('Could not load this chapter. Please try again.');
        setLoading(false);
        return;
      }

      const data: BibleResponse = await res.json();

      if (data.verses && data.verses.length > 0) {
        setVerses(data.verses);
        setReference(data.reference);
        setTranslationName(data.translation_name || 'King James Version');
      } else {
        setError('No verses found for this chapter.');
      }
    } catch {
      setError('Failed to connect to Bible API. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChapter(selectedBook, selectedChapter);
  }, [selectedBook, selectedChapter, fetchChapter]);

  const goToChapter = (bookIdx: number, chapter: number) => {
    setSelectedBook(bookIdx);
    setSelectedChapter(chapter);
    setShowBookSelector(false);
    setShowChapterSelector(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrevChapter = () => {
    if (selectedChapter > 1) {
      goToChapter(selectedBook, selectedChapter - 1);
    } else if (selectedBook > 0) {
      const prevBook = selectedBook - 1;
      goToChapter(prevBook, BIBLE_BOOKS[prevBook].chapters);
    }
  };

  const goNextChapter = () => {
    if (selectedChapter < currentBook.chapters) {
      goToChapter(selectedBook, selectedChapter + 1);
    } else if (selectedBook < BIBLE_BOOKS.length - 1) {
      goToChapter(selectedBook + 1, 1);
    }
  };

  const hasPrev = selectedBook > 0 || selectedChapter > 1;
  const hasNext = selectedBook < BIBLE_BOOKS.length - 1 || selectedChapter < currentBook.chapters;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white lined-bg">
      {/* Top Bar */}
      <div className="bg-black sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Back to Home</span>
            </button>

            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-[#d4af37]" />
              <span className="text-white font-semibold tracking-wide">Holy Bible</span>
              <span className="text-[#d4af37]/60 text-xs ml-1">EN</span>
            </div>

            {/* Language Toggle */}
            <button
              onClick={onSwitchLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 transition-all text-sm cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>ML</span>
            </button>
          </div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      </div>

      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[52px] z-40 shadow-sm">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={goPrevChapter}
              disabled={!hasPrev}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
              <button
                onClick={() => { setShowBookSelector(!showBookSelector); setShowChapterSelector(false); }}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-colors text-sm font-medium truncate max-w-[180px] cursor-pointer"
              >
                {currentBook.name}
              </button>
              <button
                onClick={() => { setShowChapterSelector(!showChapterSelector); setShowBookSelector(false); }}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-colors text-sm font-medium cursor-pointer"
              >
                Ch. {selectedChapter}
              </button>
            </div>

            <button
              onClick={goNextChapter}
              disabled={!hasNext}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Book Selector Dropdown */}
      {showBookSelector && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setShowBookSelector(false)}>
          <div
            className="absolute top-[104px] left-1/2 -translate-x-1/2 w-full max-w-2xl max-h-[70vh] bg-white rounded-b-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-center">Select Book</h3>
            </div>
            <div className="overflow-y-auto max-h-[calc(70vh-56px)] p-4">
              <p className="text-xs text-[#d4af37] uppercase tracking-wider font-semibold mb-2 px-1">Old Testament</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 mb-4">
                {BIBLE_BOOKS.slice(0, OT_COUNT).map((book, idx) => (
                  <button
                    key={book.name}
                    onClick={() => goToChapter(idx, 1)}
                    className={`px-2 py-2 rounded-lg text-xs text-left transition-all cursor-pointer truncate ${
                      idx === selectedBook
                        ? 'bg-[#d4af37] text-white font-semibold'
                        : 'bg-gray-50 hover:bg-[#d4af37]/10 text-gray-700 hover:text-[#d4af37]'
                    }`}
                  >
                    {book.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#d4af37] uppercase tracking-wider font-semibold mb-2 px-1">New Testament</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
                {BIBLE_BOOKS.slice(OT_COUNT).map((book, idx) => (
                  <button
                    key={book.name}
                    onClick={() => goToChapter(OT_COUNT + idx, 1)}
                    className={`px-2 py-2 rounded-lg text-xs text-left transition-all cursor-pointer truncate ${
                      OT_COUNT + idx === selectedBook
                        ? 'bg-[#d4af37] text-white font-semibold'
                        : 'bg-gray-50 hover:bg-[#d4af37]/10 text-gray-700 hover:text-[#d4af37]'
                    }`}
                  >
                    {book.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Selector Dropdown */}
      {showChapterSelector && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setShowChapterSelector(false)}>
          <div
            className="absolute top-[104px] left-1/2 -translate-x-1/2 w-full max-w-md max-h-[60vh] bg-white rounded-b-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-center">{currentBook.name} - Select Chapter</h3>
            </div>
            <div className="overflow-y-auto max-h-[calc(60vh-56px)] p-4">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => goToChapter(selectedBook, ch)}
                    className={`py-2.5 rounded-lg text-sm text-center transition-all cursor-pointer ${
                      ch === selectedChapter
                        ? 'bg-[#d4af37] text-white font-semibold'
                        : 'bg-gray-50 hover:bg-[#d4af37]/10 text-gray-700 hover:text-[#d4af37]'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
            {currentBook.name}{' '}
            <span className="text-[#d4af37]">{selectedChapter}</span>
          </h1>
          {translationName && (
            <p className="text-sm text-gray-400">{translationName}</p>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#d4af37] animate-spin" />
            <p className="text-sm text-gray-400">Loading scripture...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <BookOpen className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500 text-center max-w-sm">{error}</p>
          </div>
        )}

        {!loading && !error && verses.length > 0 && (
          <div className="space-y-0">
            <div className="prose prose-lg max-w-none leading-relaxed">
              {verses.map((verse) => (
                <span key={verse.verse} className="group">
                  <sup className="text-[#d4af37] font-semibold text-xs mr-1 select-none">
                    {verse.verse}
                  </sup>
                  <span className="text-gray-800 hover:bg-[#d4af37]/5 transition-colors rounded px-0.5">
                    {verse.text.trim()}{' '}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {!loading && verses.length > 0 && (
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200">
            <button
              onClick={goPrevChapter}
              disabled={!hasPrev}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-[#d4af37]/10 hover:text-[#d4af37] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <span className="text-sm text-gray-400">
              {reference}
            </span>

            <button
              onClick={goNextChapter}
              disabled={!hasNext}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-[#d4af37]/10 hover:text-[#d4af37] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="text-center mt-8 pb-8">
          <p className="text-[10px] text-gray-300">
            Powered by Bible API &middot; HelloAOLab/bible-api
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main BibleReader Export ──────────────────────────────────────────
export function BibleReader() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialLang = params.get('lang') || 'en';
  const [language, setLanguage] = useState<'en' | 'ml'>(initialLang as 'en' | 'ml');

  const switchLanguage = () => {
    const newLang = language === 'en' ? 'ml' : 'en';
    setLanguage(newLang);
    navigate(`/bible?lang=${newLang}`, { replace: true });
  };

  if (language === 'ml') {
    return <MalayalamBibleReader onSwitchLanguage={switchLanguage} />;
  }

  return <EnglishBibleReader onSwitchLanguage={switchLanguage} />;
}