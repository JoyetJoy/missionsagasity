import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Users, Lock, Search, Check, Clock, UserPlus, Plus, Info } from 'lucide-react';

export function GroupsPage() {
  const { groups, currentUser, joinGroup, leaveGroup, createGroup, requestJoinGroup } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSubtitle, setGroupSubtitle] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupType, setGroupType] = useState<'public' | 'private'>('public');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const approvedGroups = groups.filter((g) => g.status === 'approved');
  const publicGroups = approvedGroups.filter((g) => g.type === 'public');
  const privateGroups = approvedGroups.filter((g) => g.type === 'private');

  const userGroupIds = currentUser
    ? approvedGroups.filter((g) => g.members.includes(currentUser.id)).map((g) => g.id)
    : [];

  const filterGroups = (groupList: typeof groups) => {
    if (!searchQuery) return groupList;
    return groupList.filter(
      (g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const GroupCard = ({ group }: { group: typeof groups[0] }) => {
    const isMember = userGroupIds.includes(group.id);
    const hasPendingRequest = currentUser ? (group.joinRequests || []).includes(currentUser.id) : false;
    const subtitleTags = group.subtitle ? group.subtitle.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    // Get first 2 sentences of description
    const getShortDescription = (desc: string) => {
      const sentences = desc.match(/[^.!?]+[.!?]+/g) || [desc];
      return sentences.slice(0, 2).join(' ').trim();
    };

    return (
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/flocks/${group.id}`)}>
        <CardHeader>
          <div className="flex items-start gap-4">
            {group.avatar ? (
              <img 
                src={group.avatar} 
                alt={group.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                {group.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{group.name}</CardTitle>
                {group.type === 'private' && (
                  <Lock className="h-4 w-4 text-gray-500" />
                )}
              </div>
              {subtitleTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subtitleTags.map((tag, idx) => (
                    <span key={idx} className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#a08520] border border-[#d4af37]/30">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 line-clamp-2">{getShortDescription(group.description)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{group.members.length} members</span>
              </div>
              <Badge variant={group.type === 'public' ? 'default' : 'secondary'}>
                {group.type}
              </Badge>
            </div>

            {isMember ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Joined
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    leaveGroup(group.id);
                  }}
                >
                  Leave
                </Button>
              </div>
            ) : hasPendingRequest ? (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            ) : (
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  requestJoinGroup(group.id);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Request to Join
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim() || !groupDescription.trim()) {
      return;
    }

    createGroup({
      name: groupName,
      description: groupDescription,
      type: groupType,
      createdBy: currentUser!.id,
      subtitle: groupSubtitle,
    });

    // Reset form and close dialog
    setGroupName('');
    setGroupSubtitle('');
    setGroupDescription('');
    setGroupType('public');
    setIsCreateDialogOpen(false);
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 lined-bg">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold dark:text-white">Flocks</h1>
              <p className="text-gray-600 dark:text-gray-400">Discover and join communities</p>
            </div>
            
            {/* Create Group Button */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Flock
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create a New Flock</DialogTitle>
                  <DialogDescription>
                    Start your own community and connect with others
                  </DialogDescription>
                </DialogHeader>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    New flocks require admin approval before going live.
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Flock Name</Label>
                    <Input
                      id="groupName"
                      placeholder="e.g., Photography Enthusiasts"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupSubtitle">Tags / Subtitle</Label>
                    <Input
                      id="groupSubtitle"
                      placeholder="e.g., Photography, Landscape, Portrait (comma separated)"
                      value={groupSubtitle}
                      onChange={(e) => setGroupSubtitle(e.target.value)}
                    />
                    <p className="text-xs text-gray-400">Enter multiple tags separated by commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Description</Label>
                    <Textarea
                      id="groupDescription"
                      placeholder="Describe what your group is about..."
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Flock Type</Label>
                    <RadioGroup value={groupType} onValueChange={(value) => setGroupType(value as 'public' | 'private')}>
                      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
                        <RadioGroupItem value="public" id="public" />
                        <div className="space-y-1 leading-none">
                          <Label htmlFor="public" className="cursor-pointer font-medium">
                            Public
                          </Label>
                          <p className="text-sm text-gray-500">
                            Anyone can see and join this flock
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
                        <RadioGroupItem value="private" id="private" />
                        <div className="space-y-1 leading-none">
                          <Label htmlFor="private" className="cursor-pointer font-medium">
                            Private
                          </Label>
                          <p className="text-sm text-gray-500">
                            Only members can see content
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={!groupName.trim() || !groupDescription.trim()}
                      className="flex-1"
                    >
                      Submit for Approval
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Success Message */}
          {showSuccessMessage && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Flock submitted for approval! You'll be notified once it's reviewed.
              </AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search flocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Flocks</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
              <TabsTrigger value="my-groups">My Flocks</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {filterGroups(approvedGroups).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">No flocks found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filterGroups(approvedGroups).map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="public" className="space-y-4 mt-6">
              {filterGroups(publicGroups).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">No public flocks found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filterGroups(publicGroups).map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="private" className="space-y-4 mt-6">
              {filterGroups(privateGroups).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">No private flocks found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filterGroups(privateGroups).map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-groups" className="space-y-4 mt-6">
              {approvedGroups.filter((g) => userGroupIds.includes(g.id)).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">You haven't joined any flocks yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {approvedGroups
                    .filter((g) => userGroupIds.includes(g.id))
                    .map((group) => <GroupCard key={group.id} group={group} />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}