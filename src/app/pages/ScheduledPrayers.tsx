import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit, Clock, Calendar as CalendarIcon, ImagePlus, Video, X, ExternalLink, Users } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';

export function ScheduledPrayers() {
  const { getUserPrayers, createPrayer, updatePrayer, deletePrayer, getPrayersByDate, getUserGroups, getGroupById } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<string | null>(null);
  const [viewingPrayer, setViewingPrayer] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('09:00');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState<'personal' | 'family' | 'community' | 'gratitude' | 'intercession'>('personal');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [imageUrl, setImageUrl] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [groupId, setGroupId] = useState<string>('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showMeetInput, setShowMeetInput] = useState(false);

  const userPrayers = getUserPrayers();
  const userGroups = getUserGroups();

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selected);
  };

  const handleCreatePrayer = () => {
    if (!title.trim() || !selectedDate) return;

    const prayerData = {
      title,
      description: description || undefined,
      date: formatDate(selectedDate),
      time,
      endTime: endTime || undefined,
      category,
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : undefined,
      imageUrl: imageUrl || undefined,
      meetLink: meetLink || undefined,
      groupId: groupId || undefined,
    };

    if (editingPrayer) {
      updatePrayer(editingPrayer, prayerData);
    } else {
      createPrayer(prayerData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEditPrayer = (prayerId: string) => {
    const prayer = userPrayers.find(p => p.id === prayerId);
    if (!prayer) return;

    setTitle(prayer.title);
    setDescription(prayer.description || '');
    setTime(prayer.time);
    setEndTime(prayer.endTime || '');
    setCategory(prayer.category || 'personal');
    setIsRecurring(prayer.isRecurring || false);
    setRecurringPattern(prayer.recurringPattern || 'daily');
    setImageUrl(prayer.imageUrl || '');
    setMeetLink(prayer.meetLink || '');
    setGroupId(prayer.groupId || '');
    setEditingPrayer(prayerId);
    setIsDialogOpen(true);
  };

  const handleDeletePrayer = (prayerId: string) => {
    if (window.confirm('Are you sure you want to delete this gathering?')) {
      deletePrayer(prayerId);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTime('09:00');
    setEndTime('');
    setCategory('personal');
    setIsRecurring(false);
    setRecurringPattern('daily');
    setImageUrl('');
    setMeetLink('');
    setGroupId('');
    setEditingPrayer(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const renderCalendar = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDay + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const date = isValidDay ? new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber) : null;
      const dateString = date ? formatDate(date) : '';
      const prayersOnDay = isValidDay ? getPrayersByDate(dateString) : [];
      const isSelected = selectedDate && date && formatDate(date) === formatDate(selectedDate);
      const isToday = date && formatDate(date) === formatDate(new Date());

      days.push(
        <div
          key={i}
          className={`min-h-24 border p-2 ${
            isValidDay ? 'bg-white cursor-pointer hover:bg-gray-50' : 'bg-gray-100'
          } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isToday ? 'bg-blue-50' : ''}`}
          onClick={() => isValidDay && handleDateClick(dayNumber)}
        >
          {isValidDay && (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                  {dayNumber}
                </span>
                {prayersOnDay.length > 0 && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                    {prayersOnDay.length}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {prayersOnDay.slice(0, 2).map((prayer) => (
                  <div
                    key={prayer.id}
                    className="text-xs bg-purple-50 border border-purple-200 rounded px-1.5 py-1.5 hover:bg-purple-100 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingPrayer(prayer.id);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <Clock className="h-3 w-3 text-purple-600" />
                      <span className="text-purple-900 font-medium">{prayer.time}{prayer.endTime ? ` - ${prayer.endTime}` : ''}</span>
                    </div>
                    <div className="font-medium text-purple-700 line-clamp-1">{prayer.title}</div>
                    {prayer.description && (
                      <p className="text-[10px] text-gray-600 line-clamp-3 mt-0.5 leading-tight">
                        {prayer.description}
                      </p>
                    )}
                  </div>
                ))}
                {prayersOnDay.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{prayersOnDay.length - 2} more
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDateString = selectedDate ? formatDate(selectedDate) : '';
  const selectedDatePrayers = selectedDate ? getPrayersByDate(selectedDateString) : [];

  return (
    <div className="min-h-screen bg-gray-50 lined-bg">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold dark:text-white">Scheduled Gatherings</h1>
              <p className="text-gray-600 dark:text-gray-400">View and manage gathering schedules</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (!open) handleDialogClose();
              else setIsDialogOpen(true);
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  if (!selectedDate) {
                    setSelectedDate(new Date());
                  }
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Gathering
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>{editingPrayer ? 'Edit Gathering' : 'Schedule New Gathering'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Gathering Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Morning Gathering, Family Blessing"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add any notes or specific prayer requests..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[80px] max-h-[200px] overflow-y-auto resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time">Start Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="gratitude">Gratitude</SelectItem>
                        <SelectItem value="intercession">Intercession</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recurring"
                        checked={isRecurring}
                        onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                      />
                      <Label htmlFor="recurring" className="text-sm cursor-pointer">
                        Make this a recurring gathering
                      </Label>
                    </div>

                    {isRecurring && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="pattern">Repeat</Label>
                        <Select value={recurringPattern} onValueChange={(value: any) => setRecurringPattern(value)}>
                          <SelectTrigger id="pattern">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {selectedDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Scheduled for: <strong>{selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</strong></span>
                    </div>
                  )}

                  {/* Add Photo Section */}
                  {showImageInput && (
                    <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">Add Photo</Label>
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
                      <Input
                        id="imageUrl"
                        placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="text-sm"
                      />
                      {imageUrl && (
                        <div className="relative rounded-lg overflow-hidden border mt-2">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add Google Meet Link Section */}
                  {showMeetInput && (
                    <div className="space-y-2 p-3 border rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">Google Meet Link</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setShowMeetInput(false);
                            setMeetLink('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        id="meetLink"
                        placeholder="https://meet.google.com/..."
                        value={meetLink}
                        onChange={(e) => setMeetLink(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  )}

                  {/* Add Photo and Meet Link Buttons */}
                  {!showImageInput && !showMeetInput && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImageInput(true)}
                        className="flex-1"
                      >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Add Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMeetInput(true)}
                        className="flex-1"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Add Meet Link
                      </Button>
                    </div>
                  )}

                  {showImageInput && !showMeetInput && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMeetInput(true)}
                      className="w-full"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Add Meet Link
                    </Button>
                  )}

                  {/* Add Flock Section */}
                  {userGroups.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="groupId">Flock (Optional)</Label>
                      <Select value={groupId} onValueChange={(value: any) => setGroupId(value)}>
                        <SelectTrigger id="groupId">
                          <SelectValue placeholder="Select a flock" />
                        </SelectTrigger>
                        <SelectContent>
                          {userGroups.map(group => (
                            <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleDialogClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePrayer}
                      disabled={!title.trim() || !selectedDate}
                      className="flex-1"
                    >
                      {editingPrayer ? 'Update' : 'Schedule'} Gathering
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{monthName}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Prayers */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate 
                    ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Select a Date'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  selectedDatePrayers.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDatePrayers.map((prayer) => (
                        <div key={prayer.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{prayer.title}</h4>
                              {prayer.description && (
                                <p className="text-sm text-gray-600 mt-1">{prayer.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditPrayer(prayer.id)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => handleDeletePrayer(prayer.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Display photo if available */}
                          {prayer.imageUrl && (
                            <div className="rounded-lg overflow-hidden border">
                              <img
                                src={prayer.imageUrl}
                                alt={prayer.title}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Display Google Meet link if available */}
                          {prayer.meetLink && (
                            <a
                              href={prayer.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                            >
                              <Video className="h-4 w-4" />
                              <span className="font-medium">Join Google Meet</span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </a>
                          )}
                          
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{prayer.time}{prayer.endTime ? ` - ${prayer.endTime}` : ''}</span>
                            </div>
                            <span className="capitalize px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                              {prayer.category}
                            </span>
                            {prayer.isRecurring && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                {prayer.recurringPattern}
                              </span>
                            )}
                          </div>
                          
                          {/* Display Group if associated */}
                          {prayer.groupId && getGroupById(prayer.groupId) && (
                            <div className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2 py-1.5 rounded-lg border border-green-200">
                              <Users className="h-3.5 w-3.5" />
                              <span className="font-medium">{getGroupById(prayer.groupId)!.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No gatherings scheduled</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Gathering
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Click on a date to view or add gatherings
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Gathering Detail View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {viewingPrayer && userPrayers.find(p => p.id === viewingPrayer)
                ? userPrayers.find(p => p.id === viewingPrayer)!.title
                : 'Gathering Details'}
            </DialogTitle>
          </DialogHeader>
          {viewingPrayer && userPrayers.find(p => p.id === viewingPrayer) && (() => {
            const prayer = userPrayers.find(p => p.id === viewingPrayer)!;
            const group = prayer.groupId ? getGroupById(prayer.groupId) : null;
            const prayerDate = new Date(prayer.date);
            
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
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
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
                      <div className="font-semibold text-purple-900">{prayer.time}{prayer.endTime ? ` - ${prayer.endTime}` : ''}</div>
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
                    <div className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200">
                      <span className="text-xs font-medium capitalize">{prayer.category}</span>
                    </div>
                  )}
                  {prayer.isRecurring && (
                    <div className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
                      <span className="text-xs font-medium">Repeats {prayer.recurringPattern}</span>
                    </div>
                  )}
                </div>

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
                      handleEditPrayer(prayer.id);
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Gathering
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeletePrayer(prayer.id);
                      setIsViewDialogOpen(false);
                    }}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Gathering
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}