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
  Calculator 
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
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 h-14 flex items-center justify-between">
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

      <main className="flex-1 container max-w-5xl mx-auto p-4 pb-20 md:pb-8">
        {!user ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Chào mừng bác tài!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Ứng dụng hỗ trợ theo dõi lịch sử sạc, quản lý doanh thu và tính cước taxi dành riêng cho tài xế VinFast.
            </p>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md max-w-md mx-auto">
                {error}
              </div>
            )}
            <Button size="lg" onClick={signIn}>
              Bắt Đầu Ngay
            </Button>
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
                <TaxiFareCalculator />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t h-16 flex items-center justify-around px-2 md:hidden safe-area-bottom">
          <NavItem tab="dashboard" icon={LayoutDashboard} label="Tổng quan" />
          <NavItem tab="charging" icon={Zap} label="Sạc xe" />
          <NavItem tab="revenue" icon={DollarSign} label="Doanh thu" />
          <NavItem tab="charts" icon={BarChart3} label="Biểu đồ" />
          <NavItem tab="taxi" icon={Calculator} label="Tính cước" />
        </nav>
      )}

      {/* Desktop Navigation (Sidebar-like or Top Tabs) - Visible only on MD+ */}
      {user && (
        <div className="hidden md:flex fixed top-14 left-0 right-0 bg-muted/30 border-b px-4 py-2 justify-center gap-2">
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
