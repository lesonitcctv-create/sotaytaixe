import { ChargingSession } from '../services/chargeService';
import { TripRevenue } from '../services/tripService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BatteryCharging, Zap, DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface DashboardProps {
  sessions: ChargingSession[];
  trips: TripRevenue[];
}

export function Dashboard({ sessions, trips }: DashboardProps) {
  // All time stats
  const totalSessions = sessions.length;
  const totalEnergy = sessions.reduce((sum, session) => sum + session.energyAdded, 0);
  const totalCost = sessions.reduce((sum, session) => sum + session.cost, 0);
  
  const totalRevenue = trips.reduce((sum, record) => {
    return sum + (record.actualRevenue || record.revenue);
  }, 0);
  
  const totalProfit = totalRevenue - totalCost;

  // Current Month stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthSessions = sessions.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const thisMonthTrips = trips.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthSessionsCount = thisMonthSessions.length;
  const monthEnergy = thisMonthSessions.reduce((sum, session) => sum + session.energyAdded, 0);
  const monthCost = thisMonthSessions.reduce((sum, session) => sum + session.cost, 0);
  
  const monthRevenue = thisMonthTrips.reduce((sum, record) => {
    return sum + (record.actualRevenue || record.revenue);
  }, 0);
  
  const monthProfit = monthRevenue - monthCost;

  return (
    <div className="space-y-8">
      {/* Monthly Stats */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Thống Kê Tháng {currentMonth + 1}/{currentYear}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số Lần Sạc (Tháng)</CardTitle>
              <BatteryCharging className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthSessionsCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Năng Lượng (Tháng)</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthEnergy.toFixed(2)} kWh</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chi Phí (Tháng)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthCost.toLocaleString()} VND</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lợi Nhuận (Tháng)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthProfit.toLocaleString()} VND
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Time Stats */}
      <div>
        <h3 className="text-lg font-medium mb-4">Tổng Quan Tất Cả</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Số Lần Sạc</CardTitle>
              <BatteryCharging className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground">Lần sạc đã ghi nhận</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Năng Lượng</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnergy.toFixed(2)} kWh</div>
              <p className="text-xs text-muted-foreground">Tổng năng lượng đã nạp</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Chi Phí</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCost.toLocaleString()} VND</div>
              <p className="text-xs text-muted-foreground">Tổng chi tiêu sạc</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} VND</div>
              <p className="text-xs text-muted-foreground">Tổng doanh thu vận hành</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lợi Nhuận Ròng</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit.toLocaleString()} VND
              </div>
              <p className="text-xs text-muted-foreground">Doanh thu - Chi phí sạc</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
