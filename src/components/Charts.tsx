import { useState, useMemo } from 'react';
import { ChargingSession } from '../services/chargeService';
import { TripRevenue } from '../services/tripService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Calendar, Zap, DollarSign, Activity, Clock, Filter } from 'lucide-react';
import { format, subDays, isAfter, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChartsProps {
  sessions: ChargingSession[];
  trips: TripRevenue[];
}

type TimeRange = '7days' | '30days' | 'month' | 'all';

export function Charts({ sessions, trips }: ChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;

    if (timeRange === '7days') startDate = subDays(now, 7);
    else if (timeRange === '30days') startDate = subDays(now, 30);
    else if (timeRange === 'month') startDate = startOfMonth(now);

    const filteredSessions = startDate 
      ? sessions.filter(s => isAfter(new Date(s.date), startDate!))
      : sessions;
    
    const filteredTrips = startDate
      ? trips.filter(t => isAfter(new Date(t.date), startDate!))
      : trips;

    return { sessions: filteredSessions, trips: filteredTrips };
  }, [sessions, trips, timeRange]);

  const dailyData = useMemo(() => {
    const dataMap = new Map<string, { date: string; cost: number; energy: number; revenue: number; profit: number }>();
    
    // Initialize with all days in range if not 'all'
    if (timeRange !== 'all') {
      const now = new Date();
      let start = subDays(now, 30);
      if (timeRange === '7days') start = subDays(now, 7);
      if (timeRange === 'month') start = startOfMonth(now);
      
      const days = eachDayOfInterval({ start, end: now });
      days.forEach(day => {
        const dateStr = format(day, 'dd/MM');
        dataMap.set(dateStr, { date: dateStr, cost: 0, energy: 0, revenue: 0, profit: 0 });
      });
    }

    filteredData.sessions.forEach((session) => {
      const dateStr = format(new Date(session.date), 'dd/MM');
      const current = dataMap.get(dateStr) || { date: dateStr, cost: 0, energy: 0, revenue: 0, profit: 0 };
      current.cost += session.cost;
      current.energy += session.energyAdded;
      current.profit -= session.cost;
      dataMap.set(dateStr, current);
    });

    filteredData.trips.forEach((record) => {
      const dateStr = format(new Date(record.date), 'dd/MM');
      const current = dataMap.get(dateStr) || { date: dateStr, cost: 0, energy: 0, revenue: 0, profit: 0 };
      const revenue = record.actualRevenue || record.revenue;
      current.revenue += revenue;
      current.profit += revenue;
      dataMap.set(dateStr, current);
    });

    return Array.from(dataMap.values()).sort((a, b) => {
      // Since we use dd/MM, sorting is tricky. If we have a lot of data, we should use full date for sorting.
      return 0; // The eachDayOfInterval already provides sorted keys if we initialize correctly
    });
  }, [filteredData, timeRange]);

  const locationData = useMemo(() => {
    const locMap = new Map<string, number>();
    filteredData.sessions.forEach(s => {
      const loc = s.location || 'Không xác định';
      locMap.set(loc, (locMap.get(loc) || 0) + 1);
    });
    return Array.from(locMap.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredData.sessions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const sessionStats = useMemo(() => {
    return filteredData.sessions.map(s => ({
      date: format(new Date(s.date), 'dd/MM'),
      costPerKwh: s.energyAdded > 0 ? s.cost / s.energyAdded : 0,
      chargingSpeed: s.duration > 0 ? (s.energyAdded / (s.duration / 60)) : 0,
      batteryGain: s.batteryLevelEnd - s.batteryLevelStart,
      energy: s.energyAdded,
      cost: s.cost
    })).reverse();
  }, [filteredData.sessions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg text-sm">
          <p className="font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Phân Tích Dữ Liệu</h2>
          <p className="text-muted-foreground">Theo dõi hiệu suất sạc và doanh thu của bạn.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg self-start">
          <button 
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === '7days' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
          >
            7 Ngày
          </button>
          <button 
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === '30days' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
          >
            30 Ngày
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === 'month' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
          >
            Tháng Này
          </button>
          <button 
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === 'all' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
          >
            Tất Cả
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.trips.reduce((sum, t) => sum + (t.actualRevenue || t.revenue), 0).toLocaleString()} <span className="text-xs font-normal">đ</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Chi Phí Sạc</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.sessions.reduce((sum, s) => sum + s.cost, 0).toLocaleString()} <span className="text-xs font-normal">đ</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Năng Lượng Tiêu Thụ</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.sessions.reduce((sum, s) => sum + s.energyAdded, 0).toFixed(1)} <span className="text-xs font-normal">kWh</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời Gian Sạc</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(filteredData.sessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1)} <span className="text-xs font-normal">giờ</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tài Chính Theo Ngày</CardTitle>
            <CardDescription>So sánh doanh thu và chi phí sạc</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="revenue" name="Doanh Thu" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" unit=" đ" />
                  <Area type="monotone" dataKey="cost" name="Chi Phí" stroke="#ef4444" fillOpacity={1} fill="url(#colorCost)" unit=" đ" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Địa Điểm Sạc</CardTitle>
            <CardDescription>Phân bố các lần sạc theo địa điểm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hiệu Suất Sạc</CardTitle>
            <CardDescription>Giá mỗi kWh và Tốc độ sạc (kWh/h)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessionStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" />
                  <Line yAxisId="left" type="monotone" dataKey="costPerKwh" name="Giá/kWh" stroke="#f59e0b" strokeWidth={2} dot={{r: 4}} unit=" đ" />
                  <Line yAxisId="right" type="monotone" dataKey="chargingSpeed" name="Tốc độ sạc" stroke="#3b82f6" strokeWidth={2} dot={{r: 4}} unit=" kWh/h" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Năng Lượng Nạp</CardTitle>
            <CardDescription>Lượng điện nạp mỗi lần (kWh)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="energy" name="Năng Lượng" fill="#10b981" radius={[4, 4, 0, 0]} unit=" kWh" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
