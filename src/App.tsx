import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChargingSession, getChargingSessions } from './services/chargeService';
import { TripRevenue, getTripRevenues } from './services/tripService';
import { Dashboard } from './components/Dashboard';
import { ChargeForm } from './components/ChargeForm';
import { ChargeList } from './components/ChargeList';
import { TripForm } from './components/TripForm';
import { TripList } from './components/TripList';
import { Charts } from './components/Charts';
import { TaxiFareCalculator } from './components/TaxiFareCalculator';
import { Button } from './components/ui/button';
import { 
  LogIn, 
  LogOut, 
  Loader2, 
  LayoutDashboard, 
  Zap, 
  DollarSign, 
  BarChart3, 
  Calculator,
  Download,
  X,
  Share
} from 'lucide-react';
import { cn } from './lib/utils';

type Tab = 'dashboard' | 'charging' | 'revenue' | 'charts' | 'taxi';

function AppContent() {
  const { user, loading, signIn, logout, error } = useAuth();
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [trips, setTrips] = useState<TripRevenue[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripRevenue | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for the install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    });

    // If iOS and not already in standalone mode, show instructions
    if (isIOSDevice && !(window.navigator as any).standalone) {
      setShowInstallBanner(true);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const fetchData = async () => {
    if (user) {
      setDataLoading(true);
      try {
        const [sessionsData, tripsData] = await Promise.all([
          getChargingSessions(user.uid),
          getTripRevenues(user.uid),
        ]);
        setSessions(sessionsData);
        setTrips(tripsData);
        
        // Auto-sync to Google Sheets in the background
        fetch('/api/sync-sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessions: sessionsData, trips: tripsData }),
        }).catch(err => console.error('Auto-sync failed:', err));
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setDataLoading(false);
      }
    } else {
      setSessions([]);
      setTrips([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const NavItem = ({ tab, icon: Icon, label }: { tab: Tab; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        "flex flex-col items-center justify-center w-full py-2 text-xs font-medium transition-colors",
        activeTab === tab 
          ? "text-primary" 
          : "text-muted-foreground hover:text-primary/80"
      )}
    >
      <Icon className={cn("h-5 w-5 mb-1", activeTab === tab && "fill-current/20")} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight md:text-xl">Sổ Tay Tài Xế</h1>
        </div>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {user.displayName}
            </span>
            <Button variant="ghost" size="icon" onClick={logout} title="Đăng xuất">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={signIn}>
            <LogIn className="mr-2 h-4 w-4" />
            Đăng Nhập
          </Button>
        )}
      </header>

      {/* Desktop Navigation (Sidebar-like or Top Tabs) - Visible only on MD+ */}
      {user && (
        <div className="hidden md:flex sticky top-14 z-10 bg-white border-b px-4 py-2 justify-center gap-2">
           <Button 
            variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('dashboard')}
            className="gap-2"
           >
             <LayoutDashboard className="h-4 w-4" /> Tổng quan
           </Button>
           <Button 
            variant={activeTab === 'charging' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('charging')}
            className="gap-2"
           >
             <Zap className="h-4 w-4" /> Sạc xe
           </Button>
           <Button 
            variant={activeTab === 'revenue' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('revenue')}
            className="gap-2"
           >
             <DollarSign className="h-4 w-4" /> Doanh thu
           </Button>
           <Button 
            variant={activeTab === 'charts' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('charts')}
            className="gap-2"
           >
             <BarChart3 className="h-4 w-4" /> Biểu đồ
           </Button>
           <Button 
            variant={activeTab === 'taxi' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('taxi')}
            className="gap-2"
           >
             <Calculator className="h-4 w-4" /> Tính cước
           </Button>
        </div>
      )}

      <main className="flex-1 container max-w-5xl mx-auto p-4 pb-20 md:pb-8">
        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#003d71] to-[#00a1e4] text-white shadow-lg relative overflow-hidden animate-in slide-in-from-top duration-500">
            <button 
              onClick={() => setShowInstallBanner(false)}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                <Download className="h-6 w-6" />
              </div>
              <div className="flex-1 pr-6">
                <h4 className="font-bold text-sm uppercase tracking-tight">Cài đặt ứng dụng</h4>
                <p className="text-xs text-blue-50 opacity-90">
                  {isIOS 
                    ? "Nhấn nút 'Chia sẻ' rồi chọn 'Thêm vào MH chính' để cài đặt." 
                    : "Cài đặt ứng dụng vào màn hình chính để truy cập nhanh hơn."}
                </p>
              </div>
              {!isIOS && deferredPrompt && (
                <Button 
                  size="sm" 
                  onClick={handleInstallClick}
                  className="bg-white text-[#003d71] hover:bg-blue-50 font-bold rounded-full px-4"
                >
                  Cài đặt
                </Button>
              )}
              {isIOS && (
                <div className="p-2 bg-white/20 rounded-lg">
                  <Share className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        )}

        {!user ? (
          <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden">
            {/* Background Image/Gradient */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#eef6f9] via-white to-[#f0f9ff]" />
              <img 
                src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=2072" 
                className="absolute right-0 bottom-0 w-full h-full object-cover object-right opacity-40 md:opacity-60 mix-blend-multiply"
                alt="VinFast Driver"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent md:hidden" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full">
              <div className="max-w-2xl space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide uppercase">
                    <Zap className="h-4 w-4 fill-current" />
                    Dành riêng cho tài xế VinFast
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-[#003d71] leading-[1.1] tracking-tight uppercase">
                    Sổ tay tài xế - <br />
                    <span className="text-[#00a1e4]">Công cụ đắc lực</span>
                  </h2>
                  <p className="text-lg md:text-xl text-slate-600 font-medium max-w-lg">
                    Quản lý sạc, doanh thu, hỗ trợ và tính cước trên nền tảng web hiện đại.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                  {[
                    { icon: LayoutDashboard, label: "Quản lý doanh thu" },
                    { icon: BarChart3, label: "Biểu đồ chi tiết" },
                    { icon: Calculator, label: "Tính cước nhanh" },
                    { icon: Zap, label: "Bản đồ trạm sạc" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-2">
                      <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-[10px] md:text-xs font-bold uppercase text-slate-500">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 max-w-md">
                  <Button 
                    size="lg" 
                    onClick={signIn} 
                    className="h-16 rounded-full text-xl font-black uppercase tracking-wider shadow-[0_8px_30px_rgb(0,161,228,0.3)] hover:shadow-[0_8px_30px_rgb(0,161,228,0.5)] bg-[#00a1e4] hover:bg-[#008bc5] transition-all hover:-translate-y-1 active:scale-95"
                  >
                    Bắt đầu ngay
                  </Button>
                  
                  <button 
                    onClick={signIn}
                    className="flex items-center justify-center gap-3 h-16 px-6 rounded-full bg-white border-2 border-slate-100 shadow-sm hover:border-primary/30 transition-all group"
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-50">
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                    <span className="text-sm md:text-base font-bold text-slate-700 uppercase tracking-tight group-hover:text-primary transition-colors">
                      Đăng nhập bằng tài khoản Google
                    </span>
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-shake">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-8 left-6 md:left-12 lg:left-24 z-10 flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <Zap className="h-6 w-6 text-white fill-current" />
              </div>
              <span className="text-xl font-black text-[#003d71] tracking-tighter italic">XANH <span className="text-[#00a1e4]">SM</span></span>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {activeTab === 'dashboard' && (
              <Dashboard sessions={sessions} trips={trips} />
            )}

            {activeTab === 'charging' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <ChargeForm onSessionAdded={fetchData} />
                <ChargeList sessions={sessions} onSessionDeleted={fetchData} />
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <TripForm 
                  onRecordAdded={() => {
                      fetchData();
                      setEditingTrip(null);
                  }} 
                  editingTrip={editingTrip}
                  onCancelEdit={() => setEditingTrip(null)}
                />
                <TripList 
                  records={trips} 
                  onRecordDeleted={fetchData} 
                  onEdit={(trip) => {
                    setEditingTrip(trip);
                    // Scroll to top to see form
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}

            {activeTab === 'charts' && (
              <Charts sessions={sessions} trips={trips} />
            )}

            {activeTab === 'taxi' && (
              <div className="flex justify-center">
                <TaxiFareCalculator userId={user?.uid} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t h-16 flex items-center justify-around px-2 md:hidden safe-area-bottom">
          <NavItem tab="dashboard" icon={LayoutDashboard} label="Tổng quan" />
          <NavItem tab="charging" icon={Zap} label="Sạc xe" />
          <NavItem tab="revenue" icon={DollarSign} label="Doanh thu" />
          <NavItem tab="charts" icon={BarChart3} label="Biểu đồ" />
          <NavItem tab="taxi" icon={Calculator} label="Tính cước" />
        </nav>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
