import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from '../context/AppContext';
import { SimplifiedPostCard } from './SimplifiedPostCard';
import { Shield, User, BookOpen, ChevronDown, X, Book, Check } from 'lucide-react';
import { api } from '../context/api';

const logoImage = 'https://brain-wish-86640978.figma.site/_assets/v11/816644fbd3824115a01caa8d85f8ea2914be6054.png';

import { GoldSparklesBackground } from './GoldSparklesBackground';

const MARQUEE_VERSES = [
  "FOR GOD SO LOVED THE WORLD THAT HE GAVE HIS ONE AND ONLY SON — JOHN 3:16",
  "THE LORD IS MY SHEPHERD I SHALL NOT WANT — PSALM 23:1",
  "I CAN DO ALL THINGS THROUGH CHRIST WHO STRENGTHENS ME — PHILIPPIANS 4:13",
  "TRUST IN THE LORD WITH ALL YOUR HEART — PROVERBS 3:5",
  "BE STRONG AND COURAGEOUS DO NOT BE AFRAID — JOSHUA 1:9",
  "THE LORD IS MY LIGHT AND MY SALVATION — PSALM 27:1",
  "BUT THOSE WHO HOPE IN THE LORD WILL RENEW THEIR STRENGTH — ISAIAH 40:31",
  "FOR I KNOW THE PLANS I HAVE FOR YOU DECLARES THE LORD — JEREMIAH 29:11",
  "THE GRACE OF THE LORD JESUS CHRIST BE WITH YOUR SPIRIT — PHILIPPIANS 4:23",
  "HE HAS MADE EVERYTHING BEAUTIFUL IN ITS TIME — ECCLESIASTES 3:11",
  "IN THE BEGINNING WAS THE WORD AND THE WORD WAS WITH GOD — JOHN 1:1",
  "BLESSED ARE THE PEACEMAKERS FOR THEY SHALL BE CALLED CHILDREN OF GOD — MATTHEW 5:9",
];

const FEED_VERSES = [
  { text: "For where two or three gather in my name, there am I with them.", ref: "Matthew 18:20" },
  { text: "Iron sharpens iron, and one man sharpens another.", ref: "Proverbs 27:17" },
  { text: "And let us consider how we may spur one another on toward love and good deeds.", ref: "Hebrews 10:24" },
  { text: "Bear one another's burdens, and so fulfill the law of Christ.", ref: "Galatians 6:2" },
  { text: "A friend loves at all times, and a brother is born for a time of adversity.", ref: "Proverbs 17:17" },
  { text: "How good and pleasant it is when God's people live together in unity!", ref: "Psalm 133:1" },
  { text: "Therefore encourage one another and build each other up.", ref: "1 Thessalonians 5:11" },
  { text: "Love is patient, love is kind. It does not envy, it does not boast.", ref: "1 Corinthians 13:4" },
  { text: "Do nothing out of selfish ambition, but in humility value others above yourselves.", ref: "Philippians 2:3" },
  { text: "Above all, love each other deeply, because love covers over a multitude of sins.", ref: "1 Peter 4:8" },
  { text: "Be completely humble and gentle; be patient, bearing with one another in love.", ref: "Ephesians 4:2" },
  { text: "Let the word of Christ dwell among you richly as you teach and admonish one another.", ref: "Colossians 3:16" },
  { text: "Rejoice with those who rejoice; mourn with those who mourn.", ref: "Romans 12:15" },
  { text: "Two are better than one, because they have a good return for their labor.", ref: "Ecclesiastes 4:9" },
  { text: "The Lord bless you and keep you; the Lord make his face shine on you.", ref: "Numbers 6:24-25" },
];

export function LandingPage() {
  const navigate = useNavigate();
  // ✅ FIX: Using login() and signup() from AppContext so currentUser gets set properly
  // This ensures Navbar renders correctly after login/signup
  const { login, signup, posts, groups } = useApp();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupPincode, setSignupPincode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [error, setError] = useState('');
  const [showBibleModal, setShowBibleModal] = useState(false);
  const [signInGold, setSignInGold] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [logoFlightVisible, setLogoFlightVisible] = useState(true);
  const [flightPath, setFlightPath] = useState('');
  const [sparklePos, setSparklePos] = useState({ x: 0, y: 0 });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSentCount, setOtpSentCount] = useState(0);

  const logoRef = useRef<HTMLDivElement>(null);
  const bibleCardRef = useRef<HTMLDivElement>(null);
  const signInBtnRef = useRef<HTMLButtonElement>(null);

  const ANGEL_DURATION = 12000;

  useEffect(() => {
    const buildPath = () => {
      const logoEl = logoRef.current;
      const bibleEl = bibleCardRef.current;
      const btnEl = signInBtnRef.current;
      if (!logoEl || !bibleEl || !btnEl) return;

      const logoRect = logoEl.getBoundingClientRect();
      const bibleRect = bibleEl.getBoundingClientRect();
      const btnRect = btnEl.getBoundingClientRect();

      const sx = logoRect.left + logoRect.width / 2;
      const sy = logoRect.top + logoRect.height / 2;
      const bx = bibleRect.left + bibleRect.width / 2;
      const by = bibleRect.top + bibleRect.height / 2;
      const orbitRx = bibleRect.width / 2 + 30;
      const orbitRy = bibleRect.height / 2 + 20;
      const ex = btnRect.left + btnRect.width / 2;
      const ey = btnRect.top + btnRect.height / 2;
      const mx = (sx + (bx - orbitRx)) / 2;
      const my = sy - 40;
      const entryX = bx - orbitRx;
      const entryY = by;
      const orbitRight = { x: bx + orbitRx, y: by };
      const orbitBottom = { x: bx, y: by + orbitRy };
      const exitX = orbitBottom.x;
      const exitY = orbitBottom.y;

      const path = [
        `M ${sx} ${sy}`,
        `Q ${mx} ${my}, ${entryX} ${entryY}`,
        `A ${orbitRx} ${orbitRy} 0 0 1 ${orbitRight.x} ${orbitRight.y}`,
        `A ${orbitRx} ${orbitRy} 0 0 1 ${entryX} ${entryY}`,
        `A ${orbitRx} ${orbitRy} 0 0 1 ${exitX} ${exitY}`,
        `Q ${(exitX + ex) / 2} ${(exitY + ey) / 2 + 20}, ${ex} ${ey}`,
      ].join(' ');

      setFlightPath(path);
      setSparklePos({ x: ex, y: ey });
    };

    const timer = setTimeout(buildPath, 100);
    window.addEventListener('resize', buildPath);
    return () => { clearTimeout(timer); window.removeEventListener('resize', buildPath); };
  }, []);

  useEffect(() => {
    if (!flightPath) return;
    const hideTimer = setTimeout(() => {
      setLogoFlightVisible(false);
      setShowSparkles(true);
      setSignInGold(true);
    }, ANGEL_DURATION);
    const cleanSparkles = setTimeout(() => setShowSparkles(false), ANGEL_DURATION + 900);
    return () => { clearTimeout(hideTimer); clearTimeout(cleanSparkles); };
  }, [flightPath]);

  const sparkles = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * 360;
      const dist = 30 + Math.random() * 50;
      const sx = Math.cos((angle * Math.PI) / 180) * dist;
      const sy = Math.sin((angle * Math.PI) / 180) * dist;
      const size = 3 + Math.random() * 5;
      const delay = Math.random() * 0.3;
      return { sx, sy, size, delay, id: i };
    });
  }, []);

  const marqueeVerse = useMemo(() => MARQUEE_VERSES[Math.floor(Math.random() * MARQUEE_VERSES.length)], []);
  const feedVerse = useMemo(() => FEED_VERSES[Math.floor(Math.random() * FEED_VERSES.length)], []);

  const recentPosts = posts
    .filter((post) => {
      const group = groups.find((g) => g.id === post.groupId);
      return group && group.status === 'approved' && group.type === 'public';
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // ✅ FIX: handleLogin uses AppContext login() which calls the API AND sets currentUser
  // This is what makes the Navbar appear after login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ✅ FIX: handleQuickLogin uses AppContext login() so currentUser gets set
  const handleQuickLogin = async (email: string) => {
    setError('');
    setIsLoggingIn(true);
    try {
      const success = await login(email, 'password123');
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Quick login failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (!signupPhone || signupPhone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setIsSendingOtp(true);
    try {
      const cleanCode = countryCode.replace('+', '');
      await api.sendOtp(signupPhone, cleanCode);
      setOtpSent(true);
      setResendTimer(30); // 30 seconds cooldown
      setOtpSentCount(prev => prev + 1);
      if (otpSent) {
        // If it was already sent, this is a resend
        setError(''); // Clear previous errors
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length < 4) {
      setError('Please enter the 4-6 digit OTP sent to your phone');
      return;
    }
    setError('');
    setIsVerifyingOtp(true);
    try {
      const cleanCode = countryCode.replace('+', '');
      await api.verifyOtp(signupPhone, cleanCode, otpValue);
      setOtpVerified(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ✅ FIX: handleSignup uses AppContext signup() which calls the API AND sets currentUser
  // This is what makes the Navbar appear after signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signupName || !signupPhone || !signupPincode || !signupPassword) {
      setError('Name, Phone, Pincode, and Password are required');
      return;
    }
    if (!otpVerified) {
      setError('Please verify your phone number with OTP');
      return;
    }

    setIsSigningUp(true);
    try {
      const success = await signup({
        name: signupName,
        email: signupEmail || undefined,
        password: signupPassword,
        phone: `${countryCode}${signupPhone}`,
        address: signupAddress || undefined,
        pincode: signupPincode,
      });
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Phone number or email already exists.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden relative">
      <GoldSparklesBackground />

      {logoFlightVisible && flightPath && (
        <div
          className="fixed z-[60] pointer-events-none"
          style={{
            offsetPath: `path('${flightPath}')`,
            offsetRotate: '0deg',
            animation: `flyAngel ${ANGEL_DURATION}ms linear forwards`,
            filter: 'drop-shadow(0 0 18px rgba(212,175,55,0.6))',
          }}
        >
          <div className="relative flex items-center justify-center" style={{ width: 56, height: 56 }}>
            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, rgba(212,175,55,0.15) 50%, transparent 70%)', animation: 'starTwinkle 1.5s ease-in-out infinite' }} />
            <img src={logoImage} alt="" className="w-12 h-12 rounded-full object-contain relative z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.5))' }} />
            <div className="absolute inset-0 rounded-full border-2 border-[#d4af37]/40" style={{ animation: 'starTwinkle 2s ease-in-out infinite 0.5s' }} />
          </div>
        </div>
      )}

      {showSparkles && (
        <div className="fixed z-[70] pointer-events-none" style={{ top: sparklePos.y, left: sparklePos.x, transform: 'translate(-50%, -50%)' }}>
          {sparkles.map((s) => (
            <div key={s.id} className="absolute rounded-full" style={{ width: s.size, height: s.size, background: 'radial-gradient(circle, #f5d780, #d4af37)', boxShadow: '0 0 6px 2px rgba(212,175,55,0.6)', animation: `sparkle 0.8s ${s.delay}s ease-out forwards`, '--sx': `${s.sx}px`, '--sy': `${s.sy}px`, left: 0, top: 0 } as React.CSSProperties} />
          ))}
          <div className="absolute rounded-full" style={{ width: 40, height: 40, left: -20, top: -20, animation: 'sparkleGlow 0.8s ease-out forwards', background: 'radial-gradient(circle, rgba(212,175,55,0.3), transparent)' }} />
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="bg-black border-b border-white/10 sticky top-0 z-50 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
            <div className="absolute top-0 left-0 w-full overflow-hidden whitespace-nowrap">
              <div className="inline-block animate-[marqueeLeft_60s_linear_infinite]">
                <span className="text-[#d4af37]/[0.15] text-2xl tracking-[0.3em] uppercase font-bold">{marqueeVerse} &nbsp; &#10022; &nbsp; {marqueeVerse} &nbsp; &#10022; &nbsp; {marqueeVerse} &nbsp; &#10022; &nbsp;</span>
                <span className="text-[#d4af37]/[0.15] text-2xl tracking-[0.3em] uppercase font-bold">{marqueeVerse} &nbsp; &#10022; &nbsp; {marqueeVerse} &nbsp; &#10022; &nbsp; {marqueeVerse} &nbsp; &#10022; &nbsp;</span>
              </div>
            </div>
            <div className="absolute top-8 left-0 w-full overflow-hidden whitespace-nowrap">
              <div className="inline-block animate-[marqueeRight_70s_linear_infinite]">
                <span className="text-[#f5d780]/[0.12] text-xl tracking-[0.4em] uppercase font-semibold">{marqueeVerse} &nbsp; &#9769; &nbsp; {marqueeVerse} &nbsp; &#9769; &nbsp; {marqueeVerse} &nbsp; &#9769; &nbsp;</span>
                <span className="text-[#f5d780]/[0.12] text-xl tracking-[0.4em] uppercase font-semibold">{marqueeVerse} &nbsp; &#9769; &nbsp; {marqueeVerse} &nbsp; &#9769; &nbsp; {marqueeVerse} &nbsp; &#9769; &nbsp;</span>
              </div>
            </div>
            <div className="absolute bottom-6 left-0 w-full overflow-hidden whitespace-nowrap">
              <div className="inline-block animate-[marqueeLeft_80s_linear_infinite]">
                <span className="text-[#d4af37]/[0.10] text-3xl tracking-[0.2em] uppercase font-black">{marqueeVerse} &nbsp; &#10013; &nbsp; {marqueeVerse} &nbsp; &#10013; &nbsp; {marqueeVerse} &nbsp; &#10013; &nbsp;</span>
                <span className="text-[#d4af37]/[0.10] text-3xl tracking-[0.2em] uppercase font-black">{marqueeVerse} &nbsp; &#10013; &nbsp; {marqueeVerse} &nbsp; &#10013; &nbsp; {marqueeVerse} &nbsp; &#10013; &nbsp;</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full overflow-hidden whitespace-nowrap">
              <div className="inline-block animate-[marqueeRight_55s_linear_infinite]">
                <span className="text-[#f5d780]/[0.13] text-lg tracking-[0.5em] uppercase font-bold">{marqueeVerse} &nbsp; &#9670; &nbsp; {marqueeVerse} &nbsp; &#9670; &nbsp; {marqueeVerse} &nbsp; &#9670; &nbsp;</span>
                <span className="text-[#f5d780]/[0.13] text-lg tracking-[0.5em] uppercase font-bold">{marqueeVerse} &nbsp; &#9670; &nbsp; {marqueeVerse} &nbsp; &#9670; &nbsp; {marqueeVerse} &nbsp; &#9670; &nbsp;</span>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 group">
                <div className="h-14 w-14 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:gold-glow" ref={logoRef}>
                  <img src={logoImage} alt="Mission Sagacity Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-3xl font-bold text-white tracking-wide">Mission Sagacity</span>
              </div>
              <Button variant="outline" onClick={() => navigate('/about')} className="border-[#d4af37] bg-black text-white hover:bg-black hover:text-[#d4af37] hover:border-[#d4af37] transition-all duration-300">
                About
              </Button>
            </div>
          </div>
        </header>

        {/* Gold border */}
        <div className="relative h-[3px] w-full shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-[#d4af37]" />
          <div className="absolute left-1/4 top-0 h-full w-24 bg-gradient-to-r from-[#d4af37] to-[#f5d780] blur-[1px]" />
          <div className="absolute right-1/3 top-0 h-full w-16 bg-gradient-to-r from-[#f5d780] to-[#d4af37] blur-[1px]" />
          <div className="absolute left-1/2 top-0 h-full w-20 bg-[#f5d780] blur-[0.5px] opacity-60" />
        </div>

        <main className="flex-1 overflow-y-auto hide-scrollbar lg:overflow-hidden">
          <div className="container mx-auto px-4 h-auto lg:h-full">
            <div className="flex flex-col lg:grid lg:grid-cols-[3fr_2fr] gap-8 items-start lg:h-full">

              {/* Sign-in card */}
              <div className="order-1 lg:order-2 pt-8 lg:py-8 w-full flex justify-center lg:justify-end lg:h-full lg:overflow-y-auto hide-scrollbar">
                <div className="w-full max-w-md self-start space-y-4 pb-8">

                  {/* Holy Bible Card */}
                  <div ref={bibleCardRef}>
                    <Card className="w-full max-w-md border-[#d4af37] border bg-gradient-to-br from-black to-gray-900 text-white cursor-pointer hover:shadow-lg hover:shadow-[#d4af37]/10 transition-all duration-300" onClick={() => setShowBibleModal(true)}>
                      <CardContent className="py-4 px-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center shrink-0">
                          <Book className="h-6 w-6 text-[#d4af37]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#d4af37] tracking-wide uppercase">Holy Bible</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Read the Holy Bible online</p>
                        </div>
                        <BookOpen className="h-5 w-5 text-[#d4af37] shrink-0" />
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="w-full max-w-md border-[#d4af37] border-2">
                    <CardHeader>
                      <CardTitle>Welcome</CardTitle>
                      <CardDescription>Sign in to your account or create a new one</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="login">Login</TabsTrigger>
                          <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                          <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="login-email">Email</Label>
                              <Input id="login-email" type="email" placeholder="your@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="login-password">Password</Label>
                              <Input id="login-password" type="password" placeholder="Enter password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <div className="relative">
                              <Button
                                ref={signInBtnRef}
                                type="submit"
                                disabled={isLoggingIn}
                                className={`w-full transition-all duration-700 ${signInGold ? 'bg-gradient-to-r from-[#b8941f] via-[#d4af37] to-[#f5d780] text-black border-[#d4af37] hover:from-[#d4af37] hover:via-[#f5d780] hover:to-[#d4af37]' : ''}`}
                                style={signInGold ? { animation: 'btnGoldFlash 1s ease-out forwards' } : undefined}
                              >
                                {isLoggingIn ? 'Signing In...' : 'Sign In'}
                              </Button>
                            </div>

                            {/* Quick Demo Login */}
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2.5">
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Quick Demo Login</p>
                              <div className="grid grid-cols-3 gap-2">
                                <button type="button" onClick={() => handleQuickLogin('admin@sagacity.com')} className="flex flex-col items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-2.5 text-center transition-all hover:border-[#d4af37] hover:shadow-sm group cursor-pointer">
                                  <Shield className="h-5 w-5 text-blue-600 group-hover:text-[#d4af37] transition-colors" />
                                  <span className="text-xs font-medium text-gray-800">Admin</span>
                                  <span className="text-[10px] text-gray-400 leading-tight">admin@sagacity.com</span>
                                </button>
                                <button type="button" onClick={() => handleQuickLogin('john@example.com')} className="flex flex-col items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-2.5 text-center transition-all hover:border-[#d4af37] hover:shadow-sm group cursor-pointer">
                                  <User className="h-5 w-5 text-green-600 group-hover:text-[#d4af37] transition-colors" />
                                  <span className="text-xs font-medium text-gray-800">User</span>
                                  <span className="text-[10px] text-gray-400 leading-tight">john@example.com</span>
                                </button>
                                <button type="button" onClick={() => handleQuickLogin('pastor.john@church.org')} className="flex flex-col items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-2.5 text-center transition-all hover:border-[#d4af37] hover:shadow-sm group cursor-pointer">
                                  <BookOpen className="h-5 w-5 text-purple-600 group-hover:text-[#d4af37] transition-colors" />
                                  <span className="text-xs font-medium text-gray-800">Sage</span>
                                  <span className="text-[10px] text-gray-400 leading-tight">pastor.john@church.org</span>
                                </button>
                              </div>
                              <p className="text-[10px] text-gray-400 text-center">Click any role above to sign in instantly</p>
                            </div>
                          </form>
                        </TabsContent>

                        <TabsContent value="signup">
                          <form onSubmit={handleSignup} className="space-y-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="signup-name">Full Name <span className="text-red-500">*</span></Label>
                              <Input id="signup-name" type="text" placeholder="John Doe" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="signup-phone">Phone Number <span className="text-red-500">*</span></Label>
                              <div className="flex gap-2">
                                <select value={countryCode} onChange={(e) => { setCountryCode(e.target.value); setOtpSent(false); setOtpVerified(false); setOtpValue(''); }} className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/10 shrink-0 w-[80px] cursor-pointer">
                                  <option value="+91">🇮🇳 +91</option>
                                  <option value="+1">🇺🇸 +1</option>
                                  <option value="+44">🇬🇧 +44</option>
                                  <option value="+61">🇦🇺 +61</option>
                                  <option value="+971">🇦🇪 +971</option>
                                  <option value="+966">🇸🇦 +966</option>
                                  <option value="+65">🇸🇬 +65</option>
                                  <option value="+60">🇲🇾 +60</option>
                                  <option value="+974">🇶🇦 +974</option>
                                  <option value="+968">🇴🇲 +968</option>
                                  <option value="+973">🇧🇭 +973</option>
                                  <option value="+965">🇰🇼 +965</option>
                                  <option value="+49">🇩🇪 +49</option>
                                  <option value="+33">🇫🇷 +33</option>
                                  <option value="+81">🇯🇵 +81</option>
                                  <option value="+86">🇨🇳 +86</option>
                                  <option value="+82">🇰🇷 +82</option>
                                  <option value="+55">🇧🇷 +55</option>
                                  <option value="+27">🇿🇦 +27</option>
                                  <option value="+234">🇳🇬 +234</option>
                                  <option value="+254">🇰🇪 +254</option>
                                  <option value="+63">🇵🇭 +63</option>
                                  <option value="+977">🇳🇵 +977</option>
                                  <option value="+94">🇱🇰 +94</option>
                                  <option value="+880">🇧🇩 +880</option>
                                  <option value="+92">🇵🇰 +92</option>
                                </select>
                                <Input id="signup-phone" type="tel" placeholder="9876543210" value={signupPhone} onChange={(e) => { setSignupPhone(e.target.value); setOtpSent(false); setOtpVerified(false); setOtpValue(''); }} required className="flex-1" />
                                {!otpVerified && (
                                  <Button 
                                    type="button" 
                                    variant={otpSent ? 'outline' : 'default'} 
                                    size="sm" 
                                    onClick={handleSendOtp} 
                                    disabled={isSendingOtp || resendTimer > 0} 
                                    className="whitespace-nowrap text-xs px-3"
                                  >
                                    {isSendingOtp ? 'Sending...' : (otpSent ? (resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP') : 'Send OTP')}
                                  </Button>
                                )}
                                {otpVerified && (
                                  <span className="flex items-center text-green-600 text-xs font-medium gap-1 px-2">
                                    <Check className="h-3.5 w-3.5" /> Verified
                                  </span>
                                )}
                              </div>
                            </div>
                            {otpSent && !otpVerified && (
                              <div className="space-y-1.5">
                                <Label htmlFor="signup-otp">Enter OTP</Label>
                                <div className="flex gap-2">
                                  <Input id="signup-otp" type="text" placeholder="Enter OTP" maxLength={6} value={otpValue} onChange={(e) => setOtpValue(e.target.value)} className="flex-1" />
                                  <Button type="button" size="sm" onClick={handleVerifyOtp} disabled={isVerifyingOtp} className="whitespace-nowrap text-xs px-3">
                                    {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div className="space-y-1.5">
                              <Label htmlFor="signup-email">Email <span className="text-gray-400 text-xs">(optional)</span></Label>
                              <Input id="signup-email" type="email" placeholder="your@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="signup-address">Address <span className="text-gray-400 text-xs">(optional)</span></Label>
                              <Input id="signup-address" type="text" placeholder="123 Main Street, City" value={signupAddress} onChange={(e) => setSignupAddress(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="signup-pincode">Pincode <span className="text-red-500">*</span></Label>
                              <Input id="signup-pincode" type="text" placeholder="123456" maxLength={6} value={signupPincode} onChange={(e) => setSignupPincode(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="signup-password">Password <span className="text-red-500">*</span></Label>
                              <Input id="signup-password" type="password" placeholder="Create password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <Button type="submit" className="w-full" disabled={!otpVerified || isSigningUp}>
                              {isSigningUp ? 'Creating Account...' : 'Create Account'}
                            </Button>
                          </form>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Wisdom Feed */}
              <div className="order-2 lg:order-1 space-y-6 lg:overflow-y-auto lg:h-full pb-8 lg:py-8 hide-scrollbar relative group/feed">
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-black">
                    <span className="gold-text">Wisdom</span> Feed
                  </h1>
                  <div className="space-y-1.5">
                    <p className="text-base italic text-gray-600">
                      "{feedVerse.text}"
                      <span className="text-sm not-italic text-[#d4af37] ml-1">— {feedVerse.ref}</span>
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-black">Recent Wisdom Posts</h2>
                  {recentPosts.length === 0 ? (
                    <Card className="elegant-card">
                      <CardContent className="py-12 text-center">
                        <p className="text-gray-600">No posts yet. Be the first to join and share with the community!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {recentPosts.map((post) => <SimplifiedPostCard key={post.id} post={post} />)}
                    </div>
                  )}
                </div>
                {recentPosts.length > 0 && (
                  <div className="hidden lg:flex flex-col items-center gap-1 py-2 animate-bounce">
                    <span className="text-xs text-[#d4af37]/70 tracking-wide uppercase">Scroll for more</span>
                    <ChevronDown className="h-4 w-4 text-[#d4af37]/70" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Bible Modal */}
        {showBibleModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowBibleModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl border border-[#d4af37]/30 w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-black px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Book className="h-6 w-6 text-[#d4af37]" />
                  <h2 className="text-lg font-semibold text-white">Read Holy Bible</h2>
                </div>
                <button onClick={() => setShowBibleModal(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
              <div className="p-6 space-y-3">
                <p className="text-sm text-gray-500 text-center mb-4">Choose your preferred language to start reading</p>
                <button onClick={() => { setShowBibleModal(false); navigate('/bible?lang=en'); }} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all duration-200 group cursor-pointer text-left">
                  <div className="h-11 w-11 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-colors">
                    <span className="text-lg font-bold text-blue-700 group-hover:text-[#d4af37] transition-colors">En</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#d4af37] transition-colors">English</h3>
                    <p className="text-xs text-gray-400">King James Version (KJV)</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-gray-300 group-hover:text-[#d4af37] transition-colors" />
                </button>
                <button onClick={() => { setShowBibleModal(false); navigate('/bible?lang=ml'); }} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all duration-200 group cursor-pointer text-left">
                  <div className="h-11 w-11 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-colors">
                    <span className="text-lg font-bold text-green-700 group-hover:text-[#d4af37] transition-colors">Ma</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#d4af37] transition-colors">Malayalam</h3>
                    <p className="text-xs text-gray-400">സത്യവദപുസ്തകം (IRV)</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-gray-300 group-hover:text-[#d4af37] transition-colors" />
                </button>
              </div>
              <div className="px-6 pb-5">
                <p className="text-[10px] text-gray-400 text-center">Powered by Bible API</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}