import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  BookOpen,
  Search,
  Filter,
  ShoppingCart,
  FileText,
  User,
  X,
  Check,
  Download,
  Tag,
  SlidersHorizontal,
  BookMarked,
  Library,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PastorBook, Pastor } from '../context/AppContext';

interface BookWithPastor extends PastorBook {
  pastor: Pastor;
}

export function DigitalBookstore() {
  const { pastors } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'title'>('newest');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookWithPastor | null>(null);
  const [purchaseName, setPurchaseName] = useState('');
  const [purchaseEmail, setPurchaseEmail] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Aggregate all books from all pastors
  const allBooks: BookWithPastor[] = useMemo(() => {
    return pastors.flatMap((pastor) =>
      (pastor.books || [])
        .filter((book) => book.approvalStatus !== 'pending' && book.approvalStatus !== 'rejected')
        .map((book) => ({
          ...book,
          pastor,
        }))
    );
  }, [pastors]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allBooks.map((b) => b.category).filter(Boolean));
    return ['all', ...Array.from(cats)] as string[];
  }, [allBooks]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let books = [...allBooks];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.pastor.name.toLowerCase().includes(q) ||
          (b.category && b.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      books = books.filter((b) => b.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        books.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        books.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        books.sort((a, b) => b.price - a.price);
        break;
      case 'title':
        books.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return books;
  }, [allBooks, searchQuery, selectedCategory, sortBy]);

  const handlePurchase = (book: BookWithPastor) => {
    setSelectedBook(book);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = () => {
    if (!purchaseName.trim() || !purchaseEmail.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success(`Purchase successful! "${selectedBook?.title}" will be sent to ${purchaseEmail}`);
    setShowPurchaseModal(false);
    setSelectedBook(null);
    setPurchaseName('');
    setPurchaseEmail('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalBooks = allBooks.length;
  const totalAuthors = new Set(allBooks.map((b) => b.pastor.id)).size;

  return (
    <div className="min-h-screen bg-gray-50 lined-bg">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1606733803396-1d028f0e6f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYm9va3N0b3JlJTIwbGlicmFyeSUyMHNoZWx2ZXN8ZW58MXx8fHwxNzcyNjI1MjE2fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Digital Bookstore"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </div>
          <div className="relative px-8 py-12 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 backdrop-blur-sm flex items-center justify-center">
                <Library className="h-6 w-6 text-amber-400" />
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 backdrop-blur-sm">
                Digital Library
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Digital Bookstore
            </h1>
            <p className="text-gray-300 max-w-xl mb-6">
              Explore a curated collection of spiritual books, devotionals, and Bible study guides from our sages. Available as digital PDF downloads.
            </p>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <BookMarked className="h-4 w-4 text-amber-400" />
                <span><span className="text-white font-semibold">{totalBooks}</span> Books</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <User className="h-4 w-4 text-amber-400" />
                <span><span className="text-white font-semibold">{totalAuthors}</span> Authors</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <FileText className="h-4 w-4 text-amber-400" />
                <span className="text-white font-semibold">PDF</span> Format
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search books by title, author, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-900"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {selectedCategory !== 'all' && (
                <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  1
                </Badge>
              )}
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <Card>
              <CardContent className="p-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Button
                          key={cat}
                          variant={selectedCategory === cat ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory(cat)}
                          className="capitalize"
                        >
                          {cat === 'all' ? 'All Categories' : cat}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Sort By
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'newest' as const, label: 'Newest' },
                        { value: 'price-low' as const, label: 'Price: Low to High' },
                        { value: 'price-high' as const, label: 'Price: High to Low' },
                        { value: 'title' as const, label: 'Title A-Z' },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={sortBy === option.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSortBy(option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredBooks.length}</span>{' '}
            {filteredBooks.length === 1 ? 'book' : 'books'}
            {selectedCategory !== 'all' && (
              <span>
                {' '}in <Badge variant="secondary" className="ml-1">{selectedCategory}</Badge>
              </span>
            )}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card
                key={book.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Book Cover */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  {book.coverImage ? (
                    <ImageWithFallback
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-amber-300 dark:text-amber-700" />
                    </div>
                  )}
                  {/* Overlay badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge className="bg-green-600 text-white shadow-md">
                      ${book.price.toFixed(2)}
                    </Badge>
                    <Badge className="bg-blue-600 text-white shadow-md">
                      <FileText className="h-3 w-3 mr-1" />
                      PDF
                    </Badge>
                  </div>
                  {book.category && (
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="bg-white/90 dark:bg-gray-900/90 shadow-md backdrop-blur-sm"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {book.category}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 flex flex-col flex-1">
                  {/* Book Info */}
                  <button
                    onClick={() => navigate(`/bookstore/${book.pastor.id}/${book.id}`)}
                    className="text-left"
                  >
                    <h3 className="font-semibold dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {book.title}
                    </h3>
                  </button>

                  {/* Author */}
                  <button
                    onClick={() => navigate(`/sages/${book.pastor.id}`)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 text-left"
                  >
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{book.pastor.name}</span>
                    {book.pastor.title && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        - {book.pastor.title}
                      </span>
                    )}
                  </button>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
                    {book.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mb-3">
                    {book.pageCount && <span>{book.pageCount} pages</span>}
                    {book.publishedDate && (
                      <>
                        {book.pageCount && <span>-</span>}
                        <span>{formatDate(book.publishedDate)}</span>
                      </>
                    )}
                  </div>

                  {/* Purchase Button */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/bookstore/${book.pastor.id}/${book.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                      onClick={() => handlePurchase(book)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      ${book.price.toFixed(2)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2 dark:text-white">No Books Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery
                  ? `No books match "${searchQuery}". Try a different search term.`
                  : 'No books available in this category yet.'}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPurchaseModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold dark:text-white">Purchase Book</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPurchaseModal(false)}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Order Summary
                </p>
                <div className="flex gap-3">
                  {selectedBook.coverImage ? (
                    <ImageWithFallback
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      className="w-16 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-20 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-amber-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm dark:text-white line-clamp-2">
                      {selectedBook.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      by {selectedBook.pastor.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        PDF
                      </Badge>
                      {selectedBook.pageCount && (
                        <span className="text-xs text-gray-500">{selectedBook.pageCount} pages</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    ${selectedBook.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Buyer Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="purchase-name" className="text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="purchase-name"
                    placeholder="Enter your name"
                    value={purchaseName}
                    onChange={(e) => setPurchaseName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="purchase-email" className="text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="purchase-email"
                    type="email"
                    placeholder="you@example.com"
                    value={purchaseEmail}
                    onChange={(e) => setPurchaseEmail(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    The PDF will be sent to this email address.
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {[
                  'Instant PDF download after purchase',
                  'Read on any device',
                  'Lifetime access to the book',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPurchaseModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  onClick={handleConfirmPurchase}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Purchase Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}