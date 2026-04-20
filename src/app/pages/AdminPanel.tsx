import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
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
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Check, X, Clock, Users, Lock, Plus, Edit, Trash2, BookOpen, Mail, Phone, ChurchIcon, Shield, UserCog, Eye, Camera, MapPin, Video } from 'lucide-react';
import type { Pastor, User, Group } from '../context/AppContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

export function AdminPanel() {
  const { 
    groups, 
    users, 
    pastors, 
    approveGroup, 
    rejectGroup, 
    updateGroup,
    getUserById, 
    currentUser, 
    createPastor, 
    updatePastor, 
    deletePastor,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
    approvePastorContent,
    rejectPastorContent,
    approvePastorBook,
    rejectPastorBook,
  } = useApp();
  const [mainTab, setMainTab] = useState('groups');
  const [groupTab, setGroupTab] = useState('pending');
  const [isPastorDialogOpen, setIsPastorDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [editingPastor, setEditingPastor] = useState<Pastor | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [pastorForm, setPastorForm] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    church: '',
    photo: '',
    specialties: '',
    yearsOfService: '',
    address: '',
    pincode: '',
    locationLink: '',
    password: '',
  });
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
  });
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewingGroup, setReviewingGroup] = useState<Group | null>(null);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    subtitle: '',
    description: '',
    type: 'public' as 'public' | 'private',
    avatar: '',
  });

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 lined-bg">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400">You don't have permission to view this page</p>
          </div>
        </main>
      </div>
    );
  }

  const pendingGroups = groups.filter((g) => g.status === 'pending');
  const approvedGroups = groups.filter((g) => g.status === 'approved');
  const rejectedGroups = groups.filter((g) => g.status === 'rejected');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handlePastorFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPastorForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePastorFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPastor) {
      updatePastor(editingPastor.id, pastorForm);
    } else {
      createPastor(pastorForm);
    }
    setIsPastorDialogOpen(false);
    setPastorForm({
      name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      church: '',
      photo: '',
      specialties: '',
      yearsOfService: '',
      address: '',
      pincode: '',
      locationLink: '',
      password: '',
    });
    setEditingPastor(null);
  };

  const handleEditPastor = (pastor: Pastor) => {
    setEditingPastor(pastor);
    setPastorForm({
      name: pastor.name || '',
      title: pastor.title || '',
      bio: pastor.bio || '',
      email: pastor.email || '',
      phone: pastor.phone || '',
      church: pastor.church || '',
      photo: pastor.photo || '',
      specialties: Array.isArray(pastor.specialties) ? pastor.specialties.join(', ') : '',
      yearsOfService: pastor.yearsOfService ? String(pastor.yearsOfService) : '',
      address: pastor.address || '',
      pincode: pastor.pincode || '',
      locationLink: pastor.locationLink || '',
      password: '',
    });
    setIsPastorDialogOpen(true);
  };

  const handleDeletePastor = (pastorId: string) => {
    if (confirm('Are you sure you want to delete this sage?')) {
      deletePastor(pastorId);
    }
  };

  const handleAddNewPastor = () => {
    setEditingPastor(null);
    setPastorForm({
      name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      church: '',
      photo: '',
      specialties: '',
      yearsOfService: '',
      address: '',
      pincode: '',
      locationLink: '',
      password: '',
    });
    setIsPastorDialogOpen(true);
  };

  const handleAdminFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdminFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAdmin) {
      updateAdminUser(editingAdmin.id, adminForm);
    } else {
      createAdminUser(adminForm);
    }
    setIsAdminDialogOpen(false);
    setAdminForm({
      name: '',
      email: '',
    });
    setEditingAdmin(null);
  };

  const handleEditAdmin = (admin: User) => {
    setEditingAdmin(admin);
    setAdminForm({
      name: admin.name || '',
      email: admin.email || '',
    });
    setIsAdminDialogOpen(true);
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (confirm('Are you sure you want to delete this admin?')) {
      deleteAdminUser(adminId);
    }
  };

  const handleAddNewAdmin = () => {
    setEditingAdmin(null);
    setAdminForm({
      name: '',
      email: '',
    });
    setIsAdminDialogOpen(true);
  };

  const handleOpenReview = (group: Group) => {
    setReviewingGroup(group);
    setReviewForm({
      name: group.name,
      subtitle: group.subtitle || '',
      description: group.description,
      type: group.type,
      avatar: group.avatar || '',
    });
    setIsReviewDialogOpen(true);
  };

  const handleReviewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setReviewForm((prev) => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAndApprove = () => {
    if (!reviewingGroup) return;
    updateGroup(reviewingGroup.id, {
      name: reviewForm.name,
      subtitle: reviewForm.subtitle,
      description: reviewForm.description,
      type: reviewForm.type,
      avatar: reviewForm.avatar,
    });
    // Small delay to ensure updateGroup processes first
    setTimeout(() => {
      approveGroup(reviewingGroup.id);
    }, 50);
    setIsReviewDialogOpen(false);
    setReviewingGroup(null);
  };

  const handleSaveChanges = () => {
    if (!reviewingGroup) return;
    updateGroup(reviewingGroup.id, {
      name: reviewForm.name,
      subtitle: reviewForm.subtitle,
      description: reviewForm.description,
      type: reviewForm.type,
      avatar: reviewForm.avatar,
    });
    setIsReviewDialogOpen(false);
    setReviewingGroup(null);
  };

  const handleRejectFromReview = () => {
    if (!reviewingGroup) return;
    rejectGroup(reviewingGroup.id);
    setIsReviewDialogOpen(false);
    setReviewingGroup(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 lined-bg">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold dark:text-white">Admin Panel</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage flocks and sages</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{users.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{pendingGroups.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Flocks</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{approvedGroups.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Approved Flocks</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{pastors.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Sages</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={mainTab} onValueChange={setMainTab}>
            <TabsList>
              <TabsTrigger value="groups">Flock Management</TabsTrigger>
              <TabsTrigger value="pastors">Sages Management</TabsTrigger>
              <TabsTrigger value="content">Content Approval</TabsTrigger>
              <TabsTrigger value="admins">Admins Management</TabsTrigger>
            </TabsList>

            {/* Groups Management Tab */}
            <TabsContent value="groups" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Flock Management</CardTitle>
                  <CardDescription>Review and manage flock approval requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={groupTab} onValueChange={setGroupTab}>
                    <TabsList>
                      <TabsTrigger value="pending">
                        Pending ({pendingGroups.length})
                      </TabsTrigger>
                      <TabsTrigger value="approved">
                        Approved ({approvedGroups.length})
                      </TabsTrigger>
                      <TabsTrigger value="rejected">
                        Rejected ({rejectedGroups.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="mt-6">
                      {pendingGroups.length === 0 ? (
                        <div className="py-12 text-center">
                          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">No pending flocks</p>
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Flock Name</TableHead>
                                <TableHead>Creator</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pendingGroups.map((group) => {
                                const creator = getUserById(group.createdBy);
                                return (
                                  <TableRow key={group.id}>
                                    <TableCell>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{group.name}</span>
                                          {group.type === 'private' && (
                                            <Lock className="h-3 w-3 text-gray-500" />
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{group.description}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                                            {creator ? getInitials(creator.name) : '?'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm">
                                          <p className="font-medium">{creator?.name || 'Unknown'}</p>
                                          <p className="text-gray-500 dark:text-gray-400 text-xs">{creator?.email}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="capitalize">{group.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1 text-sm">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>{group.members.length}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex gap-2 justify-end">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleOpenReview(group)}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          Review
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => approveGroup(group.id)}
                                        >
                                          <Check className="h-4 w-4 mr-1" />
                                          Approve
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => rejectGroup(group.id)}
                                        >
                                          <X className="h-4 w-4 mr-1" />
                                          Reject
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="approved" className="mt-6">
                      {approvedGroups.length === 0 ? (
                        <div className="py-12 text-center">
                          <p className="text-gray-500 dark:text-gray-400">No approved flocks</p>
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Flock Name</TableHead>
                                <TableHead>Creator</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {approvedGroups.map((group) => {
                                const creator = getUserById(group.createdBy);
                                return (
                                  <TableRow key={group.id}>
                                    <TableCell>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{group.name}</span>
                                          {group.type === 'private' && (
                                            <Lock className="h-3 w-3 text-gray-500" />
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{group.description}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                                            {creator ? getInitials(creator.name) : '?'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm">
                                          <p className="font-medium">{creator?.name || 'Unknown'}</p>
                                          <p className="text-gray-500 dark:text-gray-400 text-xs">{creator?.email}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="capitalize">{group.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1 text-sm">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>{group.members.length}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="default">Approved</Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="rejected" className="mt-6">
                      {rejectedGroups.length === 0 ? (
                        <div className="py-12 text-center">
                          <p className="text-gray-500 dark:text-gray-400">No rejected flocks</p>
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Flock Name</TableHead>
                                <TableHead>Creator</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rejectedGroups.map((group) => {
                                const creator = getUserById(group.createdBy);
                                return (
                                  <TableRow key={group.id}>
                                    <TableCell>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{group.name}</span>
                                          {group.type === 'private' && (
                                            <Lock className="h-3 w-3 text-gray-500" />
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{group.description}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                                            {creator ? getInitials(creator.name) : '?'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm">
                                          <p className="font-medium">{creator?.name || 'Unknown'}</p>
                                          <p className="text-gray-500 dark:text-gray-400 text-xs">{creator?.email}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="capitalize">{group.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1 text-sm">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>{group.members.length}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="destructive">Rejected</Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pastors Management Tab */}
            <TabsContent value="pastors" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sages Management</CardTitle>
                      <CardDescription>Manage sages' information</CardDescription>
                    </div>
                    <Button onClick={handleAddNewPastor}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {pastors.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No sages added yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleAddNewPastor}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Sage
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sage</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Church</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Books</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pastors.map((pastor) => (
                            <TableRow key={pastor.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={pastor.photo}
                                      alt={`${pastor.name}'s photo`}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                                      {getInitials(pastor.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{pastor.name}</p>
                                    {pastor.specialties && pastor.specialties.length > 0 && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {Array.isArray(pastor.specialties) 
                                          ? pastor.specialties.slice(0, 2).join(', ')
                                          : pastor.specialties
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{pastor.title}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <ChurchIcon className="h-4 w-4 text-gray-500" />
                                  <span>{pastor.church}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                    <Mail className="h-3 w-3" />
                                    <span className="text-xs">{pastor.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                    <Phone className="h-3 w-3" />
                                    <span className="text-xs">{pastor.phone}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <BookOpen className="h-4 w-4 text-gray-500" />
                                  <span>{pastor.yearsOfService} years</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {pastor.books && pastor.books.length > 0 ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {pastor.books.length} {pastor.books.length === 1 ? 'book' : 'books'}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-gray-400">No books</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditPastor(pastor)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeletePastor(pastor.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Approval Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sage Content Approval</CardTitle>
                  <CardDescription>Review and approve books and videos submitted by sages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Pending Books */}
                  {(() => {
                    const pendingBooks = pastors.flatMap(p =>
                      (p.books || [])
                        .filter(b => b.approvalStatus === 'pending')
                        .map(b => ({ ...b, pastorId: p.id, pastorName: p.name }))
                    );
                    const pendingVideos = pastors.flatMap(p =>
                      (p.content || [])
                        .filter(c => c.type === 'video' && c.approvalStatus === 'pending')
                        .map(c => ({ ...c, pastorId: p.id, pastorName: p.name }))
                    );

                    return (
                      <>
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-purple-600" />
                            Pending Books ({pendingBooks.length})
                          </h3>
                          {pendingBooks.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4 text-center">No pending books to review</p>
                          ) : (
                            <div className="space-y-3">
                              {pendingBooks.map((book) => (
                                <div key={book.id} className="flex items-start gap-4 p-4 rounded-lg border bg-orange-50/50 border-orange-200">
                                  {book.coverImage && (
                                    <div className="w-16 h-24 flex-shrink-0 overflow-hidden shadow-sm">
                                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium">{book.title}</p>
                                    <p className="text-sm text-gray-500">by {book.pastorName}</p>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{book.description}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                      {book.category && <span>{book.category}</span>}
                                      <span>${book.price?.toFixed(2)}</span>
                                      {book.pageCount && <span>{book.pageCount} pages</span>}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0">
                                    <Button size="sm" onClick={() => approvePastorBook(book.pastorId, book.id)}>
                                      <Check className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => rejectPastorBook(book.pastorId, book.id)}>
                                      <X className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Video className="h-5 w-5 text-red-600" />
                            Pending Videos ({pendingVideos.length})
                          </h3>
                          {pendingVideos.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4 text-center">No pending videos to review</p>
                          ) : (
                            <div className="space-y-3">
                              {pendingVideos.map((video) => (
                                <div key={video.id} className="flex items-start gap-4 p-4 rounded-lg border bg-orange-50/50 border-orange-200">
                                  {video.thumbnail && (
                                    <div className="w-28 h-16 flex-shrink-0 overflow-hidden shadow-sm bg-gray-900">
                                      <img src={video.thumbnail} alt={video.title || ''} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium">{video.title || 'Untitled Video'}</p>
                                    <p className="text-sm text-gray-500">by {video.pastorName}</p>
                                    {video.description && (
                                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{video.description}</p>
                                    )}
                                    {video.url && (
                                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                                        {video.url}
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0">
                                    <Button size="sm" onClick={() => approvePastorContent(video.pastorId, video.id)}>
                                      <Check className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => rejectPastorContent(video.pastorId, video.id)}>
                                      <X className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admins Management Tab */}
            <TabsContent value="admins" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Admins Management</CardTitle>
                      <CardDescription>Manage admins' information</CardDescription>
                    </div>
                    <Button onClick={handleAddNewAdmin}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {users.filter(user => user.role === 'admin').length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No admins added yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleAddNewAdmin}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Admin
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Admin</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.filter(user => user.role === 'admin').map((admin) => (
                            <TableRow key={admin.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={admin.photo}
                                      alt={`${admin.name}'s photo`}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                                      {getInitials(admin.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{admin.name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                    <Mail className="h-3 w-3" />
                                    <span className="text-xs">{admin.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditAdmin(admin)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteAdmin(admin.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Pastor Dialog */}
      <Dialog open={isPastorDialogOpen} onOpenChange={setIsPastorDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPastor ? 'Edit Sage' : 'Add Sage'}</DialogTitle>
            <DialogDescription>
              {editingPastor ? 'Update the sage\'s information' : 'Enter the sage\'s information'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePastorFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={pastorForm.name}
                onChange={handlePastorFormChange}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={pastorForm.title}
                onChange={handlePastorFormChange}
                placeholder="e.g., Senior Sage"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={pastorForm.email}
                onChange={handlePastorFormChange}
                placeholder="sage@church.com"
                required
              />
            </div>

            {!editingPastor && (
              <div className="space-y-2">
                <Label htmlFor="password">Login Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={pastorForm.password}
                  onChange={handlePastorFormChange}
                  placeholder="Set a login password for this Sage"
                  required={!editingPastor}
                />
                <p className="text-xs text-gray-500">This password will be used by the Sage to log into the portal</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={pastorForm.phone}
                onChange={handlePastorFormChange}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="church">Church *</Label>
              <Input
                id="church"
                name="church"
                value={pastorForm.church}
                onChange={handlePastorFormChange}
                placeholder="e.g., Grace Community Church"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsOfService">Years of Service *</Label>
              <Input
                id="yearsOfService"
                name="yearsOfService"
                type="number"
                value={pastorForm.yearsOfService}
                onChange={handlePastorFormChange}
                placeholder="e.g., 15"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                name="bio"
                value={pastorForm.bio}
                onChange={handlePastorFormChange}
                placeholder="Brief biography..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties</Label>
              <Input
                id="specialties"
                name="specialties"
                value={pastorForm.specialties}
                onChange={handlePastorFormChange}
                placeholder="e.g., Theology, Counseling (comma-separated)"
              />
              <p className="text-xs text-gray-500">Separate multiple specialties with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo URL</Label>
              <Input
                id="photo"
                name="photo"
                type="url"
                value={pastorForm.photo}
                onChange={handlePastorFormChange}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={pastorForm.address}
                onChange={handlePastorFormChange}
                placeholder="e.g., 123 Main St, City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                name="pincode"
                value={pastorForm.pincode}
                onChange={handlePastorFormChange}
                placeholder="e.g., 123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationLink">Location Link</Label>
              <Input
                id="locationLink"
                name="locationLink"
                value={pastorForm.locationLink}
                onChange={handlePastorFormChange}
                placeholder="e.g., https://maps.google.com/..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsPastorDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingPastor ? 'Update Sage' : 'Add Sage'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Group Review & Edit Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Flock Details</DialogTitle>
            <DialogDescription>
              Review and edit flock details before approving or rejecting
            </DialogDescription>
          </DialogHeader>

          {reviewingGroup && (
            <div className="space-y-5">
              {/* Creator Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                    {getUserById(reviewingGroup.createdBy) 
                      ? getInitials(getUserById(reviewingGroup.createdBy)!.name) 
                      : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-500">Submitted by</p>
                  <p className="font-medium">{getUserById(reviewingGroup.createdBy)?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{getUserById(reviewingGroup.createdBy)?.email}</p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {formatDistanceToNow(new Date(reviewingGroup.createdAt), { addSuffix: true })}
                </Badge>
              </div>

              {/* Group Avatar */}
              <div className="space-y-2">
                <Label>Flock Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {reviewForm.avatar ? (
                      <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-[#d4af37]/40">
                        <img
                          src={reviewForm.avatar}
                          alt="Flock avatar"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setReviewForm((prev) => ({ ...prev, avatar: '' }))}
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="review-avatar-upload"
                        className="h-20 w-20 rounded-full border-2 border-dashed border-[#d4af37]/40 flex flex-col items-center justify-center cursor-pointer hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-colors"
                      >
                        <Camera className="h-5 w-5 text-[#d4af37]/60" />
                        <span className="text-[10px] text-gray-500 mt-1">Upload</span>
                      </label>
                    )}
                    <input
                      id="review-avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleReviewAvatarUpload}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Change or add a profile picture</p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-2">
                <Label htmlFor="review-name">Flock Name</Label>
                <Input
                  id="review-name"
                  name="name"
                  value={reviewForm.name}
                  onChange={handleReviewFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-subtitle">Tags / Subtitle</Label>
                <Input
                  id="review-subtitle"
                  name="subtitle"
                  value={reviewForm.subtitle}
                  onChange={handleReviewFormChange}
                  placeholder="Comma-separated tags"
                />
                {reviewForm.subtitle && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {reviewForm.subtitle.split(',').map((tag, i) => tag.trim() && (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-[#d4af37]/30 text-[#b8960c] bg-[#d4af37]/5"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-description">Description</Label>
                <Textarea
                  id="review-description"
                  name="description"
                  value={reviewForm.description}
                  onChange={handleReviewFormChange}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Flock Type</Label>
                <RadioGroup 
                  value={reviewForm.type} 
                  onValueChange={(value) => setReviewForm((prev) => ({ ...prev, type: value as 'public' | 'private' }))}
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2 rounded-md border p-3 flex-1">
                      <RadioGroupItem value="public" id="review-public" />
                      <Label htmlFor="review-public" className="cursor-pointer text-sm">Public</Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-3 flex-1">
                      <RadioGroupItem value="private" id="review-private" />
                      <Label htmlFor="review-private" className="cursor-pointer text-sm">Private</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSaveChanges}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveAndApprove}
                  disabled={!reviewForm.name.trim() || !reviewForm.description.trim()}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Save & Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectFromReview}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Dialog */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAdmin ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
            <DialogDescription>
              {editingAdmin ? 'Update the admin\'s information' : 'Enter the admin\'s information'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={adminForm.name}
                onChange={handleAdminFormChange}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={adminForm.email}
                onChange={handleAdminFormChange}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsAdminDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingAdmin ? 'Update Admin' : 'Add Admin'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}