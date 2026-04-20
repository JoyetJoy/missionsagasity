import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useApp, Post as PostType } from '../context/AppContext';
import { Calendar, Clock, Video, ExternalLink } from 'lucide-react';

interface SimplifiedPostCardProps {
  post: PostType;
}

export function SimplifiedPostCard({ post }: SimplifiedPostCardProps) {
  const { getUserById, getGroupById } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const author = getUserById(post.authorId);
  const group = getGroupById(post.groupId);

  // Check if content is long (more than 300 characters)
  const isLongContent = post.content.length > 300;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="border-[#d4af37]/40 border">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {author ? getInitials(author.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{author?.name || 'Unknown User'}</span>
              <span className="text-sm text-gray-500">•</span>
              <Badge variant="outline" className="text-xs border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5">
                {group?.name || 'Unknown Group'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post content"
            className="rounded-lg w-full object-cover max-h-96"
          />
        )}

        {/* Multiple Images Display */}
        {post.imageUrls && post.imageUrls.length > 0 && (
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
        {post.meeting && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{post.meeting.title}</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>{new Date(post.meeting.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>{post.meeting.time}</span>
              </div>
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => window.open(post.meeting!.meetLink, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Meeting
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}