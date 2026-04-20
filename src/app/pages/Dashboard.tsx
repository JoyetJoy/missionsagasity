import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { PostCard } from '../components/PostCard';
import { UpcomingPrayers } from '../components/UpcomingPrayers';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Info, ImagePlus, X, Calendar, Video, TrendingUp, MessageSquare, Upload, FileText, Megaphone } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';

const FEED_VERSES = [
  { text: "For where two or three gather in my name, there am I with them.", ref: "Matthew 18:20" },
  { text: "Iron sharpens iron, and one man sharpens another.", ref: "Proverbs 27:17" },
  { text: "And let us consider how we may spur one another on toward love and good deeds.", ref: "Hebrews 10:24" },
  { text: "Bear one another's burdens, and so fulfill the law of Christ.", ref: "Galatians 6:2" },
  { text: "A friend loves at all times, and a brother is born for a time of adversity.", ref: "Proverbs 17:17" },
  { text: "How good and pleasant it is when God's people live together in unity!", ref: "Psalm 133:1" },
  { text: "Therefore encourage one another and build each other up.", ref: "1 Thessalonians 5:11" },
  { text: "Love is patient, love is kind. It does not envy, it does not boast.", ref: "1 Corinthians 13:4" },
  { text: "Above all, love each other deeply, because love covers over a multitude of sins.", ref: "1 Peter 4:8" },
  { text: "Be completely humble and gentle; be patient, bearing with one another in love.", ref: "Ephesians 4:2" },
  { text: "Rejoice with those who rejoice; mourn with those who mourn.", ref: "Romans 12:15" },
  { text: "Two are better than one, because they have a good return for their labor.", ref: "Ecclesiastes 4:9" },
  { text: "The Lord bless you and keep you; the Lord make his face shine on you.", ref: "Numbers 6:24-25" },
];

const logoImage = 'https://brain-wish-86640978.figma.site/_assets/v11/816644fbd3824115a01caa8d85f8ea2914be6054.png';

export function Dashboard() {
  const { posts, getUserGroups, createPost, currentUser, groups, joinGroup } = useApp();
  const navigate = useNavigate();
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showMeetingInput, setShowMeetingInput] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);
  const [selectedAttachmentFile, setSelectedAttachmentFile] = useState<File | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingEndTime, setMeetingEndTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');

  // Admin broadcast state
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastImageUrl, setBroadcastImageUrl] = useState('');
  const [selectedBroadcastImageFile, setSelectedBroadcastImageFile] = useState<File | null>(null);
  const [showBroadcastImageInput, setShowBroadcastImageInput] = useState(false);
  const [broadcastCommentsEnabled, setBroadcastCommentsEnabled] = useState(true);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const feedVerse = useMemo(() => FEED_VERSES[Math.floor(Math.random() * FEED_VERSES.length)], []);

  const userGroups = getUserGroups();
  const userFeedPosts = posts
    .filter((post) => {
      // Always show global/admin broadcast posts to everyone
      if (post.groupId === '__global__') return true;
      const group = groups.find((g) => g.id === post.groupId);
      if (!group || group.status !== 'approved') return false;
      // Show posts from public groups to everyone, plus posts from user's own groups
      return group.type === 'public' || userGroups.some((ug) => ug.id === group.id);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const hasGlobalPosts = userFeedPosts.some(p => p.groupId === '__global__');
  const showFeedLayout = userGroups.length > 0 || isAdmin || hasGlobalPosts;

  // Get suggested groups
  const suggestedGroups = groups
    .filter(group => 
      group.status === 'approved' && 
      !group.members.includes(currentUser?.id || '')
    )
    .slice(0, 3);
  
  // Calculate group activity stats
  const groupActivityStats = userGroups.map(group => {
    const groupPosts = posts.filter(post => post.groupId === group.id);
    const postsLast24h = groupPosts.filter(post => {
      const postDate = new Date(post.createdAt);
      const now = new Date();
      const diffHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    });
    
    const latestPost = groupPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    return {
      group,
      totalPosts: groupPosts.length,
      recentPosts: postsLast24h.length,
      latestActivity: latestPost ? new Date(latestPost.createdAt) : null,
    };
  }).sort((a, b) => b.recentPosts - a.recentPosts);
  
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim() && selectedGroupId) {
      const postData: any = {
        groupId: selectedGroupId,
        authorId: currentUser!.id,
        content: newPostContent,
        imageUrl: imageUrl || undefined,
        commentsEnabled,
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
      };

      // Add meeting data if provided
      if (showMeetingInput && meetingTitle && meetingDate && meetingTime && meetingLink) {
        postData.meeting = {
          title: meetingTitle,
          date: meetingDate,
          time: meetingTime,
          endTime: meetingEndTime || undefined,
          meetLink: meetingLink,
        };
      }

      createPost(postData, selectedImageFile || undefined, selectedAttachmentFile || undefined);
      setNewPostContent('');
      setSelectedGroupId('');
      setImageUrl('');
      setSelectedImageFile(null);
      setShowImageInput(false);
      setShowMeetingInput(false);
      setShowFileInput(false);
      setSelectedAttachmentFile(null);
      setMeetingTitle('');
      setMeetingDate('');
      setMeetingTime('');
      setMeetingEndTime('');
      setMeetingLink('');
      setCommentsEnabled(true);
      setFileUrl('');
      setFileName('');
    }
  };

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (broadcastContent.trim()) {
      const postData: any = {
        groupId: '__global__',
        authorId: currentUser!.id,
        content: broadcastContent,
        imageUrl: broadcastImageUrl || undefined,
        commentsEnabled: broadcastCommentsEnabled,
      };

      createPost(postData, selectedBroadcastImageFile || undefined);
      setBroadcastContent('');
      setBroadcastImageUrl('');
      setSelectedBroadcastImageFile(null);
      setShowBroadcastImageInput(false);
      setBroadcastCommentsEnabled(true);
      setShowBroadcastForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 lined-bg">
      <Navbar />
      
      {/* Gold border line below navbar */}
      <div className="relative h-[3px] w-full shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-90" />
        <div className="absolute left-1/4 top-0 h-full w-24 bg-gradient-to-r from-[#d4af37] to-[#f5d780] blur-[1px]" />
        <div className="absolute right-1/3 top-0 h-full w-16 bg-gradient-to-r from-[#f5d780] to-[#d4af37] blur-[1px]" />
        <div className="absolute left-1/2 top-0 h-full w-20 bg-[#d4af37] blur-[0.5px] opacity-60" />
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 mb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold"><span className="gold-text">Wisdom</span> Feed</h1>
            <p className="text-base italic text-gray-600">
              "{feedVerse.text}"
              <span className="text-sm not-italic text-[#d4af37] ml-1">— {feedVerse.ref}</span>
            </p>
          </div>

          {userGroups.length === 0 && !isAdmin && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You haven't joined any flocks yet. Visit the Flocks page to join communities and start seeing posts in your feed.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {showFeedLayout && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Side - Feed (3/4) */}
            <div className="lg:col-span-3 space-y-4">
              {/* My Groups Section */}
              {userGroups.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">My Flocks</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/flocks')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {userGroups.map((group) => (
                      <div
                        key={group.id}
                        className="flex flex-col gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/flocks/${group.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          {group.avatar ? (
                            <img 
                              src={group.avatar} 
                              alt={group.name}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {group.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{group.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span>{group.members.length} members</span>
                              <span>•</span>
                              <span className="capitalize">{group.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Feed Posts */}
              {userFeedPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">No posts yet. Be the first to post in your groups!</p>
                  </CardContent>
                </Card>
              ) : (
                userFeedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>

            {/* Right Side - Create Post (1/4) */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                {/* Admin Broadcast Card */}
                {isAdmin && (
                  <Card className="border-black border-2 bg-black/[0.02]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <img src={logoImage} alt="Mission Sagacity" className="h-7 w-7 rounded-full object-contain" />
                        <div>
                          <CardTitle className="text-base">Broadcast</CardTitle>
                          <p className="text-xs text-gray-500">Post as Mission Sagacity</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!showBroadcastForm ? (
                        <Button
                          onClick={() => setShowBroadcastForm(true)}
                          className="w-full bg-black hover:bg-black/80 text-white"
                        >
                          <Megaphone className="h-4 w-4 mr-2" />
                          New Broadcast
                        </Button>
                      ) : (
                        <form onSubmit={handleCreateBroadcast} className="space-y-3">
                          <Textarea
                            placeholder="Share a message with the entire community..."
                            value={broadcastContent}
                            onChange={(e) => setBroadcastContent(e.target.value)}
                            className="min-h-[100px]"
                            autoFocus
                          />

                          {showBroadcastImageInput && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Upload Image</Label>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setShowBroadcastImageInput(false); setBroadcastImageUrl(''); }}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="relative">
                                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => { 
                                  const file = e.target.files?.[0]; 
                                  if (file) { 
                                    setSelectedBroadcastImageFile(file);
                                    const reader = new FileReader(); 
                                    reader.onload = (ev) => { setBroadcastImageUrl(ev.target?.result as string); }; 
                                    reader.readAsDataURL(file); 
                                  } 
                                }} />
                                <div className="flex flex-col items-center gap-2 p-3 border-2 border-dashed border-[#d4af37]/30 rounded-lg bg-[#d4af37]/5 hover:bg-[#d4af37]/10 transition-colors">
                                  <ImagePlus className="h-5 w-5 text-[#d4af37]/60" />
                                  <span className="text-xs text-gray-500">Click to upload</span>
                                </div>
                              </div>
                              {broadcastImageUrl && (
                                <div className="relative rounded-lg overflow-hidden border border-[#d4af37]/20">
                                  <img src={broadcastImageUrl} alt="Preview" className="w-full h-28 object-cover" />
                                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white" onClick={() => { setBroadcastImageUrl(''); setSelectedBroadcastImageFile(null); }}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {!showBroadcastImageInput && (
                            <Button type="button" variant="outline" size="sm" onClick={() => setShowBroadcastImageInput(true)} className="w-full">
                              <ImagePlus className="h-4 w-4 mr-2" />
                              Add Image
                            </Button>
                          )}

                          <div className="flex items-center gap-2">
                            <Switch checked={broadcastCommentsEnabled} onCheckedChange={setBroadcastCommentsEnabled} />
                            <Label className="text-sm">Enable Comments</Label>
                          </div>

                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => { setShowBroadcastForm(false); setBroadcastContent(''); setBroadcastImageUrl(''); setShowBroadcastImageInput(false); }}>
                              Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={!broadcastContent.trim()} className="flex-1 bg-black hover:bg-black/80 text-white">
                              <Megaphone className="h-3 w-3 mr-1" />
                              Broadcast
                            </Button>
                          </div>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Regular Create Post Card - only show if user has groups */}
                {userGroups.length > 0 && (
                <Card className="border-[#d4af37] border-2">
                  <CardHeader>
                    <CardTitle>Create Post</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                      <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select flock" />
                        </SelectTrigger>
                        <SelectContent>
                          {userGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Textarea
                        placeholder="What's on your mind?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[120px]"
                      />

                      {showImageInput && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Upload Image</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setShowImageInput(false);
                                setImageUrl('');
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setSelectedImageFile(file);
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        setImageUrl(ev.target?.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-[#d4af37]/30 rounded-lg bg-[#d4af37]/5 hover:bg-[#d4af37]/10 transition-colors">
                                  <ImagePlus className="h-6 w-6 text-[#d4af37]/60" />
                                  <span className="text-xs text-gray-500">Click to upload image</span>
                                </div>
                              </div>
                              {imageUrl && (
                                <div className="relative rounded-lg overflow-hidden border border-[#d4af37]/20">
                                  <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-full h-32 object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
                                    onClick={() => {
                                      setImageUrl('');
                                      setSelectedImageFile(null);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                        </div>
                      )}

                      {showMeetingInput && (
                        <div className="space-y-2 p-3 border border-[#d4af37]/30 rounded-lg bg-[#d4af37]/5">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-semibold text-[#d4af37]">Meeting Details</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setShowMeetingInput(false);
                                setMeetingTitle('');
                                setMeetingDate('');
                                setMeetingTime('');
                                setMeetingEndTime('');
                                setMeetingLink('');
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Label htmlFor="meetingTitle" className="text-xs">Meeting Title</Label>
                          <Input
                            id="meetingTitle"
                            placeholder="e.g., Weekly Gathering"
                            value={meetingTitle}
                            onChange={(e) => setMeetingTitle(e.target.value)}
                            className="text-sm"
                          />
                          <Label htmlFor="meetingDate" className="text-xs">Date</Label>
                          <Input
                            id="meetingDate"
                            type="date"
                            value={meetingDate}
                            onChange={(e) => setMeetingDate(e.target.value)}
                            className="text-sm"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="meetingTime" className="text-xs">Start Time</Label>
                              <Input
                                id="meetingTime"
                                type="time"
                                value={meetingTime}
                                onChange={(e) => setMeetingTime(e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor="meetingEndTime" className="text-xs">End Time</Label>
                              <Input
                                id="meetingEndTime"
                                type="time"
                                value={meetingEndTime}
                                onChange={(e) => setMeetingEndTime(e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <Label htmlFor="meetingLink" className="text-xs">Google Meet Link</Label>
                          <Input
                            id="meetingLink"
                            placeholder="https://meet.google.com/..."
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      )}

                      {showFileInput && (
                        <div className="space-y-2 p-3 border border-[#d4af37]/30 rounded-lg bg-[#d4af37]/5">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-semibold text-[#d4af37]">Attach File</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setShowFileInput(false);
                                setFileUrl('');
                                setFileName('');
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="relative">
                            <input
                              type="file"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSelectedAttachmentFile(file);
                                  setFileName(file.name);
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setFileUrl(ev.target?.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-[#d4af37]/30 rounded-lg hover:bg-[#d4af37]/10 transition-colors">
                              <Upload className="h-6 w-6 text-[#d4af37]/60" />
                              <span className="text-xs text-gray-500">Click to upload file</span>
                            </div>
                          </div>
                          {fileName && (
                            <div className="flex items-center gap-2 p-2 bg-white rounded border border-[#d4af37]/20">
                              <FileText className="h-4 w-4 text-[#d4af37]" />
                              <span className="text-xs truncate flex-1">{fileName}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => { 
                                  setFileUrl(''); 
                                  setFileName(''); 
                                  setSelectedAttachmentFile(null);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        {!showImageInput && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowImageInput(true)}
                            className="w-full"
                          >
                            <ImagePlus className="h-4 w-4 mr-2" />
                            Add Image
                          </Button>
                        )}

                        {!showMeetingInput && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowMeetingInput(true)}
                            className="w-full border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/5"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Add Meeting
                          </Button>
                        )}

                        {!showFileInput && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFileInput(true)}
                            className="w-full border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/5"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Attach File
                          </Button>
                        )}

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={commentsEnabled}
                            onCheckedChange={setCommentsEnabled}
                          />
                          <Label className="text-sm">Enable Comments</Label>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={!newPostContent.trim() || !selectedGroupId}
                          className="w-full"
                        >
                          Post
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                )}

                {/* Upcoming Gatherings */}
                <UpcomingPrayers />

                {/* Group Activity Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Flock Activity</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {groupActivityStats.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No activity yet</p>
                    ) : (
                      groupActivityStats.slice(0, 5).map((stat) => (
                        <div 
                          key={stat.group.id} 
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/flocks/${stat.group.id}`)}
                        >
                          {stat.group.avatar ? (
                            <img 
                              src={stat.group.avatar} 
                              alt={stat.group.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {stat.group.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-semibold text-sm truncate">{stat.group.name}</h4>
                              {stat.recentPosts > 0 && (
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600 shrink-0">
                                  {stat.recentPosts} new
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MessageSquare className="h-3 w-3" />
                              <span>{stat.totalPosts} {stat.totalPosts === 1 ? 'post' : 'posts'}</span>
                            </div>
                            {stat.latestActivity && (
                              <p className="text-xs text-gray-400">
                                Last active: {new Date(stat.latestActivity).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Suggested Groups */}
                {suggestedGroups.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Suggested Flocks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {suggestedGroups.map((group) => (
                        <div key={group.id} className="space-y-2 pb-3 border-b last:border-0 last:pb-0">
                          <div className="flex gap-3">
                            {group.avatar ? (
                              <img 
                                src={group.avatar} 
                                alt={group.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {group.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0 space-y-1">
                              <h4 className="font-semibold text-sm">{group.name}</h4>
                              <p className="text-xs text-gray-600 line-clamp-2">{group.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{group.members.length} members</span>
                                <span>•</span>
                                <span className="capitalize">{group.type}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="w-full"
                            onClick={() => joinGroup(group.id)}
                          >
                            Join Flock
                          </Button>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => navigate('/flocks')}
                      >
                        View More Flocks
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}