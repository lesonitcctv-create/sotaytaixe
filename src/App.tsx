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
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading, signIn, logout, error } = useAuth();
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [trips, setTrips] = useState<TripRevenue[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sổ Tay Tài Xế VinFast</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">
              Xin chào, {user.displayName}
            </span>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng Xuất
            </Button>
          </div>
        ) : (
          <Button onClick={signIn}>
            <LogIn className="mr-2 h-4 w-4" />
            Đăng Nhập với Google
          </Button>
        )}
      </header>

      <main className="space-y-8">
        {!user ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Chào mừng đến với Sổ Tay Tài Xế VinFast</h2>
            <p className="text-muted-foreground mb-8">
              Vui lòng đăng nhập để theo dõi lịch sử sạc và xem thống kê.
            </p>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md max-w-md mx-auto">
                {error}
              </div>
            )}
            <Button size="lg" onClick={signIn}>
              Bắt Đầu
            </Button>
          </div>
        ) : (
          <>
            <Dashboard sessions={sessions} trips={trips} />
            
            <Tabs defaultValue="charging" className="space-y-4">
              <TabsList>
                <TabsTrigger value="charging">Sạc Xe</TabsTrigger>
                <TabsTrigger value="trip-revenue">Doanh Thu Chuyến</TabsTrigger>
                <TabsTrigger value="charts">Biểu Đồ</TabsTrigger>
              </TabsList>

              <TabsContent value="charging" className="space-y-4">
                <div className="grid gap-8 md:grid-cols-2">
                  <ChargeForm onSessionAdded={fetchData} />
                  <ChargeList sessions={sessions} onSessionDeleted={fetchData} />
                </div>
              </TabsContent>

              <TabsContent value="trip-revenue" className="space-y-4">
                <div className="grid gap-8 md:grid-cols-2">
                  <TripForm onRecordAdded={fetchData} />
                  <TripList records={trips} onRecordDeleted={fetchData} />
                </div>
              </TabsContent>

              <TabsContent value="charts" className="space-y-4">
                <Charts sessions={sessions} trips={trips} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
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
