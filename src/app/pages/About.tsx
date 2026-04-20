import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, MessageSquare, Shield, BookOpen, Calendar, Heart, ArrowLeft } from 'lucide-react';

const logoImage = 'https://brain-wish-86640978.figma.site/_assets/v11/816644fbd3824115a01caa8d85f8ea2914be6054.png';

export function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black border-b border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 group">
                <div className="h-14 w-14 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:gold-glow">
                  <img src={logoImage} alt="Mission Sagacity Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-3xl font-bold text-white tracking-wide">
                  Mission Sagacity
                </span>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-white hover:text-[#d4af37] hover:bg-black hover:border hover:border-[#d4af37] transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                About Mission Sagacity
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A vibrant community portal where faith meets fellowship, bringing together believers to connect, share, and grow in wisdom.
              </p>
            </div>

            {/* Mission Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Mission Sagacity is dedicated to fostering a thriving spiritual community where members can connect with like-minded individuals, 
                  share their faith journey, and grow together in wisdom and understanding. We believe in creating a safe, moderated space 
                  where meaningful conversations flourish and lasting connections are made.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our platform serves as a digital sanctuary for spiritual growth, community building, and collaborative learning, 
                  empowering members to deepen their faith while supporting one another through life's journey.
                </p>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Community Flocks</h3>
                      <p className="text-sm text-gray-600">
                        Join public or private groups based on your interests. Connect with members who share your spiritual values and participate in meaningful discussions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Interactive Feed</h3>
                      <p className="text-sm text-gray-600">
                        Share updates, post content, and engage with the community through likes, comments, and reactions. Stay connected with what matters most.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Safe & Moderated</h3>
                      <p className="text-sm text-gray-600">
                        All groups require admin approval to ensure quality content and a respectful environment. Your safety and comfort are our priority.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Scheduled Prayers</h3>
                      <p className="text-sm text-gray-600">
                        Schedule and participate in prayer sessions with calendar integration. Join the community in collective prayer and spiritual support.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-6 w-6 text-pink-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Sage Directory</h3>
                      <p className="text-sm text-gray-600">
                        Connect with spiritual leaders, view their content feeds, and support their ministry.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Sage Publications</h3>
                      <p className="text-sm text-gray-600">
                        Explore books and resources from our sages and authors. Grow your faith library.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <Card className="bg-black text-white border border-[#d4af37]/30 shadow-2xl">
              <CardContent className="py-12 text-center space-y-4">
                <h2 className="text-3xl font-bold">Ready to Join Our <span className="gold-text">Community</span>?</h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Become part of a growing community dedicated to spiritual growth, meaningful connections, and shared wisdom.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/')}
                  className="mt-4 bg-black text-[#d4af37] border-2 border-[#d4af37] hover:bg-black hover:text-[#f4e4b0] hover:border-[#f4e4b0] transition-all duration-300"
                >
                  Get Started Today
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}