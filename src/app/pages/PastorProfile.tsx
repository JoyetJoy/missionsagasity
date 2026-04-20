import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Mail, Phone, ChurchIcon, Calendar, ArrowLeft, BookOpen, Video, DollarSign, MapPin, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function PastorProfile() {
  const { id } = useParams<{ id: string }>();
  const { getPastorById } = useApp();
  const navigate = useNavigate();
  const pastor = id ? getPastorById(id) : undefined;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Get video thumbnail - custom first, then YouTube, then fallback
  const getVideoThumbnail = (video: { url?: string; thumbnail?: string }) => {
    if (video.thumbnail) return video.thumbnail;
    if (video.url) {
      const ytId = getYouTubeId(video.url);
      if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    }
    return null;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (!pastor) {
    return (
      <div className="min-h-screen bg-gray-50 lined-bg">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sage Not Found</h3>
              <p className="text-gray-600 mb-6">This sage profile does not exist.</p>
              <Button onClick={() => navigate('/sages')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Filter content by type - only show approved (or legacy items without status)
  const videos = (pastor.content?.filter(item => item.type === 'video' && item.approvalStatus !== 'pending' && item.approvalStatus !== 'rejected') || []);
  const approvedBooks = (pastor.books?.filter(b => b.approvalStatus !== 'pending' && b.approvalStatus !== 'rejected') || []);

  return (
    <div className="min-h-screen bg-gray-50 lined-bg">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/sages')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                {/* Profile Photo */}
                <div className="relative">
                  {pastor.photo ? (
                    <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                      <ImageWithFallback
                        src={pastor.photo}
                        alt={pastor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Avatar className="h-32 w-32">
                        <AvatarFallback className="text-4xl bg-blue-600 text-white">
                          {getInitials(pastor.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>

                {/* Name and Title */}
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-1">{pastor.name}</h1>
                  {pastor.title && (
                    <p className="text-blue-600 font-medium">{pastor.title}</p>
                  )}
                </div>

                {/* Contact Buttons */}
                <div className="space-y-3">
                  {pastor.email && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `mailto:${pastor.email}`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  )}
                  {pastor.phone && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `tel:${pastor.phone}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  )}
                </div>

                {/* Quick Info */}
                <div className="space-y-3 pt-4 border-t">
                  {pastor.church && (
                    <div className="flex items-start gap-3">
                      <ChurchIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Church</p>
                        <p className="font-medium">{pastor.church}</p>
                      </div>
                    </div>
                  )}
                  {pastor.yearsOfService && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Years of Service</p>
                        <p className="font-medium">{pastor.yearsOfService} years</p>
                      </div>
                    </div>
                  )}
                  {pastor.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-sm break-all">{pastor.email}</p>
                      </div>
                    </div>
                  )}
                  {pastor.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium">{pastor.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Need Spiritual Guidance Section */}
                <div className="pt-4 border-t">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-2 text-center">Need Spiritual Guidance?</h3>
                    <p className="text-xs text-gray-600 mb-3 text-center">
                      Reach out for prayer, counseling, or support.
                    </p>
                    <div className="space-y-2">
                      {pastor.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => window.location.href = `mailto:${pastor.email}`}
                        >
                          <Mail className="h-3 w-3 mr-2" />
                          Email {pastor.name.split(' ')[0]}
                        </Button>
                      )}
                      {pastor.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => window.location.href = `tel:${pastor.phone}`}
                        >
                          <Phone className="h-3 w-3 mr-2" />
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="books">Books</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                  </TabsList>

                  {/* About Tab */}
                  <TabsContent value="about" className="space-y-6">
                    {/* Bio */}
                    {pastor.bio && (
                      <div>
                        <h2 className="text-xl font-bold mb-4">About</h2>
                        <div className="prose prose-gray max-w-none">
                          {pastor.bio.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                            <p key={idx} className="text-gray-700 leading-relaxed mb-3">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Address & Location */}
                    {(pastor.address || pastor.locationLink) && (
                      <div>
                        <h2 className="text-xl font-bold mb-4">Location</h2>
                        <div className="space-y-2">
                          {pastor.address && (
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-700">{pastor.address}</p>
                                {pastor.pincode && (
                                  <p className="text-sm text-gray-500">PIN: {pastor.pincode}</p>
                                )}
                              </div>
                            </div>
                          )}
                          {pastor.locationLink && (
                            <a
                              href={pastor.locationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View on Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Areas of Ministry */}
                    {pastor.specialties && pastor.specialties.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold mb-4">Areas of Ministry</h2>
                        <div className="flex flex-wrap gap-2">
                          {pastor.specialties.map((specialty, idx) => (
                            <Badge key={idx} variant="secondary" className="text-sm px-4 py-2">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    <div>
                      <h2 className="text-xl font-bold mb-4">Experience</h2>
                      <div className="space-y-4">
                        {pastor.title && pastor.church && (
                          <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <ChurchIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{pastor.title}</h3>
                              <p className="text-gray-600">{pastor.church}</p>
                              {pastor.yearsOfService && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {pastor.yearsOfService} years of dedicated service
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {(!pastor.title || !pastor.church) && pastor.yearsOfService && (
                          <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
                              <span className="text-3xl font-bold text-blue-600">
                                {pastor.yearsOfService}
                              </span>
                            </div>
                            <p className="text-gray-600">Years of Ministry Experience</p>
                          </div>
                        )}
                        {!pastor.title && !pastor.church && !pastor.yearsOfService && (
                          <p className="text-gray-600 text-center py-4">
                            Experience information will be added soon.
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Books Tab */}
                  <TabsContent value="books">
                    {approvedBooks.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">Books & Publications</h2>
                            <p className="text-sm text-gray-500">{approvedBooks.length} publication{approvedBooks.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        {/* Amazon-style book grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {approvedBooks.map((book) => (
                            <div key={book.id} className="group flex flex-col">
                              {/* Book Cover */}
                              <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 shadow-md group-hover:shadow-xl transition-shadow cursor-pointer">
                                {book.coverImage ? (
                                  <ImageWithFallback
                                    src={book.coverImage}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="h-10 w-10 text-amber-300" />
                                  </div>
                                )}
                              </div>
                              {/* Book Info */}
                              <div className="mt-2 space-y-1">
                                <h3 className="text-sm font-medium line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{book.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-1">by {pastor.name}</p>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 text-green-600" />
                                  <span className="text-sm font-semibold">{book.price?.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                  {book.category && <span>{book.category}</span>}
                                  {book.pageCount && (
                                    <>
                                      {book.category && <span>·</span>}
                                      <span>{book.pageCount} pages</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No publications available yet.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Videos Tab */}
                  <TabsContent value="videos">
                    {videos.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center">
                            <Video className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">Video Messages</h2>
                            <p className="text-sm text-gray-500">{videos.length} video{videos.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {videos.map((video) => {
                            const thumbnailUrl = getVideoThumbnail(video);
                            return (
                              <a
                                key={video.id}
                                href={video.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group cursor-pointer block"
                              >
                                {/* Video Thumbnail */}
                                <div className="relative aspect-video overflow-hidden bg-gray-900 mb-3">
                                  {thumbnailUrl ? (
                                    <div className="relative w-full h-full">
                                      <ImageWithFallback
                                        src={thumbnailUrl}
                                        alt={video.title || 'Video thumbnail'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      {/* Play Button Overlay */}
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                          <Video className="h-8 w-8 text-white ml-1" fill="white" />
                                        </div>
                                      </div>
                                      {/* Date Badge */}
                                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                        {formatDate(video.createdAt)}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Video className="h-12 w-12 text-gray-600" />
                                    </div>
                                  )}
                                </div>
                                {/* Video Info */}
                                <div>
                                  <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {video.title || 'Untitled Video'}
                                  </h3>
                                  {video.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {video.description}
                                    </p>
                                  )}
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Video className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No videos available yet.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}