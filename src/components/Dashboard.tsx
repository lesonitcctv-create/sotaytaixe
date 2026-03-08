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
    <div className="space-y-6">
      {/* Monthly Stats */}
      <div>
        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Tháng {currentMonth + 1}/{currentYear}
        </h3>
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Số Lần Sạc</CardTitle>
              <BatteryCharging className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-2xl font-bold">{monthSessionsCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Năng Lượng</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-2xl font-bold">{monthEnergy.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">kWh</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Chi Phí</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-2xl font-bold truncate" title={`${monthCost.toLocaleString()} VND`}>
                {(monthCost / 1000).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">k</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Lợi Nhuận</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className={`text-xl md:text-2xl font-bold truncate ${monthProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} title={`${monthProfit.toLocaleString()} VND`}>
                {(monthProfit / 1000).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">k</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Time Stats */}
      <div>
        <h3 className="text-lg font-medium mb-3">Tổng Quan</h3>
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Tổng Sạc</CardTitle>
              <BatteryCharging className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-2xl font-bold">{totalSessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Tổng Điện</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-2xl font-bold">{totalEnergy.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">kWh</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Tổng Chi</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-2xl font-bold truncate">
                 {(totalCost / 1000000).toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Tr</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Tổng Thu</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-2xl font-bold truncate">
                {(totalRevenue / 1000000).toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Tr</span>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-4 bg-slate-50 dark:bg-slate-900/50 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lợi Nhuận Ròng Tổng Cộng</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">VND</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
