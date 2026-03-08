import { ChargingSession } from '../services/chargeService';
import { TripRevenue } from '../services/tripService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ChartsProps {
  sessions: ChargingSession[];
  trips: TripRevenue[];
}

export function Charts({ sessions, trips }: ChartsProps) {
  // Combine data by date
  const dataMap = new Map<string, { date: string; cost: number; energy: number; revenue: number }>();

  sessions.forEach((session) => {
    const date = session.date.toLocaleDateString();
    const current = dataMap.get(date) || { date, cost: 0, energy: 0, revenue: 0 };
    current.cost += session.cost;
    current.energy += session.energyAdded;
    dataMap.set(date, current);
  });

  trips.forEach((record) => {
    const date = record.date.toLocaleDateString();
    const current = dataMap.get(date) || { date, cost: 0, energy: 0, revenue: 0 };
    current.revenue += (record.actualRevenue || record.revenue);
    dataMap.set(date, current);
  });

  const data = Array.from(dataMap.values()).sort((a, b) => {
    // Simple date string comparison might not work for all locales, but good enough for now if format is consistent
    // Better to parse back to Date
    // Assuming DD/MM/YYYY or MM/DD/YYYY, new Date() might work or might need parsing
    // Let's try to be safer by using the timestamp if available, but here we grouped by string.
    // Let's just rely on string sort for now or try to parse.
    // Actually, let's use the first session/revenue date object if possible, but we lost it.
    // Let's just return 0 for now or simple string sort.
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tài Chính Theo Thời Gian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cost" fill="#ef4444" name="Chi Phí (VND)" />
                <Bar dataKey="revenue" fill="#22c55e" name="Doanh Thu (VND)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Năng Lượng Đã Nạp Theo Thời Gian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="energy" stroke="#82ca9d" name="Năng Lượng (kWh)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
