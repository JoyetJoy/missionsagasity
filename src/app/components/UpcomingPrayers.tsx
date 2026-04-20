import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, Clock, Users, Repeat, Video, ExternalLink, Edit, Trash2 } from 'lucide-react';

export function UpcomingPrayers() {
  const { prayers, getUserById, getGroupById } = useApp();
  const navigate = useNavigate();
  const [viewingPrayer, setViewingPrayer] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Get upcoming prayers (future date/time)
  const now = new Date();
  const upcomingPrayers = prayers
    .filter((prayer) => {
      const prayerDateTime = new Date(`${prayer.date}T${prayer.time}`);
      return prayerDateTime >= now;
    })
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    })
    .slice(0, 2); // Show only next 2 prayers

  if (upcomingPrayers.length === 0) {
    return null;
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'personal':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'family':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'community':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'gratitude':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'intercession':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatPrayerDate = (date: string) => {
    const prayerDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time portion for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    prayerDate.setHours(0, 0, 0, 0);

    if (prayerDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (prayerDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Calendar className="h-5 w-5 text-indigo-600" />
          </div>
          <CardTitle className="text-lg">Upcoming Gatherings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingPrayers.map((prayer) => {
          const author = getUserById(prayer.userId);
          const group = prayer.groupId ? getGroupById(prayer.groupId) : null;

          return (
            <div
              key={prayer.id}
              className="p-4 bg-white rounded-lg border border-indigo-100 hover:shadow-md transition-shadow cursor-pointer space-y-3"
              onClick={() => {
                setViewingPrayer(prayer.id);
                setIsViewDialogOpen(true);
              }}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                    {prayer.title}
                  </h4>
                  {prayer.category && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs shrink-0 ${getCategoryColor(prayer.category)}`}
                    >
                      {prayer.category}
                    </Badge>
                  )}
                </div>

                {prayer.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {prayer.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="h-3 w-3 text-indigo-600" />
                    <span className="font-medium">{formatPrayerDate(prayer.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-3 w-3 text-indigo-600" />
                    <span>{formatTime(prayer.time)}{prayer.endTime ? ` - ${formatTime(prayer.endTime)}` : ''}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {prayer.isRecurring && (
                    <Badge variant="secondary" className="text-xs">
                      <Repeat className="h-3 w-3 mr-1" />
                      {prayer.recurringPattern}
                    </Badge>
                  )}
                  {group && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {group.name}
                    </Badge>
                  )}
                </div>
              </div>

              {author && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-[10px] font-semibold">
                      {author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-gray-500">
                    By {author.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/prayers')}
        >
          View All Gatherings
        </Button>
      </CardContent>

      {/* Prayer Detail View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {viewingPrayer && prayers.find(p => p.id === viewingPrayer)
                ? prayers.find(p => p.id === viewingPrayer)!.title
                : 'Gathering Details'}
            </DialogTitle>
          </DialogHeader>
          {viewingPrayer && prayers.find(p => p.id === viewingPrayer) && (() => {
            const prayer = prayers.find(p => p.id === viewingPrayer)!;
            const group = prayer.groupId ? getGroupById(prayer.groupId) : null;
            const prayerDate = new Date(prayer.date);
            const author = getUserById(prayer.userId);
            
            return (
              <div className="space-y-4 py-4">
                {/* Prayer Image */}
                {prayer.imageUrl && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={prayer.imageUrl}
                      alt={prayer.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                      }}
                    />
                  </div>
                )}

                {/* Date and Time Info */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-600">Date</div>
                      <div className="font-semibold text-blue-900">
                        {prayerDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-xs text-gray-600">Time</div>
                      <div className="font-semibold text-purple-900">{formatTime(prayer.time)}{prayer.endTime ? ` - ${formatTime(prayer.endTime)}` : ''}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {prayer.description && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Description</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{prayer.description}</p>
                  </div>
                )}

                {/* Category and Recurring Info */}
                <div className="flex flex-wrap gap-2">
                  {prayer.category && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${getCategoryColor(prayer.category)}`}>
                      <span className="text-xs font-medium capitalize">{prayer.category}</span>
                    </div>
                  )}
                  {prayer.isRecurring && (
                    <div className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
                      <Repeat className="h-3 w-3" />
                      <span className="text-xs font-medium">Repeats {prayer.recurringPattern}</span>
                    </div>
                  )}
                </div>

                {/* Author Info */}
                {author && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                      {author.avatar ? (
                        <img 
                          src={author.avatar} 
                          alt={author.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-semibold">
                          {author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-600">Created by</div>
                        <div className="font-semibold text-gray-900">{author.name}</div>
                        <div className="text-xs text-gray-600">{author.email}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Group Info */}
                {group && (
                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex items-center gap-3">
                      {group.avatar ? (
                        <img 
                          src={group.avatar} 
                          alt={group.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                          {group.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-600">Flock Gathering</div>
                        <div className="font-semibold text-green-900">{group.name}</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {group.members.length} members • {group.type}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Google Meet Link */}
                {prayer.meetLink && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Join Meeting</h4>
                    <a
                      href={prayer.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                      <Video className="h-5 w-5" />
                      <span>Join Google Meet</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      navigate('/prayers');
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Go to Gatherings Page
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Card>
  );
}