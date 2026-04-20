import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { 
  Users, 
  Lock, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  MessageSquare,
  Heart,
  Video,
  ExternalLink,
  Shield,
  User,
  Mail,
  Image as ImageIcon,
  Repeat,
  Search,
  Check,
  X,
  UserPlus,
  Edit3,
  Crown
} from 'lucide-react';
import { PostCard } from '../components/PostCard';

export function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    groups, 
    posts, 
    prayers, 
    users, 
    currentUser, 
    getUserById, 
    joinGroup, 
    leaveGroup,
    requestJoinGroup,
    approveJoinRequest,
    rejectJoinRequest,
    addContentManager,
    removeContentManager,
    canPostInGroup,
  } = useApp();

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const group = groups.find(g => g.id === id);

  // Define all necessary variables
  const isMember = currentUser ? group?.members.includes(currentUser.id) : false;
  const groupPosts = posts.filter(p => p.groupId === id);
  const groupPrayers = prayers.filter(p => p.groupId === id && new Date(p.date) >= new Date());
  const members = users.filter(u => group?.members.includes(u.id));
  const admin = group ? getUserById(group.createdBy) : null;
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      member.email.toLowerCase().includes(memberSearch.toLowerCase())
  );
  const isCreator = currentUser ? group?.createdBy === currentUser.id : false;
  const isAdmin = currentUser?.role === 'admin';
  const joinRequests = group ? (group.joinRequests || []) : [];
  const joinRequestUsers = users.filter((u) => joinRequests.includes(u.id));
  const hasPendingRequest = currentUser ? joinRequests.includes(currentUser.id) : false;
  const userCanPost = id ? canPostInGroup(id) : false;
  const contentManagers = group ? (group.contentManagers || []) : [];

  // Helper functions for prayer formatting
  const formatPrayerDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Morning': 'bg-orange-100 text-orange-700 border-orange-300',
      'Evening': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'Night': 'bg-purple-100 text-purple-700 border-purple-300',
      'Special': 'bg-pink-100 text-pink-700 border-pink-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 lined-bg">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <p className="text-gray-500">Flock not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lined-bg">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/flocks')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Flocks
        </Button>

        {/* Group Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Group Avatar */}
              {group.avatar ? (
                <img 
                  src={group.avatar} 
                  alt={group.name}
                  className="w-32 h-32 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                  {group.name.substring(0, 2).toUpperCase()}
                </div>
              )}

              {/* Group Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{group.name}</h1>
                    {group.type === 'private' && (
                      <Lock className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-lg">{group.description}</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">{group.members.length} members</span>
                  </div>
                  <Badge variant={group.type === 'public' ? 'default' : 'secondary'}>
                    {group.type}
                  </Badge>
                </div>

                {/* Join/Leave Button */}
                {currentUser && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {isMember ? (
                      <Button
                        variant="outline"
                        onClick={() => leaveGroup(group.id)}
                      >
                        Leave Flock
                      </Button>
                    ) : hasPendingRequest ? (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 py-1.5 px-3">
                        <Clock className="h-4 w-4 mr-1" />
                        Join Request Pending
                      </Badge>
                    ) : (
                      <Button onClick={() => requestJoinGroup(group.id)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Request to Join
                      </Button>
                    )}
                    {/* Join Requests Badge for Creator/Admin */}
                    {(isCreator || isAdmin) && joinRequestUsers.length > 0 && (
                      <Button
                        variant="outline"
                        className="border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                        onClick={() => setShowJoinRequestsModal(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {joinRequestUsers.length} Join Request{joinRequestUsers.length > 1 ? 's' : ''}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Feed (3/4 width) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Mobile Only - Quick Access Buttons */}
            <div className="grid grid-cols-2 gap-4 lg:hidden">
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6 pb-6 text-center">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Upcoming Gatherings</h3>
                  <Badge variant="secondary" className="mt-2">
                    {groupPrayers.length}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6 pb-6 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Members</h3>
                  <Badge variant="secondary" className="mt-2">
                    {members.length}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Flock Feed ({groupPosts.length})
                </CardTitle>
              </CardHeader>
            </Card>

            {groupPosts.length > 0 ? (
              groupPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">Be the first to share something with this flock!</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Gatherings & Members (1/4 width) - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* Upcoming Gatherings Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Upcoming Gatherings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupPrayers.length > 0 ? (
                  <>
                    {groupPrayers.slice(0, 3).map((prayer) => {
                      const author = getUserById(prayer.userId);
                      return (
                        <div
                          key={prayer.id}
                          className="p-3 bg-purple-50 rounded-lg border border-purple-100 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-2">
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

                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-3 w-3 text-purple-600" />
                              <span className="font-medium">{formatPrayerDate(prayer.date)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="h-3 w-3 text-purple-600" />
                              <span>{formatTime(prayer.time)}</span>
                            </div>
                          </div>

                          {prayer.meetLink && (
                            <a
                              href={prayer.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1 text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            >
                              <Video className="h-3 w-3" />
                              <span>Join</span>
                            </a>
                          )}
                        </div>
                      );
                    })}
                    {groupPrayers.length > 3 && (
                      <p className="text-xs text-center text-gray-500 pt-2">
                        +{groupPrayers.length - 3} more gatherings
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No upcoming gatherings</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Members Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5 text-blue-600" />
                  Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Admin First */}
                {admin && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      {admin.avatar ? (
                        <img
                          src={admin.avatar}
                          alt={admin.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-700 text-sm font-bold">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {admin.name}
                          </h4>
                          <Shield className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                        </div>
                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                          Admin
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Members */}
                <div className="space-y-2">
                  {filteredMembers
                    .filter((member) => member.id !== group.createdBy)
                    .slice(0, 5)
                    .map((member) => {
                      const isContentMgr = contentManagers.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"
                        >
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <h4 className="font-semibold text-xs text-gray-900 truncate">
                                {member.name}
                              </h4>
                              {isContentMgr && (
                                <Edit3 className="h-3 w-3 text-blue-500 flex-shrink-0" title="Content Manager" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {filteredMembers.length > 6 && (
                  <p className="text-xs text-center text-gray-500 pt-2">
                    +{filteredMembers.length - 6} more members
                  </p>
                )}

                {/* View All Members Button */}
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => {
                    setMemberSearch('');
                    setShowMembersModal(true);
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View All Members
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>

      {/* All Members Modal */}
      <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              All Members ({members.length})
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              View and search for all members in this flock.
            </DialogDescription>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search members by name or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Members Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto pr-2">
            {filteredMembers.length > 0 ? (
              <div className="space-y-2">
                {filteredMembers.map((member) => {
                  const isMemberAdmin = member.id === group.createdBy;
                  const isContentMgr = contentManagers.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:shadow-sm ${
                        isMemberAdmin
                          ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-base text-gray-900 truncate">
                            {member.name}
                          </h4>
                          {isMemberAdmin && (
                            <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                          )}
                          {isContentMgr && !isMemberAdmin && (
                            <Edit3 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isMemberAdmin && (
                          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                            Creator
                          </Badge>
                        )}
                        {isContentMgr && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Content Mgr
                          </Badge>
                        )}
                        {/* Toggle content manager for non-creator members (only creator/admin can toggle) */}
                        {(isCreator || isAdmin) && !isMemberAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => {
                              if (isContentMgr) {
                                removeContentManager(group.id, member.id);
                              } else {
                                addContentManager(group.id, member.id);
                              }
                            }}
                          >
                            {isContentMgr ? (
                              <><X className="h-3 w-3 mr-1" />Remove Posting</>
                            ) : (
                              <><Edit3 className="h-3 w-3 mr-1" />Grant Posting</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No members found</h3>
                <p className="text-gray-600">Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Requests Modal */}
      <Dialog open={showJoinRequestsModal} onOpenChange={setShowJoinRequestsModal}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-yellow-600" />
              Join Requests ({joinRequestUsers.length})
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Review and approve or reject membership requests.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            {joinRequestUsers.length > 0 ? (
              <div className="space-y-3">
                {joinRequestUsers.map((reqUser) => (
                  <div
                    key={reqUser.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50"
                  >
                    {reqUser.avatar ? (
                      <img
                        src={reqUser.avatar}
                        alt={reqUser.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {reqUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {reqUser.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{reqUser.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => approveJoinRequest(group.id, reqUser.id)}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => rejectJoinRequest(group.id, reqUser.id)}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-500">All join requests have been reviewed.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}