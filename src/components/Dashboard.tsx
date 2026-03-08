import { ChargingSession } from '../services/chargeService';
import { DailyRevenue } from '../services/revenueService';
import { TripRevenue } from '../services/tripService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BatteryCharging, Zap, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardProps {
  sessions: ChargingSession[];
  revenues: DailyRevenue[];
  trips: TripRevenue[];
}

export function Dashboard({ sessions, revenues, trips }: DashboardProps) {
  const totalSessions = sessions.length;
  const totalEnergy = sessions.reduce((sum, session) => sum + session.energyAdded, 0);
  const totalCost = sessions.reduce((sum, session) => sum + session.cost, 0);
  
  // Calculate total revenue from both daily records and individual trips
  const totalDailyRevenue = revenues.reduce((sum, record) => sum + record.revenue, 0);
  const totalTripRevenue = trips.reduce((sum, record) => sum + record.revenue, 0);
  const totalRevenue = totalDailyRevenue + totalTripRevenue;
  
  const totalProfit = totalRevenue - totalCost;

  const avgCostPerKwh = totalEnergy > 0 ? totalCost / totalEnergy : 0;

  return (
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
  );
}
