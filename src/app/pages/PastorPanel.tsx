import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Plus, Edit, Trash2, BookOpen, Video, DollarSign, ExternalLink, Clock, Info } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import type { PastorContent, PastorBook } from '../context/AppContext';

export function PastorPanel() {
  const { currentUser, pastors, updatePastor, getPastorByUserId } = useApp();
  const [activeTab, setActiveTab] = useState('books');

  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<PastorContent | null>(null);
  const [contentForm, setContentForm] = useState({
    type: 'video' as 'photo' | 'writing' | 'video',
    title: '',
    content: '',
    url: '',
    thumbnail: '',
    description: '',
  });

  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<PastorBook | null>(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    price: '',
    coverImage: '',
    pageCount: '',
    publishedDate: '',
    category: '',
  });
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>('');

  if (!currentUser || currentUser.role !== 'pastor') {
    return (
      <div className="min-h-screen bg-gray-50 lined-bg">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-500">You must be logged in as a sage to view this page</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const pastor = getPastorByUserId(currentUser.id);

  if (!pastor) {
    return (
      <div className="min-h-screen bg-gray-50 lined-bg">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold mb-2">Sage Profile Not Found</h2>
              <p className="text-gray-500">Your account is not linked to a sage profile. Please contact an administrator.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const pastorContent = pastor.content || [];
  const pastorBooks = pastor.books || [];
  const videos = pastorContent.filter((c) => c.type === 'video');

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const getApprovalBadge = (status?: string) => {
    if (status === 'pending') return <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 text-[10px]"><Clock className="h-2.5 w-2.5 mr-1" />Pending</Badge>;
    if (status === 'rejected') return <Badge variant="destructive" className="text-[10px]">Rejected</Badge>;
    return <Badge variant="default" className="bg-green-100 text-green-700 border-green-300 text-[10px]">Approved</Badge>;
  };

  // ---- Content Handlers (Videos) ----
  const handleContentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddContent = (type: 'photo' | 'writing' | 'video') => {
    setEditingContent(null);
    setContentForm({ type, title: '', content: '', url: '', thumbnail: '', description: '' });
    setIsContentDialogOpen(true);
  };

  const handleEditContent = (item: PastorContent) => {
    setEditingContent(item);
    setContentForm({
      type: item.type,
      title: item.title || '',
      content: item.content || '',
      url: item.url || '',
      thumbnail: item.thumbnail || '',
      description: item.description || '',
    });
    setIsContentDialogOpen(true);
  };

  const handleDeleteContent = (contentId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      const updatedContent = pastorContent.filter((c) => c.id !== contentId);
      updatePastor(pastor.id, { content: updatedContent });
    }
  };

  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedContent: PastorContent[];

    if (editingContent) {
      updatedContent = pastorContent.map((c) =>
        c.id === editingContent.id
          ? { ...c, ...contentForm, approvalStatus: 'pending' as const, createdAt: c.createdAt }
          : c
      );
    } else {
      const newItem: PastorContent = {
        id: `content-${Date.now()}`,
        ...contentForm,
        approvalStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
      updatedContent = [newItem, ...pastorContent];
    }

    updatePastor(pastor.id, { content: updatedContent });
    setIsContentDialogOpen(false);
    setEditingContent(null);
  };

  // ---- Book Handlers ----
  const handleBookFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setBookForm({ title: '', description: '', price: '', coverImage: '', pageCount: '', publishedDate: '', category: '' });
    setSelectedCoverFile(null);
    setCoverPreviewUrl('');
    setIsBookDialogOpen(true);
  };

  const handleEditBook = (book: PastorBook) => {
    setEditingBook(book);
    setBookForm({
      title: book.title || '',
      description: book.description || '',
      price: book.price ? String(book.price) : '',
      coverImage: book.coverImage || '',
      pageCount: book.pageCount ? String(book.pageCount) : '',
      publishedDate: book.publishedDate || '',
      category: book.category || '',
    });
    setSelectedCoverFile(null);
    setCoverPreviewUrl(book.coverImage || '');
    setIsBookDialogOpen(true);
  };

  const handleDeleteBook = (bookId: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      const updatedBooks = pastorBooks.filter((b) => b.id !== bookId);
      updatePastor(pastor.id, { books: updatedBooks });
    }
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedBooks: PastorBook[];

    if (editingBook) {
      updatedBooks = pastorBooks.map((b) =>
        b.id === editingBook.id
          ? {
              ...b,
              title: bookForm.title,
              description: bookForm.description,
              price: bookForm.price ? Number(bookForm.price) : 0,
              coverImage: bookForm.coverImage,
              pageCount: bookForm.pageCount ? Number(bookForm.pageCount) : undefined,
              publishedDate: bookForm.publishedDate,
              category: bookForm.category,
              approvalStatus: 'pending' as const,
            }
          : b
      );
    } else {
      const newBook: PastorBook = {
        id: `book-${Date.now()}`,
        title: bookForm.title,
        description: bookForm.description,
        price: bookForm.price ? Number(bookForm.price) : 0,
        coverImage: coverPreviewUrl,
        pageCount: bookForm.pageCount ? Number(bookForm.pageCount) : undefined,
        publishedDate: bookForm.publishedDate,
        category: bookForm.category,
        approvalStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
        _isNew: true,
        coverFile: selectedCoverFile || undefined,
      };
      updatedBooks = [newBook, ...pastorBooks];
    }

    updatePastor(pastor.id, { books: updatedBooks });
    setIsBookDialogOpen(false);
    setEditingBook(null);
    setSelectedCoverFile(null);
    setCoverPreviewUrl('');
  };

  return (
    <div className="min-h-screen bg-gray-50 lined-bg">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Pastor Header Card */}
          <Card className="border-[#d4af37]/30 bg-gradient-to-r from-black to-gray-900">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-[#d4af37]/50">
                  <AvatarImage src={pastor.photo} alt={pastor.name} />
                  <AvatarFallback className="bg-gradient-to-br from-[#d4af37] to-[#b8962e] text-white text-xl">
                    {getInitials(pastor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">{pastor.name}</h1>
                  <p className="text-[#d4af37]">{pastor.title} - {pastor.church}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/30">
                      {pastorBooks.length} Books
                    </Badge>
                    <Badge className="bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/30">
                      {videos.length} Videos
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              New books and videos require admin approval before they appear on your public profile. You'll see their status below.
            </AlertDescription>
          </Alert>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-3xl font-bold">{pastorBooks.length}</p>
                  <p className="text-sm text-gray-600">PDF Books</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Video className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <p className="text-3xl font-bold">{videos.length}</p>
                  <p className="text-sm text-gray-600">Videos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="books">PDF Books</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>

            {/* PDF Books Tab */}
            <TabsContent value="books" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>PDF Books</CardTitle>
                      <CardDescription>Manage your published books and resources</CardDescription>
                    </div>
                    <Button onClick={handleAddBook}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Book
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {pastorBooks.length === 0 ? (
                    <div className="py-12 text-center">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No books added yet</p>
                      <Button variant="outline" className="mt-4" onClick={handleAddBook}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Book
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {pastorBooks.map((book) => (
                        <div key={book.id} className="group relative flex flex-col">
                          {/* Book Cover - no corner curves */}
                          <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-md group-hover:shadow-xl transition-shadow">
                            {book.coverImage ? (
                              <ImageWithFallback
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                                <BookOpen className="h-10 w-10 text-purple-300" />
                              </div>
                            )}
                            {/* Hover overlay with actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/90 hover:bg-white text-gray-800 border-white/50 h-8 w-8 p-0"
                                onClick={() => handleEditBook(book)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteBook(book.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          {/* Book Info */}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1.5">
                              {getApprovalBadge(book.approvalStatus)}
                            </div>
                            <h3 className="text-sm font-medium line-clamp-2 leading-tight">{book.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1">by {pastor.name}</p>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="text-sm font-semibold">{book.price?.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              {book.category && <span>{book.category}</span>}
                              {book.pageCount && (
                                <>
                                  {book.category && <span>&middot;</span>}
                                  <span>{book.pageCount} pg</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Videos</CardTitle>
                      <CardDescription>Manage your sermons, teachings, and video content</CardDescription>
                    </div>
                    <Button onClick={() => handleAddContent('video')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Video
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {videos.length === 0 ? (
                    <div className="py-12 text-center">
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No videos added yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => handleAddContent('video')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Video
                      </Button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((video) => (
                        <div key={video.id} className="group relative overflow-hidden border bg-white">
                          {/* Video Thumbnail - no corner curves */}
                          <div className="relative aspect-video bg-gray-900">
                            {video.thumbnail ? (
                              <ImageWithFallback
                                src={video.thumbnail}
                                alt={video.title || 'Video thumbnail'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                <Video className="h-12 w-12 text-gray-600" />
                              </div>
                            )}
                            {/* Play button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Video className="h-6 w-6 text-white ml-0.5" fill="white" />
                              </div>
                            </div>
                            {/* Hover action buttons */}
                            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/90 hover:bg-white text-gray-800 border-white/50 h-7 w-7 p-0"
                                onClick={() => handleEditContent(video)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 w-7 p-0"
                                onClick={() => handleDeleteContent(video.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {/* Video Info */}
                          <div className="p-3 space-y-1">
                            <div className="flex items-center gap-1.5">
                              {getApprovalBadge(video.approvalStatus)}
                            </div>
                            <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                            {video.description && (
                              <p className="text-xs text-gray-500 line-clamp-2">{video.description}</p>
                            )}
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-gray-400">
                                {new Date(video.createdAt).toLocaleDateString()}
                              </span>
                              {video.url && (
                                <a
                                  href={video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-blue-600 hover:underline text-[10px]"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Watch
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Video Content Dialog */}
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Edit' : 'Add'} Video
            </DialogTitle>
            <DialogDescription>
              {editingContent
                ? 'Update the details for this video. It will be re-submitted for admin approval.'
                : 'Add a new video. It will require admin approval before appearing on your profile.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content-title">Title</Label>
              <Input
                id="content-title"
                name="title"
                value={contentForm.title}
                onChange={handleContentFormChange}
                placeholder="Enter video title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-url">YouTube URL</Label>
              <Input
                id="content-url"
                name="url"
                value={contentForm.url}
                onChange={handleContentFormChange}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-thumbnail">Thumbnail Image URL</Label>
              <Input
                id="content-thumbnail"
                name="thumbnail"
                value={contentForm.thumbnail}
                onChange={handleContentFormChange}
                placeholder="https://example.com/thumbnail.jpg"
              />
              <p className="text-xs text-gray-500">
                Optional. If empty, YouTube thumbnail will be used on profile.
              </p>
              {contentForm.thumbnail && (
                <div className="mt-2 aspect-video w-full max-w-[200px] overflow-hidden border">
                  <ImageWithFallback
                    src={contentForm.thumbnail}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-description">Description (optional)</Label>
              <Textarea
                id="content-description"
                name="description"
                value={contentForm.description}
                onChange={handleContentFormChange}
                placeholder="Brief description..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingContent ? 'Update' : 'Add'} Video
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Book Dialog */}
      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            <DialogDescription>
              {editingBook ? 'Update the book details. It will be re-submitted for admin approval.' : 'Add a new PDF book. It will require admin approval before appearing on your profile.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="book-title">Title</Label>
              <Input
                id="book-title"
                name="title"
                value={bookForm.title}
                onChange={handleBookFormChange}
                placeholder="Book title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-description">Description</Label>
              <Textarea
                id="book-description"
                name="description"
                value={bookForm.description}
                onChange={handleBookFormChange}
                placeholder="Book description..."
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="book-price">Price (USD)</Label>
                <Input
                  id="book-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={bookForm.price}
                  onChange={handleBookFormChange}
                  placeholder="14.99"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="book-pageCount">Page Count</Label>
                <Input
                  id="book-pageCount"
                  name="pageCount"
                  type="number"
                  value={bookForm.pageCount}
                  onChange={handleBookFormChange}
                  placeholder="200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-cover">Upload Cover Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="book-cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedCoverFile(file);
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setCoverPreviewUrl(ev.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="cursor-pointer"
                />
              </div>
              {coverPreviewUrl && (
                <div className="mt-2 w-20 h-28 overflow-hidden border">
                  <ImageWithFallback
                    src={coverPreviewUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="book-category">Category</Label>
                <Input
                  id="book-category"
                  name="category"
                  value={bookForm.category}
                  onChange={handleBookFormChange}
                  placeholder="e.g. Devotional, Theology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="book-publishedDate">Published Date</Label>
                <Input
                  id="book-publishedDate"
                  name="publishedDate"
                  type="date"
                  value={bookForm.publishedDate}
                  onChange={handleBookFormChange}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsBookDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingBook ? 'Update Book' : 'Add Book'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}