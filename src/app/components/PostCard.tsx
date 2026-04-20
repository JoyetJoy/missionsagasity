import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useApp, Post as PostType } from '../context/AppContext';
import { Heart, MessageSquare, Share2, Trash2, Calendar, Clock, Video, ExternalLink, Edit2, X, Copy, Check, Sparkles, SkipForward, HandHeart, Download, FileText } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const logoImage = 'https://brain-wish-86640978.figma.site/_assets/v11/816644fbd3824115a01caa8d85f8ea2914be6054.png';

const GLOBAL_GROUP_ID = '__global__';

interface PostCardProps {
  post: PostType;
}

export function PostCard({ post }: PostCardProps) {
  const { currentUser, getUserById, getGroupById, likePost, addComment, updatePost, deletePost, addReaction } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || '');
  const [editMeetingTitle, setEditMeetingTitle] = useState(post.meeting?.title || '');
  const [editMeetingDate, setEditMeetingDate] = useState(post.meeting?.date || '');
  const [editMeetingTime, setEditMeetingTime] = useState(post.meeting?.time || '');
  const [editMeetingLink, setEditMeetingLink] = useState(post.meeting?.meetLink || '');
  const [showEditImageInput, setShowEditImageInput] = useState(!!post.imageUrl);
  const [showEditMeetingInput, setShowEditMeetingInput] = useState(!!post.meeting);
  const [copiedLink, setCopiedLink] = useState(false);

  const author = getUserById(post.authorId);
  const group = getGroupById(post.groupId);
  const isGlobalPost = post.groupId === GLOBAL_GROUP_ID;
  const isUplifted = currentUser ? post.likes.includes(currentUser.id) : false;
  const isInspired = currentUser ? (post.reactions['inspired']?.includes(currentUser.id) ?? false) : false;
  const isNotInspired = currentUser ? (post.reactions['pass']?.includes(currentUser.id) ?? false) : false;
  const isPrayed = currentUser ? (post.reactions['bless']?.includes(currentUser.id) ?? false) : false;
  const isAuthor = currentUser?.id === post.authorId;
  const canDelete = isAuthor || (isGlobalPost && currentUser?.role === 'admin');

  // Check if content is long (more than 300 characters or 5 lines approximately)
  const isLongContent = post.content.length > 300;

  const handleUplift = () => {
    likePost(post.id);
  };

  const handleInspired = () => {
    addReaction(post.id, 'inspired');
  };

  const handleNotInspired = () => {
    addReaction(post.id, 'pass');
  };

  const handlePray = () => {
    addReaction(post.id, 'bless');
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(post.id, commentText);
      setCommentText('');
    }
  };

  const handleDelete = () => {
    deletePost(post.id);
    setShowDeleteDialog(false);
  };

  const handleUpdatePost = () => {
    const updates: Partial<Pick<PostType, 'content' | 'imageUrl' | 'meeting'>> = {
      content: editContent,
      imageUrl: showEditImageInput && editImageUrl ? editImageUrl : undefined,
      meeting: showEditMeetingInput && editMeetingTitle && editMeetingDate && editMeetingTime && editMeetingLink
        ? {
            title: editMeetingTitle,
            date: editMeetingDate,
            time: editMeetingTime,
            meetLink: editMeetingLink,
          }
        : undefined,
    };
    
    updatePost(post.id, updates);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const totalReactions = Object.values(post.reactions).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Card className={`border ${isGlobalPost ? 'border-black/60 bg-gradient-to-br from-white to-gray-50/80 shadow-md' : 'border-[#d4af37]/40'}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          {isGlobalPost ? (
            <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center p-1 ring-2 ring-[#d4af37]/40">
              <img src={logoImage} alt="Mission Sagacity" className="h-full w-full object-contain rounded-full" />
            </div>
          ) : (
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {author ? getInitials(author.name) : '?'}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{isGlobalPost ? 'Mission Sagacity' : (author?.name || 'Unknown User')}</span>
              {isGlobalPost && (
                <Badge className="text-xs bg-black text-white hover:bg-black/80 border-0">
                  Admin
                </Badge>
              )}
              {!isGlobalPost && (
                <>
                  <span className="text-sm text-gray-500">•</span>
                  <Badge variant="outline" className="text-xs border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5">
                    {group?.name || 'Unknown Flock'}
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
          
          {/* Edit and Delete Buttons */}
          {canDelete && (
            <div className="flex gap-1">
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Edit Post</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editContent">Content</Label>
              <Textarea
                id="editContent"
                placeholder="Edit your post content..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {showEditImageInput && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="editImageUrl">Image URL</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEditImageInput(false);
                      setEditImageUrl('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id="editImageUrl"
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                {editImageUrl && (
                  <img
                    src={editImageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                    }}
                  />
                )}
              </div>
            )}

            {!showEditImageInput && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEditImageInput(true)}
              >
                Add Image
              </Button>
            )}

            {showEditMeetingInput && (
              <div className="space-y-3 p-3 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Meeting Details</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEditMeetingInput(false);
                      setEditMeetingTitle('');
                      setEditMeetingDate('');
                      setEditMeetingTime('');
                      setEditMeetingLink('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editMeetingTitle" className="text-xs">Title</Label>
                  <Input
                    id="editMeetingTitle"
                    type="text"
                    value={editMeetingTitle}
                    onChange={(e) => setEditMeetingTitle(e.target.value)}
                    placeholder="e.g., Weekly Team Standup"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="editMeetingDate" className="text-xs">Date</Label>
                    <Input
                      id="editMeetingDate"
                      type="date"
                      value={editMeetingDate}
                      onChange={(e) => setEditMeetingDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="editMeetingTime" className="text-xs">Time</Label>
                    <Input
                      id="editMeetingTime"
                      type="time"
                      value={editMeetingTime}
                      onChange={(e) => setEditMeetingTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="editMeetingLink" className="text-xs">Google Meet Link</Label>
                  <Input
                    id="editMeetingLink"
                    type="text"
                    value={editMeetingLink}
                    onChange={(e) => setEditMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>
            )}

            {!showEditMeetingInput && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEditMeetingInput(true)}
              >
                <Video className="h-4 w-4 mr-2" />
                Add Meeting
              </Button>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={handleUpdatePost}
                disabled={!editContent.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">
            {isLongContent && !isExpanded ? (
              <span>
                {post.content.slice(0, 300) + '...'}
                <Button
                  variant="link"
                  size="sm"
                  className="text-sm"
                  onClick={() => setIsExpanded(true)}
                >
                  Show more
                </Button>
              </span>
            ) : (
              <span>
                {post.content}
                {isExpanded && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-sm"
                    onClick={() => setIsExpanded(false)}
                  >
                    Show less
                  </Button>
                )}
              </span>
            )}
          </p>
        )}

        {!isEditing && post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post content"
            className="rounded-lg w-full object-cover max-h-96"
          />
        )}

        {/* Multiple Images Display */}
        {!isEditing && post.imageUrls && post.imageUrls.length > 0 && (
          <div className={`grid gap-2 ${
            post.imageUrls.length === 1 ? 'grid-cols-1' :
            post.imageUrls.length === 2 ? 'grid-cols-2' :
            post.imageUrls.length === 3 ? 'grid-cols-3' :
            post.imageUrls.length === 4 ? 'grid-cols-2' :
            'grid-cols-3'
          }`}>
            {post.imageUrls.slice(0, 5).map((url, index) => (
              <div 
                key={index} 
                className={`relative overflow-hidden rounded-lg ${
                  post.imageUrls!.length === 3 && index === 0 ? 'col-span-3' :
                  post.imageUrls!.length === 4 && index < 2 ? 'col-span-1' :
                  post.imageUrls!.length >= 5 && index === 0 ? 'col-span-2 row-span-2' :
                  ''
                }`}
              >
                <img
                  src={url}
                  alt={`Post content ${index + 1}`}
                  className="w-full h-full object-cover min-h-[200px] max-h-[400px]"
                />
                {post.imageUrls!.length > 5 && index === 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      +{post.imageUrls!.length - 5}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Meeting Information */}
        {!isEditing && post.meeting && (
          <div className="bg-gradient-to-r from-[#d4af37]/5 to-[#f5d780]/10 border border-[#d4af37]/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-[#d4af37]" />
              <h4 className="font-semibold text-gray-900">{post.meeting.title}</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#d4af37]/70" />
                <span>{new Date(post.meeting.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#d4af37]/70" />
                <span>{post.meeting.time}{post.meeting.endTime ? ` - ${post.meeting.endTime}` : ''}</span>
              </div>
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-gradient-to-r from-[#b8941f] via-[#d4af37] to-[#f5d780] text-black hover:from-[#d4af37] hover:via-[#f5d780] hover:to-[#d4af37]"
              onClick={() => window.open(post.meeting!.meetLink, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Meeting
            </Button>
          </div>
        )}

        {/* File Attachment */}
        {!isEditing && post.fileUrl && post.fileName && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/5">
            <div className="h-10 w-10 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-[#d4af37]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{post.fileName}</p>
              <p className="text-xs text-gray-500">Attached file</p>
            </div>
            <a
              href={post.fileUrl}
              download={post.fileName}
              className="shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outline" size="sm" className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </a>
          </div>
        )}

        {!isEditing && (
          <>
            {/* Reactions Summary */}
            {(post.likes.length > 0 || totalReactions > 0) && (
              <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t flex-wrap">
                {(post.reactions['inspired']?.length ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    {post.reactions['inspired'].length} inspired
                  </span>
                )}
                {(post.reactions['pass']?.length ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <SkipForward className="h-3 w-3 text-gray-500" />
                    {post.reactions['pass'].length} passed
                  </span>
                )}
                {(post.reactions['bless']?.length ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <HandHeart className="h-3 w-3 text-purple-500" />
                    {post.reactions['bless'].length} blessed
                  </span>
                )}
                {post.comments.length > 0 && (
                  <span className="ml-auto">
                    {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                variant={isInspired ? 'default' : 'ghost'}
                size="sm"
                onClick={handleInspired}
                className="flex-1"
              >
                <Sparkles className={`h-4 w-4 mr-2 ${isInspired ? 'fill-current' : ''}`} />
                Inspired
              </Button>

              <Button
                variant={isNotInspired ? 'default' : 'ghost'}
                size="sm"
                onClick={handleNotInspired}
                className="flex-1"
              >
                <SkipForward className={`h-4 w-4 mr-2 ${isNotInspired ? 'fill-current' : ''}`} />
                Pass
              </Button>

              <Button
                variant={isPrayed ? 'default' : 'ghost'}
                size="sm"
                onClick={handlePray}
                className="flex-1"
              >
                <HandHeart className={`h-4 w-4 mr-2 ${isPrayed ? 'fill-current' : ''}`} />
                Bless
              </Button>

              {post.commentsEnabled !== false && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Comment
              </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex-1"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </>
                )}
              </Button>
            </div>

            {/* Comments Section */}
            {post.commentsEnabled !== false && showComments && (
              <div className="space-y-4 pt-4 border-t">
                {post.comments.map((comment) => {
                  const commentAuthor = getUserById(comment.authorId);
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                          {commentAuthor ? getInitials(commentAuthor.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="font-semibold text-sm">{commentAuthor?.name || 'Unknown'}</p>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-3">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                      {currentUser ? getInitials(currentUser.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button type="submit" size="sm" disabled={!commentText.trim()}>
                    Post
                  </Button>
                </form>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and all its comments and reactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}