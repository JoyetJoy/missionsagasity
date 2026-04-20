import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  BookOpen,
  ArrowLeft,
  ShoppingCart,
  FileText,
  User,
  X,
  Check,
  Download,
  Tag,
  Calendar,
  BookMarked,
  Library,
  ChevronRight,
  Layers,
  Clock,
  Star,
  Shield,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PastorBook, Pastor } from '../context/AppContext';

export function BookDetail() {
  const { pastorId, bookId } = useParams<{ pastorId: string; bookId: string }>();
  const { pastors } = useApp();
  const navigate = useNavigate();

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseName, setPurchaseName] = useState('');
  const [purchaseEmail, setPurchaseEmail] = useState('');

  // Find the pastor and book
  const pastor = pastors.find((p) => p.id === pastorId);
  const book = pastor?.books?.find((b) => b.id === bookId);

  // Get other books from same pastor
  const otherBooksByPastor = useMemo(() => {
    if (!pastor?.books) return [];
    return pastor.books.filter((b) => b.id !== bookId && b.approvalStatus !== 'pending' && b.approvalStatus !== 'rejected');
  }, [pastor, bookId]);

  // Get other books from other pastors
  const otherBooks = useMemo(() => {
    return pastors
      .filter((p) => p.id !== pastorId)
      .flatMap((p) =>
        (p.books || []).map((b) => ({
          ...b,
          pastor: p,
        }))
      )
      .slice(0, 4);
  }, [pastors, pastorId]);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleConfirmPurchase = () => {
    if (!purchaseName.trim() || !purchaseEmail.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success(`Purchase successful! "${book?.title}" will be sent to ${purchaseEmail}`);
    setShowPurchaseModal(false);
    setPurchaseName('');
    setPurchaseEmail('');
  };

  // Not found state
  if (!pastor || !book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Book Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This book does not exist or has been removed.
              </p>
              <Button onClick={() => navigate('/bookstore')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookstore
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lined-bg">
      <Navbar />

      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          {book.coverImage ? (
            <ImageWithFallback
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-600 to-orange-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="pt-6 pb-4">
            <nav className="flex items-center gap-2 text-sm text-gray-300">
              <button
                onClick={() => navigate('/bookstore')}
                className="hover:text-white transition-colors"
              >
                Bookstore
              </button>
              <ChevronRight className="h-3 w-3" />
              <button
                onClick={() => navigate(`/sages/${pastor.id}`)}
                className="hover:text-white transition-colors"
              >
                {pastor.name}
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white truncate max-w-[200px]">{book.title}</span>
            </nav>
          </div>

          {/* Book Hero Content */}
          <div className="flex flex-col md:flex-row gap-8 pb-12 pt-4">
            {/* Book Cover */}
            <div className="flex-shrink-0">
              <div className="relative w-56 md:w-64 mx-auto md:mx-0">
                <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                  {book.coverImage ? (
                    <ImageWithFallback
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                      <BookOpen className="h-20 w-20 text-amber-400" />
                    </div>
                  )}
                </div>
                {/* Floating badges */}
                <div className="absolute -top-2 -right-2 flex flex-col gap-2">
                  <Badge className="bg-blue-600 text-white shadow-lg px-3 py-1">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    PDF
                  </Badge>
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div className="flex-1 flex flex-col justify-center text-center md:text-left">
              {book.category && (
                <Badge
                  variant="secondary"
                  className="bg-white/10 text-amber-300 border-amber-500/30 backdrop-blur-sm self-center md:self-start mb-3 px-3"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {book.category}
                </Badge>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {book.title}
              </h1>

              {/* Author Link */}
              <button
                onClick={() => navigate(`/sages/${pastor.id}`)}
                className="flex items-center gap-3 self-center md:self-start mb-6 group"
              >
                <Avatar className="h-10 w-10 ring-2 ring-white/20">
                  {pastor.photo ? (
                    <AvatarImage src={pastor.photo} alt={pastor.name} />
                  ) : null}
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getInitials(pastor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-white font-medium group-hover:text-amber-300 transition-colors">
                    {pastor.name}
                  </p>
                  {pastor.title && (
                    <p className="text-gray-400 text-sm">{pastor.title}</p>
                  )}
                </div>
              </button>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Layers className="h-4 w-4 text-amber-400" />
                  <span>{book.pageCount || '—'} pages</span>
                </div>
                {book.publishedDate && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    <span>{formatDate(book.publishedDate)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <span>Digital PDF</span>
                </div>
              </div>

              {/* Price & Purchase */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-3xl font-bold text-green-400">
                  ${book.price.toFixed(2)}
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 shadow-lg shadow-amber-500/25"
                  onClick={() => setShowPurchaseModal(true)}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Purchase PDF
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => navigate('/bookstore')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Browse More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Book Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-amber-500" />
                  About This Book
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </CardContent>
            </Card>

            {/* What You Get */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  What You Get
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Download className="h-5 w-5" />,
                      title: 'Instant Download',
                      desc: 'Get your PDF immediately after purchase',
                    },
                    {
                      icon: <Smartphone className="h-5 w-5" />,
                      title: 'Read Anywhere',
                      desc: 'Compatible with all devices and PDF readers',
                    },
                    {
                      icon: <Clock className="h-5 w-5" />,
                      title: 'Lifetime Access',
                      desc: 'Download and keep your book forever',
                    },
                    {
                      icon: <Shield className="h-5 w-5" />,
                      title: 'Secure Purchase',
                      desc: 'Safe and encrypted payment processing',
                    },
                    {
                      icon: <Monitor className="h-5 w-5" />,
                      title: 'High Quality',
                      desc: 'Professionally formatted PDF document',
                    },
                    {
                      icon: <Layers className="h-5 w-5" />,
                      title: `${book.pageCount || '—'} Pages`,
                      desc: 'Comprehensive content and insights',
                    },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        {feature.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm dark:text-white">{feature.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* About the Author */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-500" />
                  About the Author
                </h2>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 flex-shrink-0">
                    {pastor.photo ? (
                      <AvatarImage src={pastor.photo} alt={pastor.name} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                      {getInitials(pastor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg dark:text-white">{pastor.name}</h3>
                    {pastor.title && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{pastor.title}</p>
                    )}
                    {pastor.bio && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                        {pastor.bio}
                      </p>
                    )}
                    {pastor.church && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                        {pastor.church} {pastor.yearsOfService ? `- ${pastor.yearsOfService} years of service` : ''}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/sages/${pastor.id}`)}
                    >
                      View Profile
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Purchase Sidebar */}
          <div className="space-y-6">
            {/* Sticky Purchase Card */}
            <Card className="sticky top-24 border-amber-200 dark:border-amber-800/50">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    ${book.price.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">One-time purchase</p>
                </div>

                <Button
                  className="w-full mb-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  size="lg"
                  onClick={() => setShowPurchaseModal(true)}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Purchase PDF Now
                </Button>

                <div className="space-y-3 mt-4">
                  {[
                    'Instant PDF download',
                    'Read on any device',
                    'Lifetime access',
                    'Secure payment',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Book Details Summary */}
                <div className="mt-6 pt-4 border-t dark:border-gray-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Format</span>
                    <span className="font-medium dark:text-white">PDF</span>
                  </div>
                  {book.pageCount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Pages</span>
                      <span className="font-medium dark:text-white">{book.pageCount}</span>
                    </div>
                  )}
                  {book.category && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Category</span>
                      <span className="font-medium dark:text-white">{book.category}</span>
                    </div>
                  )}
                  {book.publishedDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Published</span>
                      <span className="font-medium dark:text-white">{formatDate(book.publishedDate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Author</span>
                    <span className="font-medium dark:text-white">{pastor.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* More Books by Same Pastor */}
            {otherBooksByPastor.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 dark:text-white">
                    More by {pastor.name}
                  </h3>
                  <div className="space-y-3">
                    {otherBooksByPastor.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => navigate(`/bookstore/${pastor.id}/${b.id}`)}
                        className="flex gap-3 w-full text-left group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {b.coverImage ? (
                          <ImageWithFallback
                            src={b.coverImage}
                            alt={b.title}
                            className="w-12 h-16 rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-16 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-amber-600" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {b.title}
                          </p>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                            ${b.price.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* More Books from Other Authors */}
        {otherBooks.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold dark:text-white">More Books You Might Like</h2>
              <Button variant="ghost" onClick={() => navigate('/bookstore')}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherBooks.map((b) => (
                <Card
                  key={b.id}
                  className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/bookstore/${b.pastor.id}/${b.id}`)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                    {b.coverImage ? (
                      <ImageWithFallback
                        src={b.coverImage}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-amber-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-green-600 text-white shadow-md">
                        ${b.price.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm dark:text-white line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      by {b.pastor.name}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && (
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
                  {book.coverImage ? (
                    <ImageWithFallback
                      src={book.coverImage}
                      alt={book.title}
                      className="w-16 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-20 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-amber-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm dark:text-white line-clamp-2">
                      {book.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      by {pastor.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        PDF
                      </Badge>
                      {book.pageCount && (
                        <span className="text-xs text-gray-500">{book.pageCount} pages</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    ${book.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Buyer Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="detail-purchase-name" className="text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="detail-purchase-name"
                    placeholder="Enter your name"
                    value={purchaseName}
                    onChange={(e) => setPurchaseName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="detail-purchase-email" className="text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="detail-purchase-email"
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