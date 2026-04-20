import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useApp } from '../context/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Home, Users, LogOut, Shield, Calendar, BookOpen } from 'lucide-react';

const logoImage = 'https://brain-wish-86640978.figma.site/_assets/v11/816644fbd3824115a01caa8d85f8ea2914be6054.png';

export function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();

 const handleLogout = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/users/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', //
    });
    
    if (response.ok) {
      // 
      window.location.reload(); 
    } else {
      console.error('Logout failed');
    }
  } catch (error) {
    console.error('log out failed:', error);
  }
};

  if (!currentUser) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="border-b bg-black/95 border-white/10 sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div onClick={() => navigate('/dashboard')} className="flex items-center gap-3 group cursor-pointer">
            <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:gold-glow">
              <img src={logoImage} alt="Mission Sagacity Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-xl text-white tracking-wide group-hover:gold-text transition-all duration-300">
              MISSION SAGACITY
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-white hover:text-[#d4af37] hover:bg-black hover:border hover:border-[#d4af37] transition-all duration-300">
              <Home className="h-4 w-4 mr-2" />
              Feed
            </Button>
            <Button variant="ghost" onClick={() => navigate('/flocks')} className="text-white hover:text-[#d4af37] hover:bg-black hover:border hover:border-[#d4af37] transition-all duration-300">
              <Users className="h-4 w-4 mr-2" />
              Flocks
            </Button>
            <Button variant="ghost" onClick={() => navigate('/prayers')} className="text-white hover:text-[#d4af37] hover:bg-black hover:border hover:border-[#d4af37] transition-all duration-300">
              <Calendar className="h-4 w-4 mr-2" />
              Gatherings
            </Button>
            <Button variant="ghost" onClick={() => navigate('/sages')} className="text-white hover:text-[#d4af37] hover:bg-black hover:border hover:border-[#d4af37] transition-all duration-300">
              <BookOpen className="h-4 w-4 mr-2" />
              Sages
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p>{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                    {currentUser.role === 'admin' && (
                      <p className="text-xs text-blue-600 font-semibold">Administrator</p>
                    )}
                    {currentUser.role === 'pastor' && (
                      <p className="text-xs text-[#d4af37] font-semibold">Sage</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {currentUser.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                {currentUser.role === 'pastor' && (
                  <DropdownMenuItem onClick={() => navigate('/sage-panel')}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Sage Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}