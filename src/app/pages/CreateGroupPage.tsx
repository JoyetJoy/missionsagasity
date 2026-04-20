import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Info, Camera, X } from 'lucide-react';

export function CreateGroupPage() {
  const navigate = useNavigate();
  const { createGroup, currentUser } = useApp();
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');
  const [avatar, setAvatar] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }
    setSelectedAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) return;

    createGroup({
      name,
      subtitle,
      description,
      type,
      createdBy: currentUser!.id,
    }, selectedAvatarFile || undefined);

    setSubmitted(true);
    
    setTimeout(() => {
      navigate('/flocks');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 lined-bg">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <Info className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Flock Submitted for Approval</h2>
                  <p className="text-gray-600">
                    Your flock has been submitted and is awaiting admin approval. You'll be notified once it's reviewed.
                  </p>
                  <p className="text-sm text-gray-500">Redirecting to flocks page...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lined-bg">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold dark:text-white">Create a Flock</h1>
            <p className="text-gray-600 dark:text-gray-400">Start your own community and connect with others</p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              New flocks require admin approval before going live. You'll be able to post once your flock is approved.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Flock Details</CardTitle>
              <CardDescription>Provide information about your flock</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="space-y-2">
                  <Label>Flock Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {avatar ? (
                        <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-[#d4af37]/40">
                          <img
                            src={avatar}
                            alt="Flock avatar"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => { setAvatar(''); setSelectedAvatarFile(null); }}
                            className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="avatar-upload"
                          className="h-24 w-24 rounded-full border-2 border-dashed border-[#d4af37]/40 flex flex-col items-center justify-center cursor-pointer hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-colors"
                        >
                          <Camera className="h-6 w-6 text-[#d4af37]/60" />
                          <span className="text-xs text-gray-500 mt-1">Upload</span>
                        </label>
                      )}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Upload a profile picture for your flock</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Flock Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Photography Enthusiasts"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Tags / Subtitle</Label>
                  <Input
                    id="subtitle"
                    placeholder="e.g., Photography, Landscape, Portrait (comma separated)"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                  />
                  <p className="text-xs text-gray-400">Enter multiple tags separated by commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your flock is about..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Flock Type</Label>
                  <RadioGroup value={type} onValueChange={(value) => setType(value as 'public' | 'private')}>
                    <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                      <RadioGroupItem value="public" id="public" />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="public" className="cursor-pointer">
                          Public
                        </Label>
                        <p className="text-sm text-gray-500">
                          Anyone can see and join this flock
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                      <RadioGroupItem value="private" id="private" />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="private" className="cursor-pointer">
                          Private
                        </Label>
                        <p className="text-sm text-gray-500">
                          Only members can see content and join by invitation
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={!name.trim() || !description.trim()}>
                    Submit for Approval
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/flocks')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}