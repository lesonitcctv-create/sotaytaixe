import { useState } from 'react';
import { ChargingSession } from '../services/chargeService';
import { TripRevenue } from '../services/tripService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BatteryCharging, Zap, DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface DashboardProps {
  sessions: ChargingSession[];
  trips: TripRevenue[];
}

export function Dashboard({ sessions, trips }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [yearStr, monthStr] = selectedDate.split('-');
  const selectedYear = parseInt(yearStr, 10);
  const selectedMonth = parseInt(monthStr, 10) - 1;

  // Find all unique months from data
  const allDates = [...sessions.map(s => s.date), ...trips.map(t => t.date)];
  const uniqueMonths = Array.from(new Set(allDates.map(d => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  })));
  
  // Ensure current month is always in the list
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  if (!uniqueMonths.includes(currentMonthStr)) {
    uniqueMonths.push(currentMonthStr);
  }
  
  // Sort descending (newest first)
  uniqueMonths.sort().reverse();

  // All time stats
  const totalSessions = sessions.length;
  const totalEnergy = sessions.reduce((sum, session) => sum + session.energyAdded, 0);
  const totalCost = sessions.reduce((sum, session) => sum + session.cost, 0);
  
  const totalRevenue = trips.reduce((sum, record) => {
    return sum + (record.actualRevenue || record.revenue);
  }, 0);
  
  const totalProfit = totalRevenue - totalCost;

  // Selected Month stats
  const thisMonthSessions = sessions.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const thisMonthTrips = trips.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
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
      {/* Monthly Stats Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50">
              <Calendar className="h-5 w-5 text-[#00a1e4]" />
            </div>
            <h3 className="text-xl font-black text-[#003d71] uppercase tracking-tight">
              Tháng {selectedMonth + 1}/{selectedYear}
            </h3>
          </div>
          <select 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex h-10 w-40 rounded-full border-none bg-white shadow-sm px-4 py-2 text-sm font-bold text-[#003d71] transition-all focus:ring-2 focus:ring-[#00a1e4] cursor-pointer"
          >
            {uniqueMonths.map(m => {
              const [y, mo] = m.split('-');
              return (
                <option key={m} value={m}>Tháng {parseInt(mo, 10)}/{y}</option>
              );
            })}
          </select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-blue-50 text-[#00a1e4]">
                  <BatteryCharging className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số lần sạc</p>
                <h4 className="text-3xl font-black text-[#003d71]">{monthSessionsCount}</h4>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-yellow-50 text-yellow-500">
                  <Zap className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Năng lượng</p>
                <h4 className="text-3xl font-black text-[#003d71]">
                  {monthEnergy.toFixed(1)} <span className="text-sm font-bold text-slate-300">kWh</span>
                </h4>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-red-50 text-red-500">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chi phí sạc</p>
                <h4 className="text-3xl font-black text-[#003d71]">
                  {(monthCost / 1000).toLocaleString()} <span className="text-sm font-bold text-slate-300">k</span>
                </h4>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${monthProfit >= 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lợi nhuận</p>
                <h4 className={`text-3xl font-black ${monthProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(monthProfit / 1000).toLocaleString()} <span className="text-sm font-bold text-slate-300">k</span>
                </h4>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Time Stats Section */}
      <div className="space-y-4">
        <div className="px-1">
          <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">Tổng quan sự nghiệp</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#003d71] to-[#002a4d] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp className="w-32 h-32" />
              </div>
              <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">Tổng doanh thu</p>
              <h4 className="text-4xl font-black mb-1">{(totalRevenue / 1000000).toFixed(2)} <span className="text-xl font-medium opacity-60">Tr</span></h4>
              <p className="text-sm text-blue-100/60 font-medium">Tích lũy từ {totalSessions} phiên sạc</p>
            </div>

            <div className="p-6 rounded-3xl bg-white shadow-sm border border-slate-100 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tổng điện nạp</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-black text-[#003d71]">{totalEnergy.toFixed(0)}</h4>
                <span className="text-sm font-bold text-slate-300 uppercase">kWh</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00a1e4] h-full w-3/4 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#00a1e4] text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 p-4 opacity-20">
              <DollarSign className="w-24 h-24" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-2">Lợi nhuận ròng</p>
              <h4 className="text-4xl font-black leading-tight">
                {totalProfit.toLocaleString()}
                <span className="block text-sm font-medium opacity-70 mt-1 uppercase tracking-tighter">Việt Nam Đồng</span>
              </h4>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
              <Zap className="w-3 h-3 fill-current" />
              Hiệu suất cực tốt
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
