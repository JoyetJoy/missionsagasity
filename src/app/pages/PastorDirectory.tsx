import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Mail, Phone, ChurchIcon, BookOpen, ArrowRight, Search } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useState } from 'react';

export function PastorDirectory() {
  const { pastors } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Filter pastors based on search query
  const filteredPastors = pastors.filter((pastor) =>
    pastor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 lined-bg">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 dark:text-white">Sage Directory</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Connect with our spiritual leaders and guides
            </p>
          </div>

          {/* Search Bar - Top Right */}
          <div className="w-80 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search sages by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pastors Grid */}
        {filteredPastors.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                {searchQuery ? 'No Sages Found' : 'No Sages Yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery 
                  ? `No sages match "${searchQuery}". Try a different search.`
                  : 'Sage profiles will appear here once they are added by administrators.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPastors.map((pastor) => (
              <Card 
                key={pastor.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate(`/sages/${pastor.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Small Profile Photo */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                      {pastor.photo ? (
                        <ImageWithFallback
                          src={pastor.photo}
                          alt={pastor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-lg bg-blue-600 text-white">
                              {getInitials(pastor.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>

                    {/* Pastor Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="font-bold dark:text-white line-clamp-1">{pastor.name}</h3>
                        {pastor.title && (
                          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium line-clamp-1">{pastor.title}</p>
                        )}
                      </div>

                      {pastor.church && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <ChurchIcon className="h-3 w-3 flex-shrink-0" />
                          <span className="line-clamp-1">{pastor.church}</span>
                        </div>
                      )}

                      {pastor.specialties && pastor.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {pastor.specialties.slice(0, 2).map((specialty, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">
                              {specialty}
                            </Badge>
                          ))}
                          {pastor.specialties.length > 2 && (
                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              +{pastor.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-3 pt-3 border-t dark:border-gray-700">
                    <Button 
                      size="sm" 
                      className="w-full text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/sages/${pastor.id}`);
                      }}
                    >
                      View Profile
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}